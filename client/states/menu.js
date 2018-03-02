var menuState = {
	create: function() {
        let image = this.add.image(0, 0, AI_BUTTON);
        image.inputEnabled = true;
        image.events.onInputDown.add(function() {
        	game.state.start('single_play');
        });

        this.stage.backgroundColor = "#4488AA";
        let text = this.add.text(game.world.centerX, game.world.centerY, 'Blade', { fontSize: '100px' });
        text.anchor.setTo(0.5);
    }
}