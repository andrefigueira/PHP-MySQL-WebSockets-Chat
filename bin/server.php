#!/usr/bin/env php
<?php

declare(strict_types=1);

require dirname(__DIR__) . '/src/bootstrap.php';

use App\Chat\ChatServer;
use App\Chat\MessageRepository;
use Monolog\Handler\StreamHandler;
use Monolog\Level;
use Monolog\Logger;
use Ratchet\Http\HttpServer;
use Ratchet\Server\IoServer;
use Ratchet\WebSocket\WsServer;

$logLevel = ($_ENV['APP_DEBUG'] ?? false) ? Level::Debug : Level::Info;

$logger = new Logger('chat');
$logger->pushHandler(new StreamHandler('php://stdout', $logLevel));
$logger->pushHandler(new StreamHandler(dirname(__DIR__) . '/logs/chat.log', $logLevel));

$host = $_ENV['WS_HOST'] ?? '0.0.0.0';
$port = (int) ($_ENV['WS_PORT'] ?? 8080);

$repository = new MessageRepository($logger);
$chatServer = new ChatServer($repository, $logger);

$server = IoServer::factory(
    new HttpServer(
        new WsServer($chatServer)
    ),
    $port,
    $host
);

$logger->info("WebSocket server started", [
    'host' => $host,
    'port' => $port,
]);

echo <<<BANNER

    ╔═══════════════════════════════════════════════╗
    ║         WebSocket Chat Server                 ║
    ║         Running on ws://{$host}:{$port}            ║
    ╚═══════════════════════════════════════════════╝

BANNER;

$server->run();
