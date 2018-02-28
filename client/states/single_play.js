

socket.on('receive_cards', function(cards) {
	console.log(cards);
});

var singlePlayState = {
	create: function() {
		socket.emit('get_cards');
	},
	update: function() {
	}
}
