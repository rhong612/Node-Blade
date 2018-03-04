

const game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.CANVAS, 'game');


var playerDeckSprites;
var enemyDeckSprites;
var playerHandSprites;
var enemyHandSprites;

var hand = []; //Array representing the cards currently in the player's hand
var currentDeckIndex = 0;
var playerDraw = [];
var enemyDraw = [];

game.state.add('load', loadState);
game.state.add('menu', menuState);
game.state.add('single_play', singlePlayState);
game.state.add('multi_play', multiPlayState);

game.state.start('load');




function initializeCardSprites() {
	playerDeckSprites = game.add.group();
	enemyDeckSprites = game.add.group();
	playerHandSprites = game.add.group();
	enemyHandSprites = game.add.group();
	for (let i = 0; i < INITIAL_DECK_SIZE; i++) {
	    playerDeckSprites.add(game.add.sprite(-1 * CARD_WIDTH, GAME_HEIGHT - (CARD_SCALE * CARD_HEIGHT * ANCHOR), BACK));
	    playerDeckSprites.getChildAt(i).scale.setTo(CARD_SCALE, CARD_SCALE);
        playerDeckSprites.getChildAt(i).anchor.setTo(ANCHOR);
	}

	for (let i = 0; i < INITIAL_DECK_SIZE; i++) {
		enemyDeckSprites.add(game.add.sprite(GAME_WIDTH + CARD_WIDTH, CARD_HEIGHT * CARD_SCALE * ANCHOR, BACK));
		enemyDeckSprites.getChildAt(i).scale.setTo(CARD_SCALE, CARD_SCALE);
        enemyDeckSprites.getChildAt(i).anchor.setTo(ANCHOR);
	}
}

function playSetupAnimation() {
    const SPEED = 300;
    const DELAY = 100;
    for (let i = 0; i < INITIAL_DECK_SIZE; i++) {
        let playerTween = game.add.tween(playerDeckSprites.getChildAt(i)).to({ x: DECK_X_LOCATION }, SPEED, Phaser.Easing.Linear.Out, false, i * DELAY);
        let enemyTween = game.add.tween(enemyDeckSprites.getChildAt(i)).to({ x: GAME_WIDTH - DECK_X_LOCATION }, SPEED, Phaser.Easing.Linear.Out, false, i * DELAY);

        if (i == INITIAL_DECK_SIZE - 1) {
        	playerTween.onComplete.add(function() {
			    for (let j = 0; j < INITIAL_HAND_SIZE; j++) {
			    	let topCard = playerDeckSprites.getTop();
			    	playerDeckSprites.remove(topCard);
			    	playerHandSprites.add(topCard);
			    	let tween = game.add.tween(topCard).to({ x: (j * CARD_WIDTH * CARD_SCALE) + (CARD_WIDTH * CARD_SCALE * 2 + DECK_X_LOCATION) }, SPEED, Phaser.Easing.Linear.Out, false, j * DELAY);
			    	tween.onStart.add(function() {
			    		topCard.bringToTop();
			    	});


			    	if (j == INITIAL_HAND_SIZE - 1) {
			    		tween.onComplete.add(function() {
					        for (let h = 0; h < INITIAL_HAND_SIZE - 1; h++) {
					        	getFlipTween(playerHandSprites.getChildAt(h), hand[h], h * DELAY).start();
					        }
							const FLIP_SPEED = 200;
							const delay = (INITIAL_HAND_SIZE - 1) * DELAY;
						    let flipTween = game.add.tween(playerHandSprites.getChildAt(INITIAL_HAND_SIZE - 1).scale).to({
						        x: 0,
						        y: CARD_SCALE * 1.2 //Expand y to give the flip a slight "3d" effect
						    }, FLIP_SPEED, Phaser.Easing.Linear.None, false, delay);

						    let flipTween2 = game.add.tween(playerHandSprites.getChildAt(INITIAL_HAND_SIZE - 1).scale).to({
						        x: CARD_SCALE,
						        y: CARD_SCALE
						    }, FLIP_SPEED, Phaser.Easing.Linear.None, false);

						    flipTween.onComplete.add(function() {
						        playerHandSprites.getChildAt(INITIAL_HAND_SIZE - 1).loadTexture(hand[INITIAL_HAND_SIZE - 1]);
						        flipTween2.start();
						    });
					        flipTween2.onComplete.add(function() {
					        	game.world.bringToTop(playerDeckSprites);
					        	game.world.bringToTop(enemyDeckSprites);


					        	//Sort
					        	const SORT_DELAY = 500;
					        	for (let k = 0; k < INITIAL_HAND_SIZE; k++) {
					        		let sortTween = game.add.tween(playerHandSprites.getChildAt(k)).to({ x: GAME_WIDTH / 2 }, SPEED, Phaser.Easing.Linear.Out, false, SORT_DELAY);

					        		let sprite = playerHandSprites.getChildAt(k);
					        		let newCard = BACK;
								    let flipTween = game.add.tween(sprite.scale).to({
								        x: 0,
								        y: CARD_SCALE * 1.2 //Expand y to give the flip a slight "3d" effect
								    }, FLIP_SPEED, Phaser.Easing.Linear.None, false, delay);

								    let flipTween2 = game.add.tween(sprite.scale).to({
								        x: CARD_SCALE,
								        y: CARD_SCALE
								    }, FLIP_SPEED, Phaser.Easing.Linear.None, false);

								    flipTween.onComplete.add(function() {
								        sprite.loadTexture(newCard);
								        flipTween2.start();
								    });

								    flipTween2.onComplete.add(function() {
								    	getFlipTween(playerHandSprites.getChildAt(k), hand[k], SORT_DELAY / 2).start();
								    });

					        		
					        		sortTween.chain(flipTween);

					        		sortTween.start();
					        	}



					            //let drawAnim = getDrawAnimationChain();
					            //drawAnim.playerTween.start();
					            //drawAnim.enemyTween.start();
					        });
					        flipTween.start();
			    		});
			    	}


			    	tween.start();
			    }
        	});

        	enemyTween.onComplete.add(function() {
			    for (let j = 0; j < INITIAL_HAND_SIZE; j++) {
			    	let topCard = enemyDeckSprites.getTop();
			    	enemyDeckSprites.remove(topCard);
			    	enemyHandSprites.add(topCard);
			    	let tween = game.add.tween(topCard).to({ x: (GAME_WIDTH - DECK_X_LOCATION - CARD_WIDTH * CARD_SCALE) - (CARD_WIDTH * CARD_SCALE * (j + 1)) }, SPEED, Phaser.Easing.Linear.Out, false, j * DELAY);
			    	tween.onStart.add(function() {
			    		topCard.bringToTop();
			    	});
			    	tween.start();
			    }
        	});
        }

        playerTween.start();
        enemyTween.start();
    }
    var shuffleSound = game.add.audio(SHUFFLE_SOUND);
    shuffleSound.play();
}

function getFlipTween(sprite, newCard, delay) {
	const FLIP_SPEED = 200;
    let flipTween = game.add.tween(sprite.scale).to({
        x: 0,
        y: CARD_SCALE * 1.2 //Expand y to give the flip a slight "3d" effect
    }, FLIP_SPEED, Phaser.Easing.Linear.None, false, delay);

    let flipTween2 = game.add.tween(sprite.scale).to({
        x: CARD_SCALE,
        y: CARD_SCALE
    }, FLIP_SPEED, Phaser.Easing.Linear.None, false);

    flipTween.onComplete.add(function() {
        sprite.loadTexture(newCard);
        flipTween2.start();
    });
    return flipTween;
}

function cardSort() {
}