var titleState = {
	create: function() {
        game.menuBGM.loopFull();
        this.timer = 0;
        this.stage.backgroundColor = "#4488AA";

        let swords = this.add.image(game.world.centerX, game.world.centerY, CROSSED_SWORDS);
        swords.alpha = 0;
        swords.anchor.setTo(0.5);
        swords.scale.setTo(0.75);

        this.clickText = this.add.text(game.world.centerX, GAME_HEIGHT * 3/4, 'Click anywhere to start', {fontSize: '30px'});
        this.clickText.alpha = 0;
        this.clickText.anchor.setTo(0.5);

        let text = this.add.text(game.world.centerX, game.world.centerY, 'Blade', { fontSize: '120px' });
        text.alpha = 0;
        text.anchor.setTo(0.5);

        const FADE_IN_SPEED = 2000;
        this.add.tween(swords).to({alpha: 1}, FADE_IN_SPEED, Phaser.Easing.Linear.None, true);
        this.add.tween(text).to({alpha: 1}, FADE_IN_SPEED, Phaser.Easing.Linear.None, true);
    },
    update: function() {
        this.timer += game.time.elapsed;
        if (this.timer >= 1000) {
            this.timer = 0;
            if (this.clickText.alpha === 1) {
                this.clickText.alpha = 0;
            }
            else {
                this.clickText.alpha = 1;
            }
        }

        if (game.input.activePointer.isDown) {
            game.add.audio('SWORD_SLICE').play();
            const SHAKE_INTENSITY = 0.03;
            const SHAKE_SPEED = 300;            
            const FADE_OUT_SPEED = 700;
            this.camera.shake(SHAKE_INTENSITY, SHAKE_SPEED, true, Phaser.Camera.SHAKE_BOTH, true);
            this.camera.fade(0xffffff, FADE_OUT_SPEED, false);
            this.camera.onFadeComplete.add(function() {
                game.state.start('menu');
            })

        } 
    }
}