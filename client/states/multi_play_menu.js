

var multiPlayMenuState = {
	create: function() {
		//Show list of players in the lobby
		
        socket.on('client_waiting_list', function(player_lobby) {
        	game.world.removeAll(); //Clear the screen
	        game.stage.backgroundColor = "#4488AA";
	        let spacing = 50;
        	for (const key in player_lobby) {
        		if (player_lobby[key].username !== username) {
	        		let text = game.add.text(game.world.centerX, game.world.centerY + spacing, player_lobby[key].username, { fontSize: '50px' });
	        		text.anchor.setTo(0.5);
			        text.inputEnabled = true;
			        text.events.onInputDown.add(function() {
			        	socket.emit('challenge', {target: player_lobby[key].username, challenger: username});
			        	game.world.removeAll(); // Clear the screen
			        	let waiting_prompt = game.add.text(game.world.centerX, game.world.centerY, "Waiting for player response...", { fontSize: '50px' });
			        	waiting_prompt.anchor.setTo(0.5);
			        	let cancel_btn = game.add.text(game.world.centerX, game.world.centerY + 100, "Cancel", { fontSize: '50px' });
			        	cancel_btn.anchor.setTo(0.5);
			        	cancel_btn.inputEnabled = true;
			        	cancel_btn.events.onInputDown.add(function() {
							socket.emit('join_waiting_list', username);
							socket.emit('join_waiting_list', player_lobby[key].username);
			        	});
			        });
	        		spacing += 50;
        		}
        	}
        });

        socket.on('client_challenge_prompt', function(challenger_username) {
        	game.world.removeAll(); //Clear the screen
        	game.stage.backgroundColor = "#4488AA";
        	let text = game.add.text(game.world.centerX, game.world.centerY, "Challenge from " + challenger_username, { fontSize: '50px' });
	       	text.anchor.setTo(0.5);
			text.inputEnabled = true;

			let acceptBtn = game.add.text(game.world.centerX, game.world.centerY + 100, "Accept", {fontSize: '50px'});
			acceptBtn.anchor.setTo(0.5);
			acceptBtn.inputEnabled = true;
			let declineBtn = game.add.text(game.world.centerX, game.world.centerY - 100, "Decline", {fontSize: '50px'});
			declineBtn.anchor.setTo(0.5);
			declineBtn.inputEnabled = true;

			acceptBtn.events.onInputDown.add(function() {
				socket.emit('join_private_match', [username, challenger_username]);
			});
			declineBtn.events.onInputDown.add(function() {
				socket.emit('join_waiting_list', username);
				socket.emit('join_waiting_list', challenger_username);
			});

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

            initializeCardSprites();
            playDeckSetupAnimation();
            bgm.play();

            currentDeckIndex = INITIAL_DECK_SIZE - INITIAL_HAND_SIZE - 1;
            console.log(playerDraw);
            console.log(enemyDraw);
        });

        socket.on('client_start_multiplayer', function() {
        	console.log("Switching states");
        	game.world.removeAll();
        	//TODO: Refactor to switch states
        })

        socket.on('client_game_continue', function(response) {
        	console.log(JSON.stringify(response));
        	//{turn: this.turn, playerScore: this.playerTwoScore, enemyScore: this.playerOneScore, index: card_index, card: card};
        	//Move the played card to the center
        	
        })

        socket.emit('join_waiting_list', username);
	}
}
