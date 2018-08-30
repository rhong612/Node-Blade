//Boilerplate
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const sanitizer = require('sanitizer'); //For sanitizing user input

const gameManager = require('./game_manager');
const playerManager = gameManager.getPlayerManager();
playerManager.attachIO(io);


app.get('/', function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});


http.listen(3000, function() {
	console.log("Listening on port 3000...");
});

app.use(express.static(__dirname + '/client'));


//const TIMEOUT_DURATION = 300000; //5 minutes
const TIMEOUT_DURATION = 5000;
io.on('connection', function(socket) {
	console.log("A user has connected.");

	let timeout = setTimeout(function() {
		socket.emit('timeout');
		socket.disconnect();
	}, TIMEOUT_DURATION);

	playerManager.addNewPlayer(socket);

	socket.on('disconnect', removePlayer);

	socket.on('change_name', function(new_name) {
		let sanitized_new_name = sanitizer.sanitize(new_name);
		if (sanitized_new_name == '') {
			socket.emit('invalid_name');
		}
		else {
			let taken = false;
			for (let id in playerManager.getOnlinePlayers()) {
				if (playerManager.getOnlinePlayers()[id].username === sanitized_new_name) {
					taken = true;
					break;
				}
			}
			if (!taken) {
				let player = playerManager.getPlayer(this.id);
				if (player.onMenu()) {
					player.username = sanitized_new_name;
					socket.emit('display_name', sanitized_new_name);
					playerManager.updateOnlinePlayersList();
				}
				else {
					socket.emit('not_on_menu');
				}

			}
			else {
				socket.emit('name_taken');
			}
		}
		timeout.refresh();
	})

	socket.on('join_waiting_list', function(username) {
		console.log(username + ' has joined the waiting list');

		let id = findSocketID(username);
		playerManager.movePlayerToWaitingLobby(id);
		timeout.refresh();
	});

	socket.on('challenge', function(names) {
		console.log(names.challenger + ' is challenging ' + names.target);
		let id = findSocketIDInLobby(names.target);
		let ids = [];
		ids.push(id);
		ids.push(this.id);
		playerManager.removePlayersFromWaitingLobby(ids);
		console.log(names.challenger + ' and ' + names.target + ' have left the waiting room');
		io.to(id).emit('client_challenge_prompt', names.challenger);
		timeout.refresh();
	});

	socket.on('join_private_match', function(names) {
		console.log(names[0] + " and " + names[1] + " have entered a match!");
		let id1 = findSocketID(names[0]);
		let id2 = findSocketID(names[1]);
		gameManager.createMultiGame(id1, id2, io);
		timeout.refresh();
	})

	socket.on('server_play_card', function(card_index) {
		console.log('Card ' + card_index + ' was played by ' + playerManager.getPlayer(this.id).username);
		let gameID = playerManager.getPlayer(this.id).currentGameID;
		let game = gameManager.getGame(gameID);
		let playerNum = game.getPlayerNum(this.id);
		if (game) {
			let result = game.executeMove(card_index, playerNum, io);
			if (!result) {
				console.log("An error has occurred");
			}
		}
		else {
			console.log("Game not found");
		}
		timeout.refresh();
	})

	socket.on('ready', function() {
		console.log(playerManager.getPlayer(this.id).username + ' is joining room ' + playerManager.getPlayer(this.id).currentGameID);
		this.join('room' + playerManager.getPlayer(this.id).currentGameID);
		let room = io.sockets.adapter.rooms['room' + playerManager.getPlayer(this.id).currentGameID];
		if (room.length === 2) {
			var clients = room.sockets;
			let ids = [];
			for (id in clients) {
				ids.push(id);
			}
			console.log('Both players are present. Beginning initial draw for game in room ' + playerManager.getPlayer(this.id).currentGameID + ' for ' + playerManager.getPlayer(ids[0]).username + ' and ' + playerManager.getPlayer(ids[1]).username);
			gameManager.getGame(playerManager.getPlayer(this.id).currentGameID).start(io);
		}
		timeout.refresh();
	})

	socket.on('leave_game', function() {
		let gameID = playerManager.getPlayer(this.id).currentGameID
		this.leave('room' + gameID);
		gameManager.removeGame(gameID);
		timeout.refresh();
	});
});



function findSocketIDInLobby(target_name) {
	for (let id in playerManager.getWaitingLobby()) {
		let username = playerManager.getWaitingLobby()[id].username;
		if (username === target_name) {
			return id;
		}
	}
	return undefined;
}


function findSocketID(target_name) {
	for (let id in playerManager.getOnlinePlayers()) {
		let username = playerManager.getOnlinePlayers()[id].username;
		if (username === target_name) {
			return id;
		}
	}
	return undefined;
}

function removePlayer() {
	console.log('A user has disconnected.');
	gameManager.removeGame(playerManager.getPlayer(this.id).currentGameID);
	playerManager.removePlayer(this.id);
}