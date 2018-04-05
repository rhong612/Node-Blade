var singlePlayState = {
    create: function() {
        socket.emit('start_single_game');

        socket.on('receive_hand', function(cards) {
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
    },
    update: function() {
    }
}
