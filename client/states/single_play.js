var singlePlayState = {
	create: function() {
		socket.emit('start_single_game');

		socket.on('receive_hand', function(cards) {
			var shuffleSound = game.add.audio(SHUFFLE_SOUND);
			var bgm = game.add.audio(BGM);
			bgm.loopFull();
			bgm.volume = 0.2;


			hand = cards.slice();
			let deck_tweens = [];
			let hand_tweens = [];
			const DELAY = 100;
			const SPEED = 300;
			const DECK_LOCATION = game.world.centerX / 20;
			for (let i = 0; i < DECK_SIZE; i++) {
				cardSprites.push(game.add.sprite(-1 * CARD_WIDTH, 0, BACK));
				cardSprites[i].scale.setTo(CARD_SCALE, CARD_SCALE);
				deck_tweens.push(game.add.tween(cardSprites[i]).to({ x: DECK_LOCATION }, SPEED, Phaser.Easing.Linear.Out, false, i * DELAY));
			}

			for (let i = 0; i < hand.length; i++) {
				hand_tweens.push(game.add.tween(cardSprites[i]).to({ x: (i * CARD_WIDTH * CARD_SCALE) + (CARD_WIDTH + DECK_LOCATION) }, SPEED, Phaser.Easing.Linear.Out, false, i * DELAY));
			}

			deck_tweens[DECK_SIZE - 1].onComplete.add(function() {
				for (let i = 0; i < hand_tweens.length; i++) {
					hand_tweens[i].start();
				}
			});

			hand_tweens[hand_tweens.length - 1].onComplete.add(function() {
				console.log("Done");
				for (let i = 0; i < hand.length; i++) {
					let flipTween = game.add.tween(cardSprites[i].scale).to({
						x: 0,
						y: 1.2
					}, 1000, Phaser.Easing.Linear.None);

					let flipTween2 = game.add.tween(cardSprites[i].scale).to({
						x: 1,
						y: 1
					}, 1000, Phaser.Easing.Linear.None);

					flipTween.onComplete.add(function() {
						cardSprites[i].loadTexture(hand[i]);
						flipTween2.start();
					});

					flipTween.start();
				}
			});

			bgm.play();
			shuffleSound.play();
			for(let i = 0; i < deck_tweens.length; i++) {
				deck_tweens[i].start();
			}


		});
	},
	update: function() {
	}
}
