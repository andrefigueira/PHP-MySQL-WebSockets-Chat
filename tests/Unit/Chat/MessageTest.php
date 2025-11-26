<?php

declare(strict_types=1);

namespace Tests\Unit\Chat;

use App\Chat\Message;
use DateTimeImmutable;
use PHPUnit\Framework\TestCase;

final class MessageTest extends TestCase
{
    public function testCreateGeneratesValidMessage(): void
    {
        $message = Message::create(
            conversationId: 'test-conv',
            userId: 'user-123',
            username: 'John',
            content: 'Hello, World!',
        );

        $this->assertNotEmpty($message->id);
        $this->assertSame('test-conv', $message->conversationId);
        $this->assertSame('user-123', $message->userId);
        $this->assertSame('John', $message->username);
        $this->assertSame('Hello, World!', $message->content);
        $this->assertSame('message', $message->type);
        $this->assertInstanceOf(DateTimeImmutable::class, $message->timestamp);
    }

    public function testCreateWithCustomType(): void
    {
        $message = Message::create(
            conversationId: 'test-conv',
            userId: 'user-123',
            username: 'John',
            content: 'Hello!',
            type: 'system',
        );

        $this->assertSame('system', $message->type);
    }

    public function testSystemCreatesSystemMessage(): void
    {
        $message = Message::system('User joined the chat', 'my-room');

        $this->assertSame('system', $message->userId);
        $this->assertSame('System', $message->username);
        $this->assertSame('User joined the chat', $message->content);
        $this->assertSame('system', $message->type);
        $this->assertSame('my-room', $message->conversationId);
    }

    public function testSystemDefaultsToGeneralConversation(): void
    {
        $message = Message::system('Hello');

        $this->assertSame('general', $message->conversationId);
    }

    public function testFromArrayCreatesMessageFromData(): void
    {
        $data = [
            'id' => 'msg-456',
            'conversationId' => 'room-1',
            'userId' => 'user-789',
            'username' => 'Alice',
            'content' => 'Test message',
            'type' => 'message',
            'timestamp' => '2024-01-15T10:30:00+00:00',
        ];

        $message = Message::fromArray($data);

        $this->assertSame('msg-456', $message->id);
        $this->assertSame('room-1', $message->conversationId);
        $this->assertSame('user-789', $message->userId);
        $this->assertSame('Alice', $message->username);
        $this->assertSame('Test message', $message->content);
        $this->assertSame('message', $message->type);
    }

    public function testFromArrayUsesDefaults(): void
    {
        $message = Message::fromArray([]);

        $this->assertNotEmpty($message->id);
        $this->assertSame('general', $message->conversationId);
        $this->assertSame('', $message->userId);
        $this->assertSame('Anonymous', $message->username);
        $this->assertSame('', $message->content);
        $this->assertSame('message', $message->type);
    }

    public function testJsonSerializeReturnsCorrectFormat(): void
    {
        $message = Message::create(
            conversationId: 'conv-1',
            userId: 'user-1',
            username: 'Bob',
            content: 'Serialized message',
        );

        $json = $message->jsonSerialize();

        $this->assertArrayHasKey('id', $json);
        $this->assertArrayHasKey('conversationId', $json);
        $this->assertArrayHasKey('userId', $json);
        $this->assertArrayHasKey('username', $json);
        $this->assertArrayHasKey('content', $json);
        $this->assertArrayHasKey('type', $json);
        $this->assertArrayHasKey('timestamp', $json);

        $this->assertSame('conv-1', $json['conversationId']);
        $this->assertSame('user-1', $json['userId']);
        $this->assertSame('Bob', $json['username']);
        $this->assertSame('Serialized message', $json['content']);
        $this->assertSame('message', $json['type']);
        $this->assertMatchesRegularExpression('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/', $json['timestamp']);
    }

    public function testMessageIsImmutable(): void
    {
        $message = Message::create(
            conversationId: 'conv',
            userId: 'user',
            username: 'Test',
            content: 'Content',
        );

        $reflection = new \ReflectionClass($message);
        $this->assertTrue($reflection->isReadOnly());
    }
}
