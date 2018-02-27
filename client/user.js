var socket = io();
socket.emit('new_guest');

socket.on('new_guest', function(guest_name) {
	$("#displayName").html("Welcome " + guest_name + "!");
});