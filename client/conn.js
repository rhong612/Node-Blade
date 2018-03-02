const socket = io();

socket.on('display_name', function(name) {
	$("#displayName").html("Welcome " + name + "!");
});


socket.on('update_players', function(usernames) {
	$("#player_list tbody").empty();
	for (let i = 0; i < usernames.length; i++) {
		$("#player_list tbody").append("<tr><td><label data-name='" + usernames[i] + "'>" + usernames[i] + "</label></td></tr>");
	}
});

socket.on('chat_msg', function(chat) {
	$('#messages').append("<li>" + chat['username'] + ':' + chat['message'] + "</li>");
});

$(document).ready(function() {
	$("#chat_btn").on('click', function() {
		socket.emit('chat_msg', $('#chat_input').val());
		$('#chat_input').val('');
	});
});
