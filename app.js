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

const challenges = [];


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


http.listen(80, function() {
	console.log("Listening on port 80...");
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
		if (this.pendingChallenge) {
			let otherID = this.id === this.pendingChallenge.challengerID ? this.pendingChallenge.targetID : this.pendingChallenge.challengerID;
			delete io.sockets.connected[otherID].pendingChallenge;
			delete this.pendingChallenge;

			//Move the waiting player back to the lobby
			playerManager.movePlayerToWaitingLobby(otherID);
		}
		removePlayer(this.id);
	});

	socket.on('change_name', function(new_name) {
		let sanitized_new_name = sanitizer.sanitize(new_name);
		if (sanitized_new_name == '' || sanitized_new_name === 'System') {
			socket.emit('error_message', 'Invalid name!');
		}
		else if(sanitized_new_name.length > constants.MAX_USERNAME_LENGTH) {
			socket.emit('error_message', 'Usernames can only contain 13 characters maximum!');
		}
		else {
			if (!playerManager.contains(sanitized_new_name)) {
				let player = playerManager.getPlayer(this.id);
				if (player.currentGameID === constants.NO_GAME) {
					player.username = sanitized_new_name;
					socket.emit('display_name', sanitized_new_name);
					playerManager.updateOnlinePlayersList();
					playerManager.refreshWaitingList();
				}
				else {
					socket.emit('error_message', 'You cannot change your username while in a match!');
				}

			}
			else {
				socket.emit('error_message', 'Desired name is taken!');
			}
		}
		timeout.refresh();
	})

	socket.on('global_chat_msg', function(msg) {
		let sanitized_msg = sanitizer.sanitize(msg);
		let player = playerManager.getPlayer(this.id);
		if (sanitized_msg == '') {
			socket.emit('error_message', 'Invalid characters in chat message!');
		}
		else {
			io.emit('global_chat_msg', {username: player.username, message: sanitized_msg});
		}
		timeout.refresh();
	})

	socket.on('chat_msg', function(msg) {
		let sanitized_msg = sanitizer.sanitize(msg);
		let player = playerManager.getPlayer(this.id);
		let game = gameManager.getGame(player.currentGameID);
		if (sanitized_msg == '') {
			socket.emit('error_message', 'Invalid characters in chat message!');
		}
		else if (game) {
			let id1 = game.playerOneID;
			let id2 = game.playerTwoID;
			if (id1 === this.id) {
				io.in('room' + game.gameID).emit('chat_msg', {username: game.playerOneUsername, message: sanitized_msg});
			}
			else if (id2 === this.id){
				io.in('room' + game.gameID).emit('chat_msg', {username: game.playerTwoUsername, message: sanitized_msg});
			}
			else {
				socket.emit('serious_error_message', 'Error: Client ID does not match any IDs in the corresponding game.');
			}
		}
		else {
			socket.emit('error_message', 'You must be in a game to use private chat!');
		}
		timeout.refresh();
	})

	socket.on('join_waiting_list', function() {
		let player = playerManager.getPlayer(this.id);
		if (player.currentGameID === constants.NO_GAME) {
			playerManager.movePlayerToWaitingLobby(this.id);
		}
		else {
			socket.emit('serious_error_message', 'Error: Cannot join waiting lobby while in a game.');
		}
		timeout.refresh();
	});

	socket.on('challenge', function(targetName) {
		let player = playerManager.getPlayer(this.id);
		let targetID = findSocketIDInLobby(targetName);
		//Make sure the target is actually in the waiting lobby
		if (targetID) {
			if (this.id === targetID) {
				socket.emit('serious_error_message', 'Error: Cannot play against yourself.');
			}
			else {
				console.log(player.username + ' is challenging ' + targetName);
				let ids = [];
				ids.push(targetID);
				ids.push(this.id);
				playerManager.removePlayersFromWaitingLobby(ids);
				console.log(player.username + ' and ' + targetName + ' have left the waiting room');
				io.to(targetID).emit('client_challenge_prompt', player.username);

				let challenge = new Challenge(this.id, targetID);
				this.pendingChallenge = challenge;
				io.sockets.connected[targetID].pendingChallenge = challenge;
			}
		}
		else {
			socket.emit('serious_error_message', 'Error: Opponent not found.');
		}
		timeout.refresh();
	});

	socket.on('cancel_challenge', function() {
		if (this.pendingChallenge) {
			let id1 = this.pendingChallenge.challengerID;
			let id2 = this.pendingChallenge.targetID;
			console.log(id1);
			console.log(id2);
			delete io.sockets.connected[id1].pendingChallenge;
			delete io.sockets.connected[id2].pendingChallenge;
			playerManager.movePlayerToWaitingLobby(id1);
			playerManager.movePlayerToWaitingLobby(id2);
		}
		timeout.refresh();
	})

	socket.on('accept_challenge', function() {
		if (this.pendingChallenge && this.id === this.pendingChallenge.targetID) {
			gameManager.createMultiGame(this.pendingChallenge.challengerID, this.id, io);

			let player1 = playerManager.getPlayer(this.pendingChallenge.challengerID);
			console.log(player1.username + ' is joining room ' + player1.currentGameID);
			io.sockets.connected[this.pendingChallenge.challengerID].join('room' + player1.currentGameID);

			let player2 = playerManager.getPlayer(this.id);
			console.log(player2.username + ' is joining room ' + player2.currentGameID);
			io.sockets.connected[this.id].join('room' + player2.currentGameID);

			io.in('room' + player1.currentGameID).emit('chat_msg', {username: 'System', message: player1.username + ' has entered the chat room!'});
			io.in('room' + player2.currentGameID).emit('chat_msg', {username: 'System', message: player2.username + ' has entered the chat room!'});

			delete io.sockets.connected[this.pendingChallenge.challengerID].pendingChallenge;
			delete this.pendingChallenge;
		}
		else {
			socket.emit('serious_error_message', 'Error: No valid challenge found.');
		}
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
				socket.emit('serious_error_message', 'Error: Invalid move.');	
			}
		}
		else {
			console.log("Game not found");
		}
		timeout.refresh();
	})

	socket.on('ready', function() {
		let player = playerManager.getPlayer(this.id);
		let game = gameManager.getGame(player.currentGameID);
		if (game) {
			game.readyCounter++;
			if (game.checkPlayersReady()) {
				io.in('room' + player.currentGameID).emit('chat_msg', {username: 'System', message: 'Both players are ready!'});
				gameManager.getGame(player.currentGameID).start(io);
			}
			else {
				socket.emit('chat_msg', {username: 'System', message: 'Waiting for opponent...'});
			}
		}
		else {
			socket.emit('serious_error_message', 'Error: Game not found.');	
		}
		timeout.refresh();
	})

	socket.on('leave_game', function() {
		let gameID = playerManager.getPlayer(this.id).currentGameID
		this.leave('room' + gameID);
		gameManager.removeGame(gameID);
        io.sockets.connected[this.id].leave('room' + gameID);
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
			io.to(id2).emit('chat_msg', {username: 'System', message: playerManager.getPlayer(id).username + ' has disconnected.'});
		}
		else {
			io.to(id1).emit('enemy_disconnected');
			io.to(id1).emit('chat_msg', {username: 'System', message: playerManager.getPlayer(id).username + ' has disconnected.'});
		}
	}

	playerManager.removePlayer(id);
}


class Challenge {
	constructor(challengerID, targetID) {
		this.challengerID = challengerID;
		this.targetID = targetID;
	}
}