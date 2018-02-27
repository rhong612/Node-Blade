var socket = io();
socket.emit('new_guest');

socket.on('display_name', function(name) {
	$("#displayName").html("Welcome " + name + "!");
});


socket.on('add_player', function(username) {
	$("#player_list tbody").append("<tr><td>" + username + "</td></tr>");
});

socket.on('remove_player', function(username) {
})