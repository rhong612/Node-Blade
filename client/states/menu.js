var menuState = {
	create: function() {
        //Global speaker icon
        game.soundSprite = game.make.sprite(0, 0, SOUND_ICON);
        game.muteSprite = game.make.sprite(0, 0, MUTE_ICON);
        game.muteSprite.visible = false;
        game.stage.addChild(game.soundSprite);
        game.stage.addChild(game.muteSprite);

        game.soundSprite.inputEnabled = true;
        game.soundSprite.events.onInputDown.add(function() {
            game.soundSprite.visible = false;
            game.soundSprite.inputEnabled = false;
            game.muteSprite.visible = true;
            game.muteSprite.inputEnabled = true;
            game.menuBGM.mute = true;
            game.gameBGM.mute = true;
        })
        game.muteSprite.events.onInputDown.add(function() {
            game.muteSprite.visible = false;
            game.muteSprite.inputEnabled = false;
            game.soundSprite.visible = true;
            game.soundSprite.inputEnabled = true;
            game.menuBGM.mute = false;
            game.gameBGM.mute = false;
        })


        let image = this.add.image(0, game.world.centerX, MULTI_BUTTON);
        image.inputEnabled = true;
        image.events.onInputDown.add(function() {
            game.state.start('multi_play_menu');
        });

    }
}