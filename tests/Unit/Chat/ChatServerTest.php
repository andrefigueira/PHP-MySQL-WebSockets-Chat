<?php

declare(strict_types=1);

namespace Tests\Unit\Chat;

use App\Chat\ChatServer;
use App\Chat\MessageRepository;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Ratchet\ConnectionInterface;

final class ChatServerTest extends TestCase
{
    private MessageRepository $mockRepository;
    private LoggerInterface $mockLogger;
    private ChatServer $server;

    protected function setUp(): void
    {
        $this->mockRepository = $this->createMock(MessageRepository::class);
        $this->mockLogger = $this->createMock(LoggerInterface::class);
        $this->server = new ChatServer($this->mockRepository, $this->mockLogger);
    }

    private function createMockConnection(): ConnectionInterface
    {
        $mock = $this->createMock(ConnectionInterface::class);
        $mock->resourceId = random_int(1, 10000);
        return $mock;
    }

    public function testOnOpenSendsConnectedMessage(): void
    {
        $conn = $this->createMockConnection();

        $conn->expects($this->once())
            ->method('send')
            ->with($this->callback(function ($json) {
                $data = json_decode($json, true);
                return $data['type'] === 'connected'
                    && isset($data['clientId'])
                    && $data['message'] === 'Connected to chat server';
            }));

        $this->mockLogger->expects($this->atLeastOnce())->method('info');

        $this->server->onOpen($conn);
    }

    public function testOnCloseLogsDisconnection(): void
    {
        $conn = $this->createMockConnection();

        $this->mockLogger->expects($this->atLeast(2))
            ->method('info');

        $this->server->onOpen($conn);
        $this->server->onClose($conn);
    }

    public function testOnMessageWithInvalidJsonLogsWarning(): void
    {
        $conn = $this->createMockConnection();

        $this->mockLogger->expects($this->once())
            ->method('warning')
            ->with('Invalid JSON received', $this->anything());

        $this->server->onOpen($conn);
        $this->server->onMessage($conn, 'not valid json');
    }

    public function testOnMessageIdentifyAction(): void
    {
        $conn = $this->createMockConnection();

        $sentMessages = [];
        $conn->method('send')
            ->willReturnCallback(function ($json) use (&$sentMessages) {
                $sentMessages[] = json_decode($json, true);
            });

        $this->server->onOpen($conn);
        $this->server->onMessage($conn, json_encode([
            'action' => 'identify',
            'userId' => 'user-123',
            'username' => 'TestUser',
        ]));

        $identifiedMessage = array_filter($sentMessages, fn($m) => $m['type'] === 'identified');
        $this->assertNotEmpty($identifiedMessage);

        $identified = array_values($identifiedMessage)[0];
        $this->assertSame('user-123', $identified['userId']);
        $this->assertSame('TestUser', $identified['username']);
    }

    public function testOnMessageWithoutIdentificationReturnsError(): void
    {
        $conn = $this->createMockConnection();

        $sentMessages = [];
        $conn->method('send')
            ->willReturnCallback(function ($json) use (&$sentMessages) {
                $sentMessages[] = json_decode($json, true);
            });

        $this->server->onOpen($conn);
        $this->server->onMessage($conn, json_encode([
            'action' => 'message',
            'content' => 'Hello',
        ]));

        $errorMessage = array_filter($sentMessages, fn($m) => $m['type'] === 'error');
        $this->assertNotEmpty($errorMessage);
    }

    public function testOnMessageSavesToRepository(): void
    {
        $conn = $this->createMockConnection();

        $conn->method('send')->willReturn(null);

        $this->mockRepository->expects($this->once())
            ->method('save')
            ->with($this->callback(function ($message) {
                return $message->content === 'Hello, World!'
                    && $message->username === 'TestUser';
            }))
            ->willReturn(true);

        $this->mockRepository->method('getByConversation')->willReturn([]);

        $this->server->onOpen($conn);
        $this->server->onMessage($conn, json_encode([
            'action' => 'identify',
            'userId' => 'user-1',
            'username' => 'TestUser',
        ]));
        $this->server->onMessage($conn, json_encode([
            'action' => 'join',
            'conversationId' => 'general',
        ]));
        $this->server->onMessage($conn, json_encode([
            'action' => 'message',
            'content' => 'Hello, World!',
        ]));
    }

