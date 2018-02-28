//List of cards
const BACK = 'BACK';
const BOLT = 'BOLT';
const BLAST = 'BLAST';
const MIRROR = 'MIRROR';
const FORCE = 'FORCE';
const TWO_CARD = 'BLADE_PISTOL';
const THREE_CARD = 'BOW';
const FOUR_CARD = 'SWORD';
const FIVE_CARD = 'SHOTGUN';
const SIX_CARD = 'SPEAR';
const SEVEN_CARD = 'BROADSWORD';

//Other assets
const AI_BUTTON = 'AI_BUTTON';


const GAME_WIDTH = 800;
const GAME_HEIGHT = 500;

var game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.AUTO, 'game', { preload: preload, create: create });

//game.state.add('menu', menuState);



function preload() {
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

    //Cards
    this.load.image(BACK, 'images/cards/back.png');
    this.load.image(BOLT, 'images/cards/bolt.png');
    this.load.image(BLAST, 'images/cards/blast.png');
    this.load.image(MIRROR, 'images/cards/mirror.png');
    this.load.image(FORCE, 'images/cards/force.png');
    this.load.image(TWO_CARD, 'images/cards/blade_pistols.png');
    this.load.image(THREE_CARD, 'images/cards/bow.png');
    this.load.image(FOUR_CARD, 'images/cards/sword.png');
    this.load.image(FIVE_CARD, 'images/cards/shotgun.png');
    this.load.image(SIX_CARD, 'images/cards/spear.png');
    this.load.image(SEVEN_CARD, 'images/cards/broadsword.png');

    //Other assets
    this.load.image(AI_BUTTON, 'images/ai_button.png');
}

function create() {
    var image = this.add.image(0, 0, AI_BUTTON);
    image.inputEnabled = true;
    image.events.onInputDown.add(versusAI);

    this.stage.backgroundColor = "#4488AA";
    var text = this.add.text(game.world.centerX, game.world.centerY, 'Blade', { fontSize: '100px' });
    text.anchor.setTo(0.5);
}

function versusAI() {
    console.log("Starting game against AI...");
}