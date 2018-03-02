var singlePlayState = {
    create: function() {
        socket.emit('start_single_game');

        socket.on('receive_hand', function(cards) {
            var bgm = game.add.audio(BGM);
            bgm.loopFull();
            bgm.volume = 0.2;


            hand = cards.slice();
            initializeCardSprites();
            playSetupAnimation();
            bgm.play();
        });
    },
    update: function() {}
}
