

var menuState = {
	create: function() {
        var image = this.add.image(0, 0, AI_BUTTON);
        image.inputEnabled = true;
        image.events.onInputDown.add(versusAI);

        this.stage.backgroundColor = "#4488AA";
        var text = this.add.text(game.world.centerX, game.world.centerY, 'Blade', { fontSize: '100px' });
        text.anchor.setTo(0.5);
    }
}


function versusAI() {
	this.game.state.start('single_play');
}
