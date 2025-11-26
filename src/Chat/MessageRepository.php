<?php

declare(strict_types=1);

namespace App\Chat;

use App\Database\Connection;
use PDO;
use Psr\Log\LoggerInterface;

final class MessageRepository
{
    private PDO $db;

    public function __construct(
        private readonly ?LoggerInterface $logger = null,
    ) {
        $this->db = Connection::getInstance($this->logger);
    }

    public function save(Message $message): bool
    {
        try {
            $stmt = $this->db->prepare('
                INSERT INTO messages (id, conversation_id, user_id, username, content, type, created_at)
                VALUES (:id, :conversation_id, :user_id, :username, :content, :type, :created_at)
            ');

            $result = $stmt->execute([
                'id' => $message->id,
                'conversation_id' => $message->conversationId,
                'user_id' => $message->userId,
                'username' => $message->username,
                'content' => $message->content,
                'type' => $message->type,
                'created_at' => $message->timestamp->format('Y-m-d H:i:s'),
            ]);

            $this->logger?->debug('Message saved', ['id' => $message->id]);

            return $result;
        } catch (\PDOException $e) {
            $this->logger?->error('Failed to save message', [
                'error' => $e->getMessage(),
                'message_id' => $message->id,
            ]);
            return false;
        }
    }

    public function getByConversation(string $conversationId, int $limit = 50, int $offset = 0): array
    {
        try {
            $stmt = $this->db->prepare('
                SELECT * FROM messages
                WHERE conversation_id = :conversation_id
                ORDER BY created_at DESC
                LIMIT :limit OFFSET :offset
            ');

            $stmt->bindValue('conversation_id', $conversationId);
            $stmt->bindValue('limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue('offset', $offset, PDO::PARAM_INT);
            $stmt->execute();

            $rows = $stmt->fetchAll();

            return array_map(
                fn(array $row) => Message::fromArray([
                    'id' => $row['id'],
                    'conversationId' => $row['conversation_id'],
                    'userId' => $row['user_id'],
                    'username' => $row['username'],
                    'content' => $row['content'],
                    'type' => $row['type'],
                    'timestamp' => $row['created_at'],
                ]),
                array_reverse($rows)
            );
        } catch (\PDOException $e) {
            $this->logger?->error('Failed to fetch messages', [
                'error' => $e->getMessage(),
                'conversation_id' => $conversationId,
            ]);
            return [];
        }
    }
}
