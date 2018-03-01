
const cardWidth = 191; //191 pixel images
const cardScale = 0.5;

var singlePlayState = {
	create: function() {
		socket.emit('start_single_game');

		socket.on('receive_hand', function(cards) {
			for (let i = 0; i < cards.length; i++) {
				game.add.image(i * cardWidth * cardScale, 0, cards[i]).scale.setTo(cardScale, cardScale);
			}
		});
	},
	update: function() {
	}
}
