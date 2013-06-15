<?php

require dirname(__DIR__) . '/lib/bootstrap.php';

use Ratchet\Server\IoServer;
use Ratchet\WebSocket\WsServer;
use App\Chat;

$server = IoServer::factory(
    new WsServer(
        new Chat()
    )
  , 8080
);

$server->run();