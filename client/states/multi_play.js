

var multiPlayState = {
	create: function() {

        socket.on('client_game_continue', function(response) {
        	console.log(JSON.stringify(response));
        	//Move the played card to the center
        	if (response.previousTurn === playerNum) {
        		playPlayerActivateAnimation(response.index, response.card);
        	}
        	else {
        		playEnemyActivateAnimation(response.index, response.card);
        	}
        	playerScore = response.playerScore;
        	enemyScore = response.enemyScore;
        	playerScoreText.setText(playerScore);
        	enemyScoreText.setText(enemyScore);

        	turn = response.turn;
        	startTurn();
        })



        socket.on('receive_hand_multi', function(cards) {
            const bgm = game.add.audio(BGM);
            bgm.loopFull();
            bgm.volume = 0.2;


            hand = cards.hand.slice();
            sortedHand = cards.sortedHand.slice();
            playerDraw = cards.playerDraw;
            enemyDraw = cards.enemyDraw;

            turn = cards.turn;

            playerScore = cards.playerScore;
            enemyScore = cards.enemyScore;

            playerNum = cards.playerNum;

            initializeCardSprites();
            playDeckSetupAnimation();
            bgm.play();

            currentDeckIndex = INITIAL_DECK_SIZE - INITIAL_HAND_SIZE - 1;
            console.log(playerDraw);
            console.log(enemyDraw);
        });

        socket.emit('ready');
	}
}
