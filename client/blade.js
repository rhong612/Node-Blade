var game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.CANVAS, 'game');


var cardSprites = [];
var hand = []; //Array representing the cards currently in the player's hand

game.state.add('load', loadState);
game.state.add('menu', menuState);
game.state.add('single_play', singlePlayState);
game.state.add('multi_play', multiPlayState);

game.state.start('load');