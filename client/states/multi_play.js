

var multiPlayState = {

	preload: function() {
		playerDeckSprites = game.add.group();
		enemyDeckSprites = game.add.group();
		playerHandSprites = game.add.group();
		enemyHandSprites = game.add.group();
		playerFieldSprites = game.add.group();
		enemyFieldSprites = game.add.group();
		for (let i = 0; i < INITIAL_DECK_SIZE; i++) {
		    playerDeckSprites.add(game.add.sprite(-1 * CARD_WIDTH, GAME_HEIGHT - (CARD_SCALE * CARD_HEIGHT * ANCHOR), BACK));
		    playerDeckSprites.getChildAt(i).scale.setTo(CARD_SCALE, CARD_SCALE);
	        playerDeckSprites.getChildAt(i).anchor.setTo(ANCHOR);
		}

		for (let i = 0; i < INITIAL_DECK_SIZE; i++) {
			enemyDeckSprites.add(game.add.sprite(GAME_WIDTH + CARD_WIDTH, CARD_HEIGHT * CARD_SCALE * ANCHOR, BACK));
			enemyDeckSprites.getChildAt(i).scale.setTo(CARD_SCALE, CARD_SCALE);
	        enemyDeckSprites.getChildAt(i).anchor.setTo(ANCHOR);
		}
	},
	create: function() {

        socket.on('client_game_continue', function(response) {
        	console.log(JSON.stringify(response));
        	playerScore = response.playerScore;
        	enemyScore = response.enemyScore;
        	playerScoreText.setText(playerScore);
        	enemyScoreText.setText(enemyScore);

        	turn = response.turn;
        	tie = response.tie;
        	playerDraw = response.playerDraw;
        	enemyDraw = response.enemyDraw;
        	//Move the played card to the center
        	if (response.previousTurn === playerNum) {
		    	if (tie) {
        			playPlayerActivateAnimation(response.index, response.card, function() {
        				dumpField(playDrawAnimation);
        			});
		    	}
		    	else {
        			playPlayerActivateAnimation(response.index, response.card, startTurn);
		    	}
        	}
        	else {
		    	if (tie) {
        			playEnemyActivateAnimation(response.index, response.card, function() {
        				dumpField(playDrawAnimation);
        			});
		    	}
		    	else {
        			playEnemyActivateAnimation(response.index, response.card, startTurn);
		    	}
        	}
        })



        socket.on('draw', function(response) {
			playerDraw = response.playerDraw;
			enemyDraw = response.enemyDraw;
			turn = response.turn;
			playerScore = response.playerScore;
			enemyScore = response.enemyScore;
			//Dump the field. Then, play the draw animation
			dumpField(playDrawAnimation);
        });


        const bgm = game.add.audio(BGM);
        bgm.loopFull();
        bgm.volume = 0.2;
        bgm.play();
        playDeckSetupAnimation();
	}
}