    public function testOnErrorClosesConnection(): void
    {
        $conn = $this->createMockConnection();
        $exception = new \Exception('Test error');

        $conn->expects($this->once())->method('close');

        $this->mockLogger->expects($this->once())
            ->method('error')
            ->with('Connection error', $this->anything());

        $this->server->onError($conn, $exception);
    }

    public function testMessageBroadcastsToOtherClientsInSameConversation(): void
    {
        $conn1 = $this->createMockConnection();
        $conn2 = $this->createMockConnection();

        $conn1Messages = [];
        $conn2Messages = [];

        $conn1->method('send')
            ->willReturnCallback(function ($json) use (&$conn1Messages) {
                $conn1Messages[] = json_decode($json, true);
            });

        $conn2->method('send')
            ->willReturnCallback(function ($json) use (&$conn2Messages) {
                $conn2Messages[] = json_decode($json, true);
            });

        $this->mockRepository->method('save')->willReturn(true);
        $this->mockRepository->method('getByConversation')->willReturn([]);

        $this->server->onOpen($conn1);
        $this->server->onOpen($conn2);

        $this->server->onMessage($conn1, json_encode(['action' => 'identify', 'userId' => 'u1', 'username' => 'User1']));
        $this->server->onMessage($conn2, json_encode(['action' => 'identify', 'userId' => 'u2', 'username' => 'User2']));

        $this->server->onMessage($conn1, json_encode(['action' => 'join', 'conversationId' => 'room']));
        $this->server->onMessage($conn2, json_encode(['action' => 'join', 'conversationId' => 'room']));

        $conn2Messages = [];

        $this->server->onMessage($conn1, json_encode(['action' => 'message', 'content' => 'Hello from User1']));

        $receivedMessage = array_filter($conn2Messages, fn($m) => ($m['type'] ?? '') === 'message' || ($m['content'] ?? '') === 'Hello from User1');
        $this->assertNotEmpty($receivedMessage);
    }

    public function testTypingIndicatorBroadcastsToOthers(): void
    {
        $conn1 = $this->createMockConnection();
        $conn2 = $this->createMockConnection();

        $conn2Messages = [];

        $conn1->method('send')->willReturn(null);
        $conn2->method('send')
            ->willReturnCallback(function ($json) use (&$conn2Messages) {
                $conn2Messages[] = json_decode($json, true);
            });

        $this->mockRepository->method('getByConversation')->willReturn([]);

        $this->server->onOpen($conn1);
        $this->server->onOpen($conn2);

        $this->server->onMessage($conn1, json_encode(['action' => 'identify', 'userId' => 'u1', 'username' => 'User1']));
        $this->server->onMessage($conn2, json_encode(['action' => 'identify', 'userId' => 'u2', 'username' => 'User2']));

        $this->server->onMessage($conn1, json_encode(['action' => 'join', 'conversationId' => 'room']));
        $this->server->onMessage($conn2, json_encode(['action' => 'join', 'conversationId' => 'room']));

        $conn2Messages = [];

        $this->server->onMessage($conn1, json_encode(['action' => 'typing', 'isTyping' => true]));

        $typingMessage = array_filter($conn2Messages, fn($m) => ($m['type'] ?? '') === 'typing');
        $this->assertNotEmpty($typingMessage);

        $typing = array_values($typingMessage)[0];
        $this->assertTrue($typing['isTyping']);
        $this->assertSame('User1', $typing['username']);
    }
}
