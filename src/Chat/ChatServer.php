<?php

declare(strict_types=1);

namespace App\Chat;

use Psr\Log\LoggerInterface;
use Ratchet\ConnectionInterface;
use Ratchet\MessageComponentInterface;
use SplObjectStorage;

final class ChatServer implements MessageComponentInterface
{
    /** @var SplObjectStorage<ConnectionInterface, Client> */
    private SplObjectStorage $clients;

    public function __construct(
        private readonly MessageRepositoryInterface $repository,
        private readonly LoggerInterface $logger,
    ) {
        $this->clients = new SplObjectStorage();
        $this->logger->info('Chat server initialized');
    }

    public function onOpen(ConnectionInterface $conn): void
    {
        $client = new Client($conn);
        $this->clients->attach($conn, $client);

        $this->logger->info('New connection', [
            'client_id' => $client->id,
            'resource_id' => $conn->resourceId,
        ]);

        $client->send([
            'type' => 'connected',
            'clientId' => $client->id,
            'message' => 'Connected to chat server',
        ]);
    }

    public function onMessage(ConnectionInterface $from, $msg): void
    {
        try {
            $data = json_decode($msg, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException $e) {
            $this->logger->warning('Invalid JSON received', ['error' => $e->getMessage()]);
            return;
        }

        $client = $this->clients[$from];
        $action = $data['action'] ?? 'message';

        match ($action) {
            'identify' => $this->handleIdentify($client, $data),
            'join' => $this->handleJoin($client, $data),
            'message' => $this->handleMessage($client, $data),
            'typing' => $this->handleTyping($client, $data),
            'history' => $this->handleHistory($client, $data),
            default => $this->logger->warning('Unknown action', ['action' => $action]),
        };
    }

    public function onClose(ConnectionInterface $conn): void
    {
        if (!$this->clients->contains($conn)) {
            return;
        }

        $client = $this->clients[$conn];

        if ($client->isIdentified()) {
            $this->broadcast(
                Message::system("{$client->username} has left the chat", $client->conversationId),
                $client->conversationId,
                exclude: $conn
            );
        }

        $this->clients->detach($conn);

        $this->logger->info('Connection closed', [
            'client_id' => $client->id,
            'username' => $client->username,
        ]);
    }

    public function onError(ConnectionInterface $conn, \Exception $e): void
    {
        $this->logger->error('Connection error', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);

        $conn->close();
    }

    private function handleIdentify(Client $client, array $data): void
    {
        $client->userId = $data['userId'] ?? $client->id;
        $client->username = $data['username'] ?? 'Anonymous';

        $this->logger->info('Client identified', [
            'client_id' => $client->id,
            'user_id' => $client->userId,
            'username' => $client->username,
        ]);

        $client->send([
            'type' => 'identified',
            'userId' => $client->userId,
            'username' => $client->username,
        ]);
    }

    private function handleJoin(Client $client, array $data): void
    {
        $conversationId = $data['conversationId'] ?? 'general';
        $client->conversationId = $conversationId;

        $this->logger->info('Client joined conversation', [
            'client_id' => $client->id,
            'conversation_id' => $conversationId,
        ]);

        $client->send([
            'type' => 'joined',
            'conversationId' => $conversationId,
        ]);

        $this->broadcast(
            Message::system("{$client->username} has joined the chat", $conversationId),
            $conversationId,
            exclude: $client->connection
        );

        $this->sendHistory($client, $conversationId);
    }

    private function handleMessage(Client $client, array $data): void
    {
        if (!$client->isIdentified()) {
            $client->send([
                'type' => 'error',
                'message' => 'Please identify yourself first',
            ]);
            return;
        }

        $content = trim($data['content'] ?? '');
        if ($content === '') {
            return;
        }

        $message = Message::create(
            conversationId: $client->conversationId,
            userId: $client->userId,
            username: $client->username,
            content: $content,
        );

        $this->repository->save($message);

        $this->broadcast($message, $client->conversationId);

        $this->logger->debug('Message broadcast', [
            'message_id' => $message->id,
            'conversation_id' => $message->conversationId,
            'from' => $client->username,
        ]);
    }

    private function handleTyping(Client $client, array $data): void
    {
        $isTyping = $data['isTyping'] ?? false;

        $this->broadcast(
            [
                'type' => 'typing',
                'userId' => $client->userId,
                'username' => $client->username,
                'isTyping' => $isTyping,
            ],
            $client->conversationId,
            exclude: $client->connection
        );
    }

    private function handleHistory(Client $client, array $data): void
    {
        $conversationId = $data['conversationId'] ?? $client->conversationId;
        $limit = min($data['limit'] ?? 50, 100);
        $offset = $data['offset'] ?? 0;

        $this->sendHistory($client, $conversationId, $limit, $offset);
    }

    private function sendHistory(Client $client, string $conversationId, int $limit = 50, int $offset = 0): void
    {
        $messages = $this->repository->getByConversation($conversationId, $limit, $offset);

        $client->send([
            'type' => 'history',
            'conversationId' => $conversationId,
            'messages' => array_map(fn(Message $m) => $m->jsonSerialize(), $messages),
        ]);
    }

    private function broadcast(array|Message $data, string $conversationId, ?ConnectionInterface $exclude = null): void
    {
        foreach ($this->clients as $conn) {
            $client = $this->clients[$conn];

            if ($client->conversationId !== $conversationId) {
                continue;
            }

            if ($exclude !== null && $conn === $exclude) {
                continue;
            }

            $client->send($data);
        }
    }
}
