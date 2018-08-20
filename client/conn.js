const socket = io();
var username = '';

socket.on('display_name', function(name) {
	username = name;
});

socket.on('name_taken', function() {
	alert('Desired name is taken!');
});

socket.on('not_on_menu', function() {
	alert('You can only change your screenname on the main menu!');
})


socket.on('update_players', function(usernames) {
	$("#player_list tbody").empty();
	for (let i = 0; i < usernames.length; i++) {
		$("#player_list tbody").append("<tr><td><label data-name='" + usernames[i] + "'>" + usernames[i] + "</label></td></tr>");
	}
});
/*
$(document).ready(function() {
	$("#chat_btn").on('click', function() {
		socket.emit('chat_msg', $('#chat_input').val());
		$('#chat_input').val('');
	});
});
*/