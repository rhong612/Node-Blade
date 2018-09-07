const socket = io({
	reconnection: false
});
var username = '';


function resetConn() {
	socket.removeAllListeners();
	setupConn();
}

function setupConn() {
	socket.on('display_name', function(name) {
		username = name;
	});

	socket.on('name_taken', function() {
		alert('Desired name is taken!');
	});

	socket.on('not_in_game', function() {
		alert('You cannot change your username while in a match!');
	})
	socket.on('name_over_length', function() {
		alert('Usernames can only contain 13 characters maximum!');
	})

	socket.on('invalid_name', function() {
		alert('Invalid name!');
	})
	socket.on('update_players', function(usernames) {
		$("#player_list tbody").empty();
		for (let i = 0; i < usernames.length; i++) {
			$("#player_list tbody").append("<tr><td><label data-name='" + usernames[i] + "'>" + usernames[i] + "</label></td></tr>");
		}
	})
	socket.on('chat_msg', function(chat) {
		$('#messages').append("<li>" + "<b>" + chat['username'] + ':' + "</b>" + chat['message'] + "</li>");
	});
	socket.on('timeout', function() {
		console.log("Connection timed out due to inactivity");
		game.state.start('disconnected');	
	})
	socket.on('invalid_chat', function() {
		alert('Invalid characters in chat message!');
	})
	socket.on('error', function() {
		
	})
}

setupConn();