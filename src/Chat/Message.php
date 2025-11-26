<?php

declare(strict_types=1);

namespace App\Chat;

use DateTimeImmutable;
use JsonSerializable;
use Ramsey\Uuid\Uuid;

final readonly class Message implements JsonSerializable
{
    public function __construct(
        public string $id,
        public string $conversationId,
        public string $userId,
        public string $username,
        public string $content,
        public string $type,
        public DateTimeImmutable $timestamp,
    ) {}

    public static function create(
        string $conversationId,
        string $userId,
        string $username,
        string $content,
        string $type = 'message',
    ): self {
        return new self(
            id: Uuid::uuid4()->toString(),
            conversationId: $conversationId,
            userId: $userId,
            username: $username,
            content: $content,
            type: $type,
            timestamp: new DateTimeImmutable(),
        );
    }

    public static function fromArray(array $data): self
    {
        return new self(
            id: $data['id'] ?? Uuid::uuid4()->toString(),
            conversationId: $data['conversationId'] ?? 'general',
            userId: $data['userId'] ?? '',
            username: $data['username'] ?? 'Anonymous',
            content: $data['content'] ?? '',
            type: $data['type'] ?? 'message',
            timestamp: isset($data['timestamp'])
                ? new DateTimeImmutable($data['timestamp'])
                : new DateTimeImmutable(),
        );
    }

    public static function system(string $content, string $conversationId = 'general'): self
    {
        return self::create(
            conversationId: $conversationId,
            userId: 'system',
            username: 'System',
            content: $content,
            type: 'system',
        );
    }

    public function jsonSerialize(): array
    {
        return [
            'id' => $this->id,
            'conversationId' => $this->conversationId,
            'userId' => $this->userId,
            'username' => $this->username,
            'content' => $this->content,
            'type' => $this->type,
            'timestamp' => $this->timestamp->format('c'),
        ];
    }
}
