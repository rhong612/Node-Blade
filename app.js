var express = require('express');
var app = express();
var http = require('http').Server(app); //Creates a server and passes in app as the request handler
var io = require('socket.io')(http);

var current_ongoing_games = {};

var cards_list = require('./cards');
var deck = {};
deck[cards_list.BOLT] = 6;
deck[cards_list.BLAST] = 2;
deck[cards_list.FORCE] = 2;
deck[cards_list.SEVEN_CARD] = 2;
deck[cards_list.SIX_CARD] = 3;
deck[cards_list.FIVE_CARD] = 4;
deck[cards_list.FOUR_CARD] = 4;
deck[cards_list.THREE_CARD] = 4;
deck[cards_list.TWO_CARD] = 3;
deck[cards_list.WAND] = 2;

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

	socket.on('start_single_game', createSingleGame);
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

function createSingleGame() {
	var hand = "test";
	this.emit('receive_hand', hand);
}

class Player {
	constructor(username) {
		this.username = username;
	}
}

class SingleGame {
	constructor(playerID) {
		this.playerID = playerID;
	}
}