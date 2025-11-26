<?php

declare(strict_types=1);

namespace App\Chat;

use Ratchet\ConnectionInterface;
use Ramsey\Uuid\Uuid;

final class Client
{
    public readonly string $id;
    public string $userId;
    public string $username;
    public string $conversationId;

    public function __construct(
        public readonly ConnectionInterface $connection,
    ) {
        $this->id = Uuid::uuid4()->toString();
        $this->userId = '';
        $this->username = 'Anonymous';
        $this->conversationId = 'general';
    }

    public function isIdentified(): bool
    {
        return $this->userId !== '';
    }

    public function send(array|Message $data): void
    {
        $json = json_encode($data, JSON_THROW_ON_ERROR);
        $this->connection->send($json);
    }
}
