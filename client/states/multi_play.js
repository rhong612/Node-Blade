

var multiPlayState = {

	init: function(initialHand, sortedInitialHand, playerNum) {
		//Initialize state properties
		this.playerNum = playerNum;
		this.initialHand = initialHand;
		this.sortedInitialHand = sortedInitialHand;
		this.playerDeckSprites = game.add.group();
		this.enemyDeckSprites = game.add.group();
		this.playerHandSprites = game.add.group();
		this.enemyHandSprites = game.add.group();
		this.playerFieldSprites = game.add.group();
		this.enemyFieldSprites = game.add.group();
	    this.waitingText = game.add.text(game.world.centerX + CARD_WIDTH, game.world.centerY, "", { fontSize: '50px' });
	    this.waitingText.anchor.setTo(0.5);
	    this.playerScoreText = game.add.text(game.world.centerX, game.world.centerY + CARD_HEIGHT / 2, 0, { fontSize: '50px' });
		this.playerScoreText.anchor.setTo(0.5);
	    this.enemyScoreText = game.add.text(game.world.centerX, game.world.centerY - CARD_HEIGHT / 2, 0, { fontSize: '50px' });
		this.enemyScoreText.anchor.setTo(0.5);

		this.tie = false;
		this.turn = 0;
		this.playerScore = 0;
		this.enemyScore = 0;

		this.gameover = false;
		this.winner = 0;

		//Add sprites to deck
		for (let i = 0; i < INITIAL_DECK_SIZE; i++) {
		    this.playerDeckSprites.add(game.add.sprite(-1 * CARD_WIDTH, GAME_HEIGHT - (CARD_SCALE * CARD_HEIGHT * ANCHOR), BACK));
		    this.playerDeckSprites.getChildAt(i).scale.setTo(CARD_SCALE, CARD_SCALE);
	        this.playerDeckSprites.getChildAt(i).anchor.setTo(ANCHOR);
		}

		for (let i = 0; i < INITIAL_DECK_SIZE; i++) {
			this.enemyDeckSprites.add(game.add.sprite(GAME_WIDTH + CARD_WIDTH, CARD_HEIGHT * CARD_SCALE * ANCHOR, BACK));
			this.enemyDeckSprites.getChildAt(i).scale.setTo(CARD_SCALE, CARD_SCALE);
	        this.enemyDeckSprites.getChildAt(i).anchor.setTo(ANCHOR);
		}

        const bgm = game.add.audio(BGM);
        bgm.loopFull();
        bgm.volume = 0.2;
        bgm.play();
        playDeckSetupAnimation();
	},

	preload: function() {
        socket.on('client_game_continue', function(response) {
        	console.log(JSON.stringify(response));
        	waitingText.setText("");
        	playerScore = response.playerScore;
        	enemyScore = response.enemyScore;
        	gameover = response.gameover;
        	if (gameover) {
        		winner = response.winner;
        		bgm.stop();
        	}

        	turn = response.turn;
        	tie = response.tie;
        	playerDraw = response.playerDraw;
        	enemyDraw = response.enemyDraw;
        	//Move the played card to the center
        	if (response.previousTurn === playerNum) {
		    	if (tie) {
        			waitingText.setText("A draw!");
        			playerScoreText.setText(response.drawScore);
        			enemyScoreText.setText(response.drawScore);
        			playPlayerActivateAnimation(response.index, function() {
        				dumpField(playDrawAnimation);
        			});
		    	}
		    	else {
		    		if (response.card.name === BOLT) {
		    			playPlayerBoltAnimation(response.index, startTurn);
		    		}
		    		else if (response.card.name === MIRROR) {
		    			playPlayerMirrorAnimation(response.index, startTurn);
		    		}
		    		else if (response.card.name === WAND) {
		    			playPlayerWandAnimation(response.index, startTurn);
		    		}
		    		else {
	        			playPlayerActivateAnimation(response.index, startTurn);
		    		}
		    	}
        	}
        	else {
		    	if (tie) {
        			waitingText.setText("A draw!");
        			playerScoreText.setText(response.drawScore);
        			enemyScoreText.setText(response.drawScore);
        			playEnemyActivateAnimation(response.index, response.card, function() {
        				dumpField(playDrawAnimation);
        			});
		    	}
		    	else {
		    		if (response.card.name === BOLT) {
		    			playEnemyBoltAnimation(response.index, response.card, startTurn);
		    		}
		    		else if (response.card.name === MIRROR) {
		    			playEnemyMirrorAnimation(response.index, response.card, startTurn);
		    		}
		    		else if (response.card.name === WAND) {
		    			playEnemyWandAnimation(response.index, response.card, startTurn);
		    		}
		    		else {
	        			playEnemyActivateAnimation(response.index, response.card, startTurn);
		    		}
		    	}
        	}
        })



        socket.on('draw', function(response) {
        	const currentState = game.state.getCurrentState();
			currentState.turn = response.turn;
			currentState.playerScore = response.playerScore;
			currentState.enemyScore = response.enemyScore;
			//Dump the field. Then, play the draw animation
			destroyField(function() {
				playDrawAnimation(response.playerDraw, response.enemyDraw);
			})

			function destroyField(func) {
				autoDumpGroupRight(currentState.playerFieldSprites);
				autoDumpGroupLeft(currentState.enemyFieldSprites, func);
			}
        });

	}
}



