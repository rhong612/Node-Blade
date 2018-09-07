//Boilerplate
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const sanitizer = require('sanitizer'); //For sanitizing user input
app.use(express.static(__dirname + '/client'));


//Templating engine
const path = require('path');
const expressHbs = require('express-handlebars');
app.engine('handlebars', expressHbs({defaultLayout: 'main', layoutsDir: path.join(__dirname, 'client', 'views', 'layouts')}));
app.set('views', path.join(__dirname, 'client', 'views'));
app.set('view engine', 'handlebars');


const constants = require('./constants');
const gameManager = require('./game_manager');
const playerManager = gameManager.getPlayerManager();
playerManager.attachIO(io);


const navbarData = {homeURL: '/', playURL: '/game', aboutURL: '/about', tutorialURL: '/tutorial'};

app.get('/', function(req, res) {
	res.render('index', navbarData);
});

app.get('/game', function(req, res) {
	res.render('game', navbarData);
})


app.get('/tutorial', function(req, res) {
	res.render('tutorial', navbarData);
})


http.listen(3000, function() {
	console.log("Listening on port 3000...");
});


const TIMEOUT_DURATION = 300000; //5 minutes
io.on('connection', function(socket) {
	console.log("A user has connected.");

	playerManager.addNewPlayer(socket);

	let timeout = setTimeout(function() {
		socket.emit('timeout');
		socket.disconnect();
	}, TIMEOUT_DURATION);


	socket.on('disconnect', function() {
		clearTimeout(timeout);
		removePlayer(this.id);
	});

	socket.on('change_name', function(new_name) {
		let sanitized_new_name = sanitizer.sanitize(new_name);
		if (sanitized_new_name == '' || sanitized_new_name === 'System') {
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

	socket.on('chat_msg', function(msg) {
		let player = playerManager.getPlayer(this.id);
		if (player && player.status === constants.STATUS_INGAME) {
			let game = gameManager.getGame(player.currentGameID);
			if (game) {
				let id1 = game.playerOneID;
				let id2 = game.playerTwoID;
				if (id1 === this.id) {
					io.in('room' + game.gameID).emit('chat_msg', {username: game.playerOneUsername, message: msg});
				}
				else if (id2 === this.id){
					io.in('room' + game.gameID).emit('chat_msg', {username: game.playerTwoUsername, message: msg});
				}
				else {
					//TODO: send error msg back to client
				}
			}
			else {
				//TODO:send error msg back to client
			}
		}
		else {
			//TODO:send error msg back to client
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

		let player1 = playerManager.getPlayer(id1);
		console.log(player1.username + ' is joining room ' + player1.currentGameID);
		io.sockets.connected[id1].join('room' + player1.currentGameID);

		let player2 = playerManager.getPlayer(id2);
		console.log(player2.username + ' is joining room ' + player2.currentGameID);
		io.sockets.connected[id2].join('room' + player2.currentGameID);

		io.in('room' + player1.currentGameID).emit('chat_msg', {username: 'System', message: player1.username + ' has entered the chat room!'});
		io.in('room' + player2.currentGameID).emit('chat_msg', {username: 'System', message: player2.username + ' has entered the chat room!'});


		timeout.refresh();
	})

	socket.on('server_play_card', function(card_index) {
		console.log('Card ' + card_index + ' was played by ' + playerManager.getPlayer(this.id).username);
		let gameID = playerManager.getPlayer(this.id).currentGameID;
		let game = gameManager.getGame(gameID);
		if (game) {
			let playerNum = game.getPlayerNum(this.id);
			let result = game.executeMove(card_index, playerNum, io);
			if (!result) {
				console.log("An error has occurred");
				socket.emit('invalid_move');
			}
		}
		else {
			console.log("Game not found");
		}
		timeout.refresh();
	})

	socket.on('ready', function() {
		let player = playerManager.getPlayer(this.id);
		if (player && player.status === constants.STATUS_INGAME) {
			let game = gameManager.getGame(player.currentGameID);
			if (game) {
				game.readyCounter++;
				if (game.checkPlayersReady()) {
					io.in('room' + player.currentGameID).emit('chat_msg', {username: 'System', message: 'Both players are ready!'});
					gameManager.getGame(player.currentGameID).start(io);
				}
			}
			else {
				io.in('room' + player.currentGameID).emit('chat_msg', {username: 'System', message: 'Waiting for opponent...'});
			}
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

function removePlayer(id) {
	console.log('A user has disconnected.');
	let removedGame = gameManager.removeGame(playerManager.getPlayer(id).currentGameID);

	//If in a game, let player know that their opponent disconnected
	if (removedGame) {
		let id1 = removedGame.playerOneID;
		let id2 = removedGame.playerTwoID;
		if (id === id1) {
			io.to(id2).emit('enemy_disconnected');
		}
		else {
			io.to(id1).emit('enemy_disconnected');
		}
	}

	playerManager.removePlayer(id);
}