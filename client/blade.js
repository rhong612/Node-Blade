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

var socket = io();


const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

var game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.AUTO, '', { preload: preload, create: create });



function preload() {
    this.load.image(BACK, 'images/back.png');
    this.load.image(BOLT, 'images/bolt.png');
    this.load.image(BLAST, 'images/blast.png');
    this.load.image(MIRROR, 'images/mirror.png');
    this.load.image(FORCE, 'images/force.png');
    this.load.image(TWO_CARD, 'images/blade_pistols.png');
    this.load.image(THREE_CARD, 'images/bow.png');
    this.load.image(FOUR_CARD, 'images/sword.png');
    this.load.image(FIVE_CARD, 'images/shotgun.png');
    this.load.image(SIX_CARD, 'images/spear.png');
    this.load.image(SEVEN_CARD, 'images/broadsword.png');
}

function create() {
    /*
    var image = this.add.image(0, 0, BOLT);
    image.inputEnabled = true;
    image.events.onInputDown.add(listener);
    */
    this.stage.backgroundColor = "#4488AA";
    var text = this.add.text(game.world.centerX, game.world.centerY, 'Blade', { fontSize: '100px' });
    text.anchor.setTo(0.5);
}

function listener() {
    console.log("Clicked");
}