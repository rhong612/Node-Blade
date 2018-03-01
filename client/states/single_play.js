

socket.on('receive_hand', function(cards) {
	console.log(cards);
});

var singlePlayState = {
	create: function() {
		socket.emit('start_single_game');
	},
	update: function() {
	}
}
