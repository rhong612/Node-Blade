

var multiPlayMenuState = {
	create: function() {
		//Show list of players in the lobby
		
        socket.emit('join_waiting_list');

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
			            console.log("Clicked");
			        });
	        		spacing += 50;
        		}
        	}
        });
	}
}
