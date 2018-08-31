var menuState = {
	create: function() {
        game.menuBGM.loopFull();

        this.add.existing(game.soundSprite);
        this.add.existing(game.muteSprite);

        let image = this.add.image(0, game.world.centerX, MULTI_BUTTON);
        image.inputEnabled = true;
        image.events.onInputDown.add(function() {
            game.state.start('multi_play_menu');
        });


        this.stage.backgroundColor = "#4488AA";
        let text = this.add.text(game.world.centerX, game.world.centerY, 'Blade', { fontSize: '100px' });
        text.anchor.setTo(0.5);
    },

    shutdown: function() {
        this.world.remove(game.soundSprite);
        this.world.remove(game.muteSprite);
    }
}