var game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.CANVAS, 'game');


game.state.add('load', loadState);
game.state.add('menu', menuState);
game.state.add('single_play', singlePlayState);
game.state.add('multi_play', multiPlayState);

game.state.start('load');