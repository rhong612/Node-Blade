
const cardWidth = 191;
const cardScale = 0.5;

var backSprites = [];

var handSprites = [];
var hand = [];

var singlePlayState = {
	create: function() {
		socket.emit('start_single_game');

		socket.on('receive_hand', function(cards) {
			/* Draw hand
			for (let i = 0; i < cards.length; i++) {
				handSprites.push(game.add.sprite(i * cardWidth * cardScale, 0, cards[i]));
				handSprites[i].scale.setTo(cardScale, cardScale);
			}
			*/
			hand = cards.slice();
			let tweens = [];
			for (let i = 0; i < cards.length; i++) {
				backSprites.push(game.add.sprite(-1 * cardWidth, 0, BACK));
				backSprites[i].scale.setTo(cardScale, cardScale);
				tweens.push(game.add.tween(backSprites[i]).to({ x: game.world.centerX / 20 }, 300, Phaser.Easing.Linear.Out, false, i * 100));
			}
			for(let i = 0; i < tweens.length; i++) {
				tweens[i].start();
			}


		});
	},
	update: function() {
	}
}
