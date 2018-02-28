var socket = io();

socket.on('display_name', function(name) {
	$("#displayName").html("Welcome " + name + "!");
});


socket.on('update_players', function(usernames) {
	$("#player_list tbody").empty();
	for (var i = 0; i < usernames.length; i++) {
		$("#player_list tbody").append("<tr><td><button data-name='" + usernames[i] + "'>" + usernames[i] + "</button></td></tr>");
	}
});