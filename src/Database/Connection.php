<?php

declare(strict_types=1);

namespace App\Database;

use PDO;
use PDOException;
use Psr\Log\LoggerInterface;

final class Connection
{
    private static ?PDO $instance = null;

    public static function getInstance(?LoggerInterface $logger = null): PDO
    {
        if (self::$instance === null) {
            try {
                $dsn = sprintf(
                    'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
                    $_ENV['DB_HOST'] ?? 'localhost',
                    $_ENV['DB_PORT'] ?? '3306',
                    $_ENV['DB_NAME'] ?? 'websocket_chat'
                );

                self::$instance = new PDO(
                    $dsn,
                    $_ENV['DB_USER'] ?? 'root',
                    $_ENV['DB_PASS'] ?? '',
                    [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_EMULATE_PREPARES => false,
                    ]
                );

                $logger?->info('Database connection established');
            } catch (PDOException $e) {
                $logger?->error('Database connection failed: ' . $e->getMessage());
                throw $e;
            }
        }

        return self::$instance;
    }

    public static function close(): void
    {
        self::$instance = null;
    }
}
