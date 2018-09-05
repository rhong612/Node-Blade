var menuState = {
	create: function() {
        if (!game.menuBGM.isPlaying) {
            game.menuBGM.loopFull();
        }

        let titleText = this.add.text(game.world.centerX, GAME_HEIGHT / 10, 'Blade', {fontSize: '100px'});
        titleText.anchor.setTo(0.5);

        let playText = this.add.text(game.world.centerX, GAME_HEIGHT / 10 * 3, 'Multiplayer', {fontSize: '70px'});
        playText.anchor.setTo(0.5);
        playText.inputEnabled = true;
        playText.events.onInputDown.add(function() {
            game.state.start('multi_play_menu');
        })

        let tutorialText = this.add.text(game.world.centerX, GAME_HEIGHT / 10 * 5, 'How To Play', {fontSize: '70px'});
        tutorialText.anchor.setTo(0.5);
        tutorialText.inputEnabled = true;
        tutorialText.events.onInputDown.add(function() {
            game.state.start('tutorial');
        })

        let exitText = this.add.text(game.world.centerX, GAME_HEIGHT / 10 * 7, 'Exit', {fontSize: '70px'});
        exitText.anchor.setTo(0.5);
        exitText.inputEnabled = true;
        exitText.events.onInputDown.add(function() {
            game.state.start('title');
        })
    }
}