

var multiPlayState = {

	init: function(initialHand, sortedInitialHand, playerNum) {
		//Initialize state properties
		this.playerNum = playerNum;
		this.initialHand = initialHand;
		this.sortedInitialHand = sortedInitialHand;
		this.playerDeckSprites = this.add.group();
		this.enemyDeckSprites = this.add.group();
		this.playerHandSprites = this.add.group();
		this.enemyHandSprites = this.add.group();
		this.playerFieldSprites = this.add.group();
		this.enemyFieldSprites = this.add.group();
	    this.waitingText = this.add.text(game.world.centerX + CARD_WIDTH, game.world.centerY, "", { fontSize: '50px' });
	    this.waitingText.anchor.setTo(0.5);
	    this.playerScoreText = this.add.text(game.world.centerX, game.world.centerY + CARD_HEIGHT / 2, 0, { fontSize: '50px' });
		this.playerScoreText.anchor.setTo(0.5);
	    this.enemyScoreText = this.add.text(game.world.centerX, game.world.centerY - CARD_HEIGHT / 2, 0, { fontSize: '50px' });
		this.enemyScoreText.anchor.setTo(0.5);

		this.normalCardSound = game.add.audio(NORMAL_CARD_PLAY);
		this.wandCardSound = game.add.audio(WAND_CARD_PLAY);
		this.mirrorCardSound = game.add.audio(MIRROR_CARD_PLAY);
		this.boltCardSound = game.add.audio(BOLT_CARD_PLAY);

		this.tie = false;
		this.turn = 0;

		this.gameover = false;
		this.winner = 0;

		//Add sprites to deck
		for (let i = 0; i < INITIAL_DECK_SIZE; i++) {
		    this.playerDeckSprites.add(this.add.sprite(-1 * CARD_WIDTH, GAME_HEIGHT - (CARD_SCALE * CARD_HEIGHT * ANCHOR), BACK));
		    this.playerDeckSprites.getChildAt(i).scale.setTo(CARD_SCALE, CARD_SCALE);
	        this.playerDeckSprites.getChildAt(i).anchor.setTo(ANCHOR);
		}

		for (let i = 0; i < INITIAL_DECK_SIZE; i++) {
			this.enemyDeckSprites.add(this.add.sprite(GAME_WIDTH + CARD_WIDTH, CARD_HEIGHT * CARD_SCALE * ANCHOR, BACK));
			this.enemyDeckSprites.getChildAt(i).scale.setTo(CARD_SCALE, CARD_SCALE);
	        this.enemyDeckSprites.getChildAt(i).anchor.setTo(ANCHOR);
		}

        game.gameBGM.loopFull();
        playDeckSetupAnimation(function() {
        	socket.emit('ready');
        });
	},

	preload: function() {
		socket.on('invalid_move', function() {
			alert('Invalid move!');
			game.state.getCurrentState().startTurn();
		})

        socket.on('client_game_continue', function(response) {
        	console.log(JSON.stringify(response));
        	let currentState = game.state.getCurrentState();

        	currentState.updateWaitingText("");
        	currentState.gameover = response.gameover;
        	currentState.turn = response.turn;
        	currentState.tie = response.tie;
        	if (currentState.gameover) {
        		currentState.winner = response.winner;
        		game.gameBGM.stop();
        	}

        	let playerMoved = response.previousTurn === currentState.playerNum;

        	if (currentState.tie) {
        		currentState.updateWaitingText("A draw!");
        		currentState.updateScoreText(response.drawScore, response.drawScore);
        		playCardAnimation(response.index, response.card, playerMoved, function() {
        			currentState.resetField(response.playerDraw, response.enemyDraw, response.playerScore, response.enemyScore);
        		})
        	}
        	else {
        		playCardAnimation(response.index, response.card, playerMoved, function() {
        			currentState.updateScoreText(response.playerScore, response.enemyScore);
        			currentState.startTurn();
        		});
        	}
        })

        socket.on('enemy_disconnected', function() {
        	let currentState = game.state.getCurrentState();
	        if (!currentState.gameover) {
	        	currentState.updateWaitingText("Opponent disconnected. You win!");
	        	game.gameBGM.stop();
				currentState.showReturnButton();
        	}
        })



        socket.on('draw', function(response) {
        	const currentState = game.state.getCurrentState();
			currentState.turn = response.turn;
			currentState.resetField(response.playerDraw, response.enemyDraw, response.playerScore, response.enemyScore);
        });

	},

	shutdown : function() {
		resetConn();
	    socket.emit('leave_game');
	},

	updateScoreText : function(playerScore, enemyScore) {
		this.playerScoreText.setText(playerScore);
		this.enemyScoreText.setText(enemyScore);
	},

	isWinner: function() {
		return this.winner === this.playerNum;
	},

	updateWaitingText : function(text) {
		this.waitingText.setText(text);
	},

	isPlayerTurn : function() {
		return this.playerNum === this.turn;
	},

	resetField : function(playerDraw, enemyDraw, playerScore, enemyScore) {
		//Dump the field. Then, play the draw animation. Play the startTurn() function at the end.
		destroyField(this.playerFieldSprites, this.enemyFieldSprites, function() {
			playDrawAnimation(playerDraw, enemyDraw, function() {
				this.updateScoreText(playerScore, enemyScore);
				this.startTurn();
			}.bind(this));
		}.bind(this))
	},

	startTurn: function startTurn() {
		if (this.gameover) {
			if (this.isWinner()) {
				this.updateWaitingText("You win!");
				this.showReturnButton();
			}
			else {
				this.updateWaitingText("You lose!");
				this.showReturnButton();
			}
		}
		else if (this.isPlayerTurn()) {
	    	this.updateWaitingText("");
	    	//Can click on cards
	    	for (let i = 0; i < this.playerHandSprites.length; i++) {
	    		let sprite = this.playerHandSprites.getChildAt(i);
	    		sprite.inputEnabled = true;
	    		sprite.events.onInputDown.add(function() {
			    	for (let j = 0; j < this.playerHandSprites.length; j++) {
			    		let s = this.playerHandSprites.getChildAt(j);
			    		s.events.onInputDown.removeAll();
			    		s.events.onInputOver.removeAll();
			    		s.events.onInputOut.removeAll();
			    		s.alpha = 1.0;
			    	}
	    			this.playerHandSprites.setAll('inputEnabled', false);
	    			socket.emit('server_play_card', i);
	    		}.bind(this));
	       		sprite.events.onInputOver.add(sprite => sprite.alpha = 0.5, this);
	        	sprite.events.onInputOut.add(sprite => sprite.alpha = 1.0, this);
	    	}
	    }
	    else {
	    	this.updateWaitingText("Waiting for other player...");
	    }

	},

	showReturnButton : function() {
		let image = this.add.image(0, GAME_HEIGHT, RETURN_BUTTON);
		image.inputEnabled = true;
		image.scale.setTo(0.5);
		image.anchor.setTo(0, 1);
		image.events.onInputDown.add(function() {
		    game.state.start('menu');
	    });
	}
}



