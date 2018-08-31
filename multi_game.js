
const cards_list = require('./cards');

class MultiGame {
	constructor(gameID, id1, id2, username1, username2) {
		this.gameID = gameID;
		this.playerOneDeck = null;
		this.playerOneHand = null;
		this.playerOneScore = 0;
		this.playerTwoDeck = null;
		this.playerTwoHand = null;
		this.playerTwoScore = 0;
		this.playerOneField = [];
		this.playerTwoField = [];

		this.playerOneBolt = null;
		this.playerTwoBolt = null;

		this.playerOneID = id1;
		this.playerTwoID = id2;
		this.playerOneUsername = username1;
		this.playerTwoUsername = username2;

		this.turn = null;

		this.initializeDecks();
		this.initializeHands();
	}

	getPlayerNum(id) {
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

	executeMove(card_index, player, io) {
		var card = '';
		if (!this.validateMove(card_index, player)) {
			return false;
		}
		else if (player === 1){
			card = this.playerOneHand[card_index];
			this.playerOneHand.splice(card_index, 1);
			let activateSuccess = card.activate(this);
			if (!activateSuccess) {
				return false;
			}
		}
		else {
			card = this.playerTwoHand[card_index];
			this.playerTwoHand.splice(card_index, 1);
			let activateSuccess = card.activate(this);
			if (!activateSuccess) {
				return false;
			}
		}

		if (this.playerOneScore === this.playerTwoScore) {
			let drawScore = this.playerOneScore;
			let previousTurn = this.turn;
			var draw = this.draw();
			//From the draw, set initial scores
			let playerOneLastCard = draw.playerOneDraw[draw.playerOneDraw.length - 1];
			let playerTwoLastCard = draw.playerTwoDraw[draw.playerTwoDraw.length - 1];
			this.playerOneBolt = undefined;
			this.playerTwoBolt = undefined;
			this.playerOneScore = playerOneLastCard.draw_value;
			this.playerTwoScore = playerTwoLastCard.draw_value;
			this.turn = this.playerOneScore > this.playerTwoScore ? 2 : 1;
			let win = this.checkDrawWin();
			if (win > 0) {
				let winningUsername = win === 1 ? this.playerOneUsername : this.playerTwoUsername;
				console.log('Player ' + win + ': ' + winningUsername + ' won.');
				io.to(this.playerOneID).emit('client_game_continue', {gameover: true, winner: win, tie: true, drawScore: drawScore, playerDraw: draw.playerOneDraw.map(card=>card.name), enemyDraw: draw.playerTwoDraw.map(card=>card.name), previousTurn: previousTurn, turn: this.turn, playerScore: this.playerOneScore, enemyScore: this.playerTwoScore, index: card_index, card: card.name});
				io.to(this.playerTwoID).emit('client_game_continue', {gameover: true, winner: win, tie: true, drawScore: drawScore, playerDraw: draw.playerTwoDraw.map(card=>card.name), enemyDraw: draw.playerOneDraw.map(card=>card.name), previousTurn: previousTurn, turn: this.turn, playerScore: this.playerTwoScore, enemyScore: this.playerOneScore, index: card_index, card: card.name});
			}
			else {
				io.to(this.playerOneID).emit('client_game_continue', {gameover: false, tie: true, drawScore: drawScore, playerDraw: draw.playerOneDraw.map(card=>card.name), enemyDraw: draw.playerTwoDraw.map(card=>card.name), previousTurn: previousTurn, turn: this.turn, playerScore: this.playerOneScore, enemyScore: this.playerTwoScore, index: card_index, card: card.name});
				io.to(this.playerTwoID).emit('client_game_continue', {gameover: false, tie: true, drawScore: drawScore, playerDraw: draw.playerTwoDraw.map(card=>card.name), enemyDraw: draw.playerOneDraw.map(card=>card.name), previousTurn: previousTurn, turn: this.turn, playerScore: this.playerTwoScore, enemyScore: this.playerOneScore, index: card_index, card: card.name});		
			}}
		else {
			let win = this.checkWin(player);
			//Game over
			if (win > 0) {
				let winningUsername = win === 1 ? this.playerOneUsername : this.playerTwoUsername;
				console.log('Player ' + win + ': ' + winningUsername + ' won.');
				let previousTurn = this.turn;
				io.to(this.playerOneID).emit('client_game_continue', {gameover: true, winner: win, tie: false, playerDraw: [], enemyDraw: [], previousTurn: previousTurn, turn: this.turn, playerScore: this.playerOneScore, enemyScore: this.playerTwoScore, index: card_index, card: card.name});
				io.to(this.playerTwoID).emit('client_game_continue', {gameover: true, winner: win, tie: false, playerDraw: [], enemyDraw: [], previousTurn: previousTurn, turn: this.turn, playerScore: this.playerTwoScore, enemyScore: this.playerOneScore, index: card_index, card: card.name});
			}
			//No tie or victory. Continue game
			else {
				let previousTurn = this.turn;
				this.turn = previousTurn === 1 ? 2 : 1;
				io.to(this.playerOneID).emit('client_game_continue', {gameover: false, tie: false, playerDraw: [], enemyDraw: [], previousTurn: previousTurn, turn: this.turn, playerScore: this.playerOneScore, enemyScore: this.playerTwoScore, index: card_index, card: card.name});
				io.to(this.playerTwoID).emit('client_game_continue', {gameover: false, tie: false, playerDraw: [], enemyDraw: [], previousTurn: previousTurn, turn: this.turn, playerScore: this.playerTwoScore, enemyScore: this.playerOneScore, index: card_index, card: card.name});
			}	
		}
		return true;
	}

	checkDrawWin() {
		//Player 1 and Player 2 both have no moves left. Their scores are tied.
		if(this.playerOneField.length === 0 && this.playerTwoField.length === 0 && this.playerOneScore === this.playerTwoScore) {
			return this.playerOneScore > this.playerTwoScore ? 1 : 2;
		}
		else {
			return 0;
		}
	}

	//param: player - the player that just moved
	checkWin(player) {
		//Player 1 just played. Player 2 has no valid moves. Player 1's score is higher.
		if (player === 1 && (this.playerTwoHand.length === 0 || !this.containsNormalCards(this.playerTwoHand)) && this.playerOneScore > this.playerTwoScore) {
			return 1;
		}
		//Player 2 just played. Player 1 has no valid moves. Player 2's score is higher.
		else if (player === 2 && (this.playerOneHand.length === 0 || !this.containsNormalCards(this.playerOneHand)) && this.playerTwoScore > this.playerOneScore) {
			return 2;
		}
		//Player 1 just played. Player 1 couldn't beat Player 2's score with his/her move.
		else if (player === 1 && this.playerOneScore < this.playerTwoScore) {
			return 2;
		}
		//Player 2 just played. Player 2 couldn't beat Player 1's score with his/her move.
		else if (player === 2 && this.playerTwoScore < this.playerOneScore) {
			return 1;
		}
		else {
			return 0;
		}
	}

	containsNormalCards(hand) {
		for (let i = 0; i < hand.length; i++) {
			let name = hand[i].name;
			if (name === cards_list.WAND.name || name === cards_list.TWO_CARD.name || name === cards_list.THREE_CARD.name || name === cards_list.FOUR_CARD.name || name === cards_list.FIVE_CARD.name || name === cards_list.SIX_CARD.name || name === cards_list.SEVEN_CARD.name) {
				return true;
			}
		}
		return false;
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

	initializeDecks() {
		const deck = [];
		for (let i = 0; i < 4; i++) {
			deck.push(cards_list.BOLT);
		}
		for (let i = 0; i < 4; i++) {
			deck.push(cards_list.FORCE);
		}
		for (let i = 0; i < 4; i++) {
			deck.push(cards_list.SEVEN_CARD);
		}
		for (let i = 0; i < 4; i++) {
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
		for (let i = 0; i < 4; i++) {
			deck.push(cards_list.TWO_CARD);
		}
		for (let i = 0; i < 4; i++) {
			deck.push(cards_list.WAND);
		}
		for (let i = 0; i < 4; i++) {
			deck.push(cards_list.MIRROR);
		}

		//Shuffle the deck
	    for (let i = deck.length - 1; i > 0; i--) {
	        let j = Math.floor(Math.random() * (i + 1));
	        [deck[i], deck[j]] = [deck[j], deck[i]];
	    }

		this.playerOneDeck = deck.splice(0, deck.length / 2);
		this.playerTwoDeck = deck;
	}

	initializeHands() {
	    this.playerOneHand = this.playerOneDeck.splice(0, 10);
	    this.playerTwoHand = this.playerTwoDeck.splice(0, 10);
	}


	start(io) {
		let draw = this.draw();
		//From the draw, set initial score
		let playerOneLastCard = draw.playerOneDraw[draw.playerOneDraw.length - 1];
		let playerTwoLastCard = draw.playerTwoDraw[draw.playerTwoDraw.length - 1];
		this.playerOneScore = playerOneLastCard.draw_value;
		this.playerTwoScore = playerTwoLastCard.draw_value;

		//Determine whose turn it is
		if (this.playerOneScore > this.playerTwoScore) {
			this.turn = 2;
			io.to(this.playerOneID).emit('draw', {playerDraw: draw.playerOneDraw.map(card=>card.name), enemyDraw: draw.playerTwoDraw.map(card=>card.name), playerScore: this.playerOneScore, enemyScore: this.playerTwoScore, turn: this.turn});
			io.to(this.playerTwoID).emit('draw', {playerDraw: draw.playerTwoDraw.map(card=>card.name), enemyDraw: draw.playerOneDraw.map(card=>card.name), playerScore: this.playerTwoScore, enemyScore: this.playerOneScore, turn: this.turn});
		}
		else {
			this.turn = 1;
			io.to(this.playerOneID).emit('draw', {playerDraw: draw.playerOneDraw.map(card=>card.name), enemyDraw: draw.playerTwoDraw.map(card=>card.name), playerScore: this.playerOneScore, enemyScore: this.playerTwoScore, turn: this.turn});
			io.to(this.playerTwoID).emit('draw', {playerDraw: draw.playerTwoDraw.map(card=>card.name), enemyDraw: draw.playerOneDraw.map(card=>card.name), playerScore: this.playerTwoScore, enemyScore: this.playerOneScore, turn: this.turn});
		}
	}

}

module.exports = MultiGame;