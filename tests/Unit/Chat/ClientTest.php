<?php

declare(strict_types=1);

namespace Tests\Unit\Chat;

use App\Chat\Client;
use App\Chat\Message;
use PHPUnit\Framework\TestCase;
use Ratchet\ConnectionInterface;

final class ClientTest extends TestCase
{
    private ConnectionInterface $mockConnection;

    protected function setUp(): void
    {
        $this->mockConnection = $this->createMock(ConnectionInterface::class);
    }

    public function testConstructorGeneratesUniqueId(): void
    {
        $client1 = new Client($this->mockConnection);
        $client2 = new Client($this->mockConnection);

        $this->assertNotEmpty($client1->id);
        $this->assertNotEmpty($client2->id);
        $this->assertNotSame($client1->id, $client2->id);
    }

    public function testDefaultValues(): void
    {
        $client = new Client($this->mockConnection);

        $this->assertSame('', $client->userId);
        $this->assertSame('Anonymous', $client->username);
        $this->assertSame('general', $client->conversationId);
    }

    public function testIsIdentifiedReturnsFalseByDefault(): void
    {
        $client = new Client($this->mockConnection);

        $this->assertFalse($client->isIdentified());
    }

    public function testIsIdentifiedReturnsTrueWhenUserIdSet(): void
    {
        $client = new Client($this->mockConnection);
        $client->userId = 'user-123';

        $this->assertTrue($client->isIdentified());
    }

    public function testSendWithArray(): void
    {
        $this->mockConnection
            ->expects($this->once())
            ->method('send')
            ->with('{"type":"test","data":"value"}');

        $client = new Client($this->mockConnection);
        $client->send(['type' => 'test', 'data' => 'value']);
    }

    public function testSendWithMessage(): void
    {
        $message = Message::create(
            conversationId: 'conv',
            userId: 'user',
            username: 'Test',
            content: 'Hello',
        );

        $this->mockConnection
            ->expects($this->once())
            ->method('send')
            ->with($this->callback(function ($json) use ($message) {
                $data = json_decode($json, true);
                return $data['id'] === $message->id
                    && $data['content'] === 'Hello'
                    && $data['username'] === 'Test';
            }));

        $client = new Client($this->mockConnection);
        $client->send($message);
    }

    public function testConnectionPropertyIsReadonly(): void
    {
        $client = new Client($this->mockConnection);

        $this->assertSame($this->mockConnection, $client->connection);

        $reflection = new \ReflectionProperty($client, 'connection');
        $this->assertTrue($reflection->isReadOnly());
    }

    public function testPropertiesCanBeModified(): void
    {
        $client = new Client($this->mockConnection);

        $client->userId = 'new-user-id';
        $client->username = 'NewUsername';
        $client->conversationId = 'new-room';

        $this->assertSame('new-user-id', $client->userId);
        $this->assertSame('NewUsername', $client->username);
        $this->assertSame('new-room', $client->conversationId);
    }
}
