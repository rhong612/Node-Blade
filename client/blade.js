

const game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.CANVAS, 'game');


var playerCardSprites;
var enemyCardSprites;

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
	playerCardSprites = game.add.group();
	enemyCardSprites = game.add.group();
	for (let i = 0; i < INITIAL_DECK_SIZE; i++) {
	    playerCardSprites.add(game.add.sprite(-1 * CARD_WIDTH, GAME_HEIGHT - (CARD_SCALE * CARD_HEIGHT * ANCHOR), BACK));
	    playerCardSprites.getChildAt(i).scale.setTo(CARD_SCALE, CARD_SCALE);
        playerCardSprites.getChildAt(i).anchor.setTo(ANCHOR);
	}

	for (let i = 0; i < INITIAL_DECK_SIZE; i++) {
		enemyCardSprites.add(game.add.sprite(GAME_WIDTH + CARD_WIDTH, CARD_HEIGHT * CARD_SCALE * ANCHOR, BACK));
		enemyCardSprites.getChildAt(i).scale.setTo(CARD_SCALE, CARD_SCALE);
        enemyCardSprites.getChildAt(i).anchor.setTo(ANCHOR);
	}
}

function playSetupAnimation() {
    const SPEED = 300;
    const DELAY = 100;
    let player_hand_tweens = [];
    let player_deck_tweens = [];
    let enemy_hand_tweens = [];
    let enemy_deck_tweens = [];
    for (let i = 0; i < INITIAL_DECK_SIZE; i++) {
        player_deck_tweens.push(game.add.tween(playerCardSprites.getChildAt(i)).to({ x: DECK_X_LOCATION }, SPEED, Phaser.Easing.Linear.Out, false, i * DELAY));
        enemy_deck_tweens.push(game.add.tween(enemyCardSprites.getChildAt(i)).to({ x: GAME_WIDTH - DECK_X_LOCATION }, SPEED, Phaser.Easing.Linear.Out, false, i * DELAY));
    }

    for (let i = 0; i < INITIAL_HAND_SIZE; i++) {
        player_hand_tweens.push(game.add.tween(playerCardSprites.getChildAt(i)).to({ x: (i * CARD_WIDTH * CARD_SCALE) + (CARD_WIDTH * CARD_SCALE * 2 + DECK_X_LOCATION) }, SPEED, Phaser.Easing.Linear.Out, false, i * DELAY));
        enemy_hand_tweens.push(game.add.tween(enemyCardSprites.getChildAt(i)).to({ x: (GAME_WIDTH - DECK_X_LOCATION - CARD_WIDTH * CARD_SCALE * 2) - (i * CARD_WIDTH * CARD_SCALE)}, SPEED, Phaser.Easing.Linear.Out, false, i * DELAY));
    }

    player_deck_tweens[INITIAL_DECK_SIZE - 1].onComplete.add(function() {
        startAllTweens(player_hand_tweens);
    });

    enemy_deck_tweens[INITIAL_DECK_SIZE - 1].onComplete.add(function() {
    	startAllTweens(enemy_hand_tweens);
    });


    player_hand_tweens[player_hand_tweens.length - 1].onComplete.add(function() {
        for (let i = 0; i < INITIAL_HAND_SIZE - 1; i++) {
        	getFlipTween(playerCardSprites.getChildAt(i), hand[i], i * DELAY).start();
        }
        let lastFlip = getFlipTween(playerCardSprites.getChildAt(INITIAL_HAND_SIZE - 1), hand[INITIAL_HAND_SIZE - 1], (INITIAL_HAND_SIZE - 1) * DELAY);
        lastFlip.onComplete.add(function() {
            let drawAnim = getDrawAnimationChain();
            drawAnim.playerTween.start();
            drawAnim.enemyTween.start();
        });
        lastFlip.start();
    });

    startAllTweens(player_deck_tweens);
    startAllTweens(enemy_deck_tweens);
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