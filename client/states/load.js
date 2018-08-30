var loadState = {
    preload: function() {
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

        //Cards
        this.load.image(BACK, 'assets/images/cards/back.png');
        this.load.image(BOLT, 'assets/images/cards/bolt.png');
        this.load.image(MIRROR, 'assets/images/cards/mirror.png');
        this.load.image(FORCE, 'assets/images/cards/force.png');
        this.load.image(WAND, 'assets/images/cards/wand.png');
        this.load.image(TWO_CARD, 'assets/images/cards/blade_pistols.png');
        this.load.image(THREE_CARD, 'assets/images/cards/bow.png');
        this.load.image(FOUR_CARD, 'assets/images/cards/sword.png');
        this.load.image(FIVE_CARD, 'assets/images/cards/shotgun.png');
        this.load.image(SIX_CARD, 'assets/images/cards/spear.png');
        this.load.image(SEVEN_CARD, 'assets/images/cards/broadsword.png');

        //Other assets\
        this.load.image(MULTI_BUTTON, 'assets/images/multi_button.png');
        this.load.image(RETURN_BUTTON, 'assets/images/return_button.png');

        //Sound effects
        this.load.audio(SHUFFLE_SOUND, 'assets/sounds/card_shuffle.mp3');

        //Music
        this.load.audio(GAME_BGM, 'assets/music/Trails of Cold Steel OST - Game of Blades.mp3');
        this.load.audio(MENU_BGM, 'assets/music/Trails of Cold Steel OST - Dining Bar F.mp3');
    },
    create: function() {
        //Global music variables
        game.menuBGM = game.add.audio(MENU_BGM);
        game.menuBGM.volume = 0.2;
        game.menuBGM.autoplay = false;

        game.gameBGM = game.add.audio(GAME_BGM);
        game.gameBGM.volume = 0.2;
        game.gameBGM.autoplay = false;

        this.game.stage.disableVisibilityChange = true; //Make game run in background
        this.game.state.start('menu');
    }
}