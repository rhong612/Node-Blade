const socket = io();
var username = '';

socket.on('display_name', function(name) {
	$("#displayName").html("Welcome " + name + "!");
	username = name;
});


socket.on('update_players', function(usernames) {
	$("#player_list tbody").empty();
	for (let i = 0; i < usernames.length; i++) {
		$("#player_list tbody").append("<tr><td><label data-name='" + usernames[i] + "'>" + usernames[i] + "</label></td></tr>");
	}
});

$(document).ready(function() {
	$("#chat_btn").on('click', function() {
		socket.emit('chat_msg', $('#chat_input').val());
		$('#chat_input').val('');
	});
});


        socket.on('receive_hand_multi', function(cards) {
        	console.log("Got here");
            const bgm = game.add.audio(BGM);
            bgm.loopFull();
            bgm.volume = 0.2;


            hand = cards.hand.slice();
            sortedHand = cards.sortedHand.slice();
            playerDraw = cards.playerDraw;
            enemyDraw = cards.enemyDraw;

            initializeCardSprites();
            playDeckSetupAnimation();
            bgm.play();

            currentDeckIndex = INITIAL_DECK_SIZE - INITIAL_HAND_SIZE - 1;
            console.log(playerDraw);
            console.log(enemyDraw);
        });