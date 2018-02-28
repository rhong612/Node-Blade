var express = require('express');
var app = express();
var http = require('http').Server(app); //Creates a server and passes in app as the request handler
var io = require('socket.io')(http);

var players = [];

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});


http.listen(3000, function() {
	console.log("Listening on port 3000...");
}); //Listen on port 3000

app.use(express.static(__dirname + '/client'));

io.on('connection', function(socket) {
	console.log("A user has connected.");

	createGuest(socket);

	socket.on('disconnect', removePlayer);

	socket.on('chat_msg', updateMessages);
});

function createGuest(socket) {
	var username = 'guest' + new Date().valueOf();
	players.push(new Player(socket.id, username));
	socket.emit('display_name', username);

	updatePlayerList();
}

function removePlayer() {
	console.log('A user has disconnected.');
	players = players.filter(player => player.id != this.id);

	updatePlayerList();
}

function updatePlayerList() {
	var username_list = players.map(player => player.username);
	io.emit('update_players', username_list);
}

function updateMessages(msg) {
	io.emit('chat_msg', {'username': 'todo','message': msg});
}

class Player {
	constructor(id, username) {
		this.id = id;
		this.username = username;
	}
}