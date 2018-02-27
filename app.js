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

	socket.on('new_guest', createGuest);

	socket.on('disconnect', function() {
		console.log('A user has disconnected.');
	});

	socket.on('msg', function(msg) {
			console.log('message: ' + msg);
	});
});

function createGuest(msg) {
	var username = 'guest' + new Date().valueOf();
	this.emit('new_guest', username);
	players.push(new Player(this.id, username));
}

class Player {
	constructor(id, username) {
		this.id = id;
		this.username = username;
	}
}