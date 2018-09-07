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
	socket.on('update_players', function(usernames) {
		$("#player_list tbody").empty();
		for (let i = 0; i < usernames.length; i++) {
			$("#player_list tbody").append("<tr><td><label data-name='" + usernames[i] + "'>" + usernames[i] + "</label></td></tr>");
		}
	})
	socket.on('chat_msg', function(chat) {
		$('#messages').append("<tr><td><label><b>" + chat['username'] + ":</b> " + chat['message'] + "</label></td></tr>");
	});
	socket.on('timeout', function() {
		console.log("Connection timed out due to inactivity");
		game.state.start('disconnected');	
	})
	socket.on('error_message', function(error) {
		alert(error);
	})
	socket.on('serious_error_message', function(error) {
		alert(error);
	})
}

setupConn();