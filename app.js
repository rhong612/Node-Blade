//Boilerplate
const express = require('express');
const app = express();
const http = require('http').Server(app); //Creates a server and passes in app as the request handler
const io = require('socket.io')(http);


const current_ongoing_games = [];

const player_lobby = {};

const cards_list = require('./cards');

const active_players = {};

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

	socket.on('join_waiting_list', function(username) {
		console.log(username + ' has joined the waiting list');
		let id = findSocketID(username);
		io.sockets.connected[id].join('waiting_room');
		player_lobby[id] = active_players[id];
		refreshWaitingList();
	});

	socket.on('challenge', function(names) {
		console.log(names.challenger + ' is challenging ' + names.target);
		let id = findSocketIDInLobby(names.target);
		this.leave('waiting_room');
		io.sockets.connected[id].leave('waiting_room');
		delete player_lobby[this.id];
		delete player_lobby[id];
		io.to(id).emit('client_challenge_prompt', names.challenger);
		refreshWaitingList();
	});

	socket.on('join_private_match', function(names) {
		console.log(names[0] + " and " + names[1] + " have entered a match!");
		createMultiGame(names);
	})

	socket.on('server_play_card', function(card_index) {
		console.log('Card ' + card_index + ' was played by ID:' + socket.id);
		var game = undefined;
		var player = 0;
		for (let i = 0; i < current_ongoing_games.length; i++) {
			let g = current_ongoing_games[i];
			player = g.hasID(socket.id);
			if (player > 0) {
				game = g;
				break;
			}
		}
		if (game) {
			let result = game.executeMove(card_index, player);
			if (!result) {
				console.log("An error has occurred");
			}
		}
	})
});

function createMultiGame(names) {
	var gameID = current_ongoing_games.length;
	var newGame = new MultiGame(gameID);
	current_ongoing_games.push(newGame);

	let id1 = findSocketID(names[0]);
	let id2 = findSocketID(names[1]);

	io.to(id1).emit('client_start_multiplayer');
	io.to(id2).emit('client_start_multiplayer');

	active_players[id1].currentGame = gameID;
	active_players[id2].currentGame = gameID;

	newGame.playerOneDeck = initializeDeck();
	shuffleDeck(newGame.playerOneDeck);
	newGame.playerTwoDeck = initializeDeck();
	shuffleDeck(newGame.playerTwoDeck);

	newGame.playerOneHand = newGame.playerOneDeck.splice(0, 10);
	let unsortedPlayerOneHand = newGame.playerOneHand.slice();
	newGame.playerTwoHand = newGame.playerTwoDeck.splice(0, 10);
	let unsortedPlayerTwoHand = newGame.playerTwoHand.slice();
	newGame.sort(newGame.playerOneHand);
	newGame.sort(newGame.playerTwoHand);

	newGame.playerOneUsername = names[0];
	newGame.playerTwoUsername = names[1];
	newGame.playerOneID = id1;
	newGame.playerTwoID = id2;

	var draw = newGame.draw();
	//From the draw, set initial scores
	let playerOneLastCard = draw.playerOneDraw[draw.playerOneDraw.length - 1];
	let playerTwoLastCard = draw.playerTwoDraw[draw.playerTwoDraw.length - 1];
	newGame.playerOneScore = playerOneLastCard.draw_value;
	newGame.playerTwoScore = playerTwoLastCard.draw_value;

	//Determine whose turn it is
	if (newGame.playerOneScore > newGame.playerTwoScore) {
		newGame.turn = 2;
		io.to(newGame.playerOneID).emit('receive_hand_multi', {hand: unsortedPlayerOneHand, sortedHand: newGame.playerOneHand, playerDraw: draw.playerOneDraw, enemyDraw: draw.playerTwoDraw, playerScore: newGame.playerOneScore, enemyScore: newGame.playerTwoScore, turn: false});
		io.to(newGame.playerTwoID).emit('receive_hand_multi', {hand: unsortedPlayerTwoHand, sortedHand: newGame.playerTwoHand, playerDraw: draw.playerTwoDraw, enemyDraw: draw.playerOneDraw, playerScore: newGame.playerTwoScore, enemyScore: newGame.playerOneScore, turn: true});
	}
	else {
		newGame.turn = 1;
		io.to(newGame.playerOneID).emit('receive_hand_multi', {hand: unsortedPlayerOneHand, sortedHand: newGame.playerOneHand, playerDraw: draw.playerOneDraw, enemyDraw: draw.playerTwoDraw, playerScore: newGame.playerOneScore, enemyScore: newGame.playerTwoScore, turn: true});
		io.to(newGame.playerTwoID).emit('receive_hand_multi', {hand: unsortedPlayerTwoHand, sortedHand: newGame.playerTwoHand, playerDraw: draw.playerTwoDraw, enemyDraw: draw.playerOneDraw, playerScore: newGame.playerTwoScore, enemyScore: newGame.playerOneScore, turn: false});
	}

	console.log(newGame.playerOneID);
	console.log(newGame.playerTwoID);
}

function findSocketIDInLobby(target_name) {
	for (let id in player_lobby) {
		let username = player_lobby[id].username;
		if (username === target_name) {
			return id;
		}
	}
	return undefined;
}


function findSocketID(target_name) {
	for (let id in active_players) {
		let username = active_players[id].username;
		if (username === target_name) {
			return id;
		}
	}
	return undefined;
}

function refreshWaitingList() {
	io.in('waiting_room').emit('client_waiting_list', player_lobby);
}

function createGuest(socket) {
	var username = 'guest' + new Date().valueOf();
	active_players[socket.id] = new Player(username);
	socket.emit('display_name', username);

	updatePlayerList();
}

function removePlayer() {
	console.log('A user has disconnected.');
	delete active_players[this.id];
	delete player_lobby[this.id];

	//TODO: Look for active games involving the player and remove it

	updatePlayerList();
	refreshWaitingList();
}

function updatePlayerList() {
	const username_list = [];
	for (const player in active_players) {
		username_list.push(active_players[player].username);
	}
	io.emit('update_players', username_list);
}


function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}


function initializeDeck() {
	const deck = [];
	for (let i = 0; i < 6; i++) {
		deck.push(cards_list.BOLT);
	}
	// for (let i = 0; i < 2; i++) {
	// 	deck.push(cards_list.BLAST);
	// }
	for (let i = 0; i < 2; i++) {
		deck.push(cards_list.FORCE);
	}
	for (let i = 0; i < 2; i++) {
		deck.push(cards_list.SEVEN_CARD);
	}
	for (let i = 0; i < 3; i++) {
		deck.push(cards_list.SIX_CARD);
	}
	for (let i = 0; i < 4; i++) {
		deck.push(cards_list.FIVE_CARD);
	}
	for (let i = 0; i < 4; i++) {
		deck.push(cards_list.FOUR_CARD);
	}
	for (let i = 0; i < 4; i++) {
		deck.push(cards_list.THREE_CARD);
	}
	for (let i = 0; i < 3; i++) {
		deck.push(cards_list.TWO_CARD);
	}
	for (let i = 0; i < 2; i++) {
		deck.push(cards_list.WAND);
	}
	return deck;
}


const NO_GAME = -1;
class Player {
	constructor(username) {
		this.username = username;
		this.currentGame = NO_GAME;
	}
}


class MultiGame {
	constructor(gameID) {
		this.gameID = gameID;
		this.playerOneDeck = null;
		this.playerOneHand = null;
		this.playerOneScore = 0;
		this.playerTwoDeck = null;
		this.playerTwoHand = null;
		this.playerTwoScore = 0;
		this.playerOneField = [];
		this.playerTwoField = [];

		this.playerOneUsername = null;
		this.playerTwoUsername = null;
		this.playerOneID = null;
		this.playerTwoID = null;

		this.turn = null;
	}

	hasID(id) {
		if (id === this.playerOneID) {
			return 1;
		}
		else if (id === this.playerTwoID) {
			return 2;
		}
		else {
			return 0;
		}
	}

	executeMove(card_index, player) {
		if (!this.validateMove(card_index, player)) {
			return false;
		}
		else if (player === 1){
			let card = this.playerOneHand[card_index];
			this.playerOneField.push(card);
			this.playerOneHand.splice(card_index, 1);
			console.log('Player one current field: ' + JSON.stringify(this.playerOneField));
			console.log('Player one current hand: ' + JSON.stringify(this.playerOneHand));
			console.log('Player two current field: ' + JSON.stringify(this.playerTwoField));
			console.log('Player two current hand: ' + JSON.stringify(this.playerTwoHand));
			card.activate(this);
			console.log('Player one current score: ' + this.playerOneScore);
			console.log('Player two current score: ' + this.playerTwoScore);
		}
		else {
			let card = this.playerTwoHand[card_index];
			this.playerTwoField.push(card);
			this.playerTwoHand.splice(card_index, 1);
			console.log('Player one current field: ' + JSON.stringify(this.playerOneField));
			console.log('Player one current hand: ' + JSON.stringify(this.playerOneHand));
			console.log('Player two current field: ' + JSON.stringify(this.playerTwoField));
			console.log('Player two current hand: ' + JSON.stringify(this.playerTwoHand));
			card.activate(this);
			console.log('Player one current score: ' + this.playerOneScore);
			console.log('Player two current score: ' + this.playerTwoScore);
		}
		return true;
	}

	validateMove(card_index, player) {
		if (player === this.turn) {
			if (player === 1) {
				return card_index < this.playerOneHand.length && card_index >= 0;
			}
			else if (player === 2) {
				return card_index < this.playerTwoHand.length && card_index >= 0;
			}
			else {
				return false;
			}
		}


	}

	draw() {
		let playerOneDraw = [];
		let playerTwoDraw = [];
		let i = 0;
		while (this.playerOneDeck.length > 0) {
			playerOneDraw.push(this.playerOneDeck.shift());
			playerTwoDraw.push(this.playerTwoDeck.shift());

			if (playerOneDraw[i].draw_value != playerTwoDraw[i].draw_value) {
				this.playerOneField.push(playerOneDraw[i]);
				this.playerTwoField.push(playerTwoDraw[i]);
				break;
			}

			i++;
		}
		return {playerOneDraw: playerOneDraw, playerTwoDraw: playerTwoDraw};
	}

	sort(hand) {
		hand.sort(function(card1, card2) {
			if (card1.sort_value < card2.sort_value) {
				return -1;
			}
			else if (card1.sort_value > card2.sort_value) {
				return 1;
			}
			else {
				return 0;
			}
		});
	}
}