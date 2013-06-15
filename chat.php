<!DOCTYPE html>
<html>
<head>
	<base href="http://localhost:8888/PHP-MySQL-Sockets-Chat/">
	<link rel="stylesheet" href="bootstrap/css/bootstrap.css" />
	<link rel="stylesheet" href="css/main.css" />
</head>
<body>

<div class="container">
	
	<div class="chat"></div>
	
	<form id="message-form">
	
		<input type="text" name="message" id="message" placeholder="Chat here..." />
		<button name="send" id="send" class="btn">Send</button>
	
	</form>
	
	<script src="http://code.jquery.com/jquery-1.10.1.min.js"></script>
	
	<script>
	
	var conn = new WebSocket('ws://localhost:8080');
	
	conn.onopen = function(e){
	
	    console.log("Connection established!");
	    
	};
	
	conn.onmessage = function(e){
			
		addMessage(e.data);
	    
	};
	
	$(function(){
		
		$('#message-form').submit(function(e){
		
			e.preventDefault();
			
			var el = $('#message');
			var message = el.val();
			
			var messageData = {
				'id': '123',
				'userId': '12334',
				'content': 'messagehere'
			}
			
			var messageDataJson = JSON.stringify(messageData);
			
			conn.send(messageDataJson);
			
			addMessage(message);
			
			el.val('');
			
		});
		
	});
	
	function addMessage(message)
	{
		
		$('.chat').append('<div class="chat-message">' + message + '</div>');
		
	}
	
	</script>

</div>

</body>
</html>