var express = require('express');
var app = express();
var http = require('http').Server(app); //Creates a server and passes in app as the request handler
var io = require('socket.io')(http);

var active_players = {};

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

	socket.on('get_cards', generateDeck);
});

function createGuest(socket) {
	var username = 'guest' + new Date().valueOf();
	active_players[socket.id] = new Player(username);
	socket.emit('display_name', username);

	updatePlayerList();
}

function removePlayer() {
	console.log('A user has disconnected.');
	delete active_players[this.id];

	updatePlayerList();
}

function updatePlayerList() {
	var username_list = [];
	for (var player in active_players) {
		username_list.push(active_players[player].username);
	}
	io.emit('update_players', username_list);
}

function updateMessages(msg) {
	io.emit('chat_msg', {'username': active_players[this.id].username,'message': msg});
}

function generateDeck() {
	var cards = [];
	this.emit('receive_cards', cards);
}

class Player {
	constructor(username) {
		this.username = username;
	}
}