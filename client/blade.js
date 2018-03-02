const game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.CANVAS, 'game');


const cardSprites = [];
var hand = []; //Array representing the cards currently in the player's hand

game.state.add('load', loadState);
game.state.add('menu', menuState);
game.state.add('single_play', singlePlayState);
game.state.add('multi_play', multiPlayState);

game.state.start('load');




function initializeCardSprites() {
	if (cardSprites.length <= 0) {
	    for (let i = 0; i < INITIAL_DECK_SIZE; i++) {
	        cardSprites.push(game.add.sprite(-1 * CARD_WIDTH, 0, BACK));
	        cardSprites[i].scale.setTo(CARD_SCALE, CARD_SCALE);
	    }
	}
}

function playSetupAnimation() {
    const SPEED = 300;
    const DELAY = 100;
    let hand_tweens = [];
    let deck_tweens = [];
    for (let i = 0; i < INITIAL_DECK_SIZE; i++) {
        deck_tweens.push(game.add.tween(cardSprites[i]).to({ x: DECK_X_LOCATION }, SPEED, Phaser.Easing.Linear.Out, false, i * DELAY));
    }

    for (let i = 0; i < INITIAL_HAND_SIZE; i++) {
        hand_tweens.push(game.add.tween(cardSprites[i]).to({ x: (i * CARD_WIDTH * CARD_SCALE) + (CARD_WIDTH + DECK_X_LOCATION) }, SPEED, Phaser.Easing.Linear.Out, false, i * DELAY));
    }

    deck_tweens[INITIAL_DECK_SIZE - 1].onComplete.add(function() {
        startAllTweens(hand_tweens);
    });


    hand_tweens[hand_tweens.length - 1].onComplete.add(function() {
        for (let i = 0; i < INITIAL_HAND_SIZE; i++) {
        	getFlipTween(cardSprites[i], hand[i], i * DELAY).start();
        }
    });

    startAllTweens(deck_tweens);
    var shuffleSound = game.add.audio(SHUFFLE_SOUND);
    shuffleSound.play();
}


function startAllTweens(tweens_array) {
    for (let i = 0; i < tweens_array.length; i++) {
        tweens_array[i].start();
    }
}


function getFlipTween(sprite, newCard, delay) {
	const FLIP_SPEED = 100;
    let flipTween = game.add.tween(sprite.scale).to({
        x: 0,
        y: CARD_SCALE * 1.2 //Expand y to give the flip a slight "3d" effect
    }, FLIP_SPEED, Phaser.Easing.Linear.None, false, delay);

    let flipTween2 = game.add.tween(sprite.scale).to({
        x: CARD_SCALE,
        y: CARD_SCALE
    }, FLIP_SPEED, Phaser.Easing.Linear.None);

    flipTween.onComplete.add(function() {
        sprite.loadTexture(newCard);
        flipTween2.start();
    });
    return flipTween;
}