<?php

namespace App;

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

class Chat implements MessageComponentInterface 
{

    protected $clients;

    public function __construct() 
    {
    
        $this->clients = new \SplObjectStorage;
        
        echo "Chat server started!\n";
        
    }

    public function onOpen(ConnectionInterface $conn) 
    {
    
        // Store the new connection to send messages to later
        $this->clients->attach($conn);

        echo "New connection! ({$conn->resourceId})\n";
        
    }

    public function onMessage(ConnectionInterface $from, $msg) 
    {
    
        $numRecv = count($this->clients) - 1;
        
       echo sprintf('Connection %d sending message "%s" to %d other connection%s'. "\n"
            , $from->resourceId, $msg, $numRecv, $numRecv == 1 ? '' : 's');
            
        if($this->saveMessage($msg))
        {
	        
	        echo 'Saved message to DB';
	        
        }
        else
        {
	        
	        echo 'Failed to save message';
	        
        }

        foreach($this->clients as $client) 
        {
        
            if($from !== $client) 
            {
                // The sender is not the receiver, send to each client connected
                $client->send($msg);
                
            }
            
        }
        
    }

    public function onClose(ConnectionInterface $conn) 
    {
    
        // The connection is closed, remove it, as we can no longer send it messages
        $this->clients->detach($conn);

        echo "Connection {$conn->resourceId} has disconnected\n";
        
    }

    public function onError(ConnectionInterface $conn, \Exception $e) 
    {
    
        echo "An error has occurred: {$e->getMessage()}\n";

        $conn->close();
        
    }
    
    public function saveMessage($msg)
    {
	    
		$data = json_decode($msg);
		
		$conversationId = $data->id;
		$userId = $data->userId;
		$content = $data->content;
		
		$db = new \mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
		
		$stmt = $db->prepare('
		INSERT INTO messages
		(
		conversationId,
		userId,
		content,
		date
		)
		VALUES
		(
		?,
		?,
		?,
		?
		)
		');
		
		if($stmt)
		{
		
			$stmt->bind_param('iiss',
				$conversationId,
				$userId,
				$content,
				date('Y-m-d H:i:s')
			);
			
			$stmt->execute();
			
			$stmt->close();
			
			$db->close();
			
			return true;
		
		}
		else
		{
			
			return false;
			
		}
	    
    }
    
}