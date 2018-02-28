const GAME_WIDTH = 800;
const GAME_HEIGHT = 500;

var game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.AUTO, 'game');

game.state.add('load', loadState);
game.state.add('menu', menuState);
game.state.add('single_play', singlePlayState);
game.state.add('multi_play', multiPlayState);

game.state.start('load');
