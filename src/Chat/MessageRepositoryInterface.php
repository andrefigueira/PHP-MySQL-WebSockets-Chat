<?php

declare(strict_types=1);

namespace App\Chat;

interface MessageRepositoryInterface
{
    public function save(Message $message): bool;

    /**
     * @return Message[]
     */
    public function getByConversation(string $conversationId, int $limit = 50, int $offset = 0): array;
}
