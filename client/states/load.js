//List of cards
const BACK = 'BACK';
const BOLT = 'BOLT';
const BLAST = 'BLAST';
const MIRROR = 'MIRROR';
const FORCE = 'FORCE';
const WAND = 'WAND';
const TWO_CARD = 'BLADE_PISTOL';
const THREE_CARD = 'BOW';
const FOUR_CARD = 'SWORD';
const FIVE_CARD = 'SHOTGUN';
const SIX_CARD = 'SPEAR';
const SEVEN_CARD = 'BROADSWORD';

//Other assets
const AI_BUTTON = 'AI_BUTTON';

//Sound effects
const SHUFFLE = 'SHUFFLE';

//Frequently used constants
const CARD_WIDTH = 191;
const CARD_SCALE = 0.5;
const DECK_SIZE = 32;

var loadState = {
    preload: function() {
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

        //Cards
        this.load.image(BACK, 'images/cards/back.png');
        this.load.image(BOLT, 'images/cards/bolt.png');
        this.load.image(BLAST, 'images/cards/blast.png');
        this.load.image(MIRROR, 'images/cards/mirror.png');
        this.load.image(FORCE, 'images/cards/force.png');
        this.load.image(WAND, 'images/cards/wand.png');
        this.load.image(TWO_CARD, 'images/cards/blade_pistols.png');
        this.load.image(THREE_CARD, 'images/cards/bow.png');
        this.load.image(FOUR_CARD, 'images/cards/sword.png');
        this.load.image(FIVE_CARD, 'images/cards/shotgun.png');
        this.load.image(SIX_CARD, 'images/cards/spear.png');
        this.load.image(SEVEN_CARD, 'images/cards/broadsword.png');

        //Other assets
        this.load.image(AI_BUTTON, 'images/ai_button.png');

        //Sound effects
        this.load.audio(SHUFFLE, 'sounds/card_shuffle.mp3');
    },
    create: function() {
        this.game.state.start('menu');
    }
}