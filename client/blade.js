

const game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.CANVAS, 'game');


var playerDeckSprites;
var enemyDeckSprites;
var playerHandSprites;
var enemyHandSprites;
var playerFieldSprites;
var enemyFieldSprites;

let playerScoreText;
let enemyScoreText;
let waitingText;

var hand = []; //Array representing the cards currently in the player's hand
var sortedHand = [];
var currentDeckIndex = INITIAL_DECK_SIZE - INITIAL_HAND_SIZE - 1;
var playerDraw = [];
var enemyDraw = [];
var tie = false;
var turn = false;
var playerScore = 0;
var enemyScore = 0;

var playerNum = 0;

game.state.add('load', loadState);
game.state.add('menu', menuState);
game.state.add('multi_play', multiPlayState);
game.state.add('multi_play_menu', multiPlayMenuState)

game.state.start('load');





function playPlayerActivateAnimation(index, card, func = function() {}) {
	const SPEED = 400;
	let sprite = playerHandSprites.getChildAt(index);
	game.world.bringToTop(playerHandSprites);
	playerHandSprites.bringToTop(sprite);
	let tween = game.add.tween(sprite).to({ x: GAME_WIDTH - (2 * CARD_WIDTH), y: (GAME_HEIGHT - (CARD_HEIGHT * CARD_SCALE * ANCHOR * 4)) }, SPEED, Phaser.Easing.Linear.Out, false, 0);
	tween.onComplete.add(function() {
		playerHandSprites.removeChild(sprite);
		playerFieldSprites.add(sprite);
		func();
	});
	tween.start();
}

function playEnemyActivateAnimation(index, card, func) {
	const SPEED = 400;
	let sprite = enemyHandSprites.getChildAt(index);
	game.world.bringToTop(enemyHandSprites);
	enemyHandSprites.bringToTop(sprite);
	let tween = game.add.tween(sprite).to({ x: CARD_WIDTH * 2, y: CARD_HEIGHT * CARD_SCALE * ANCHOR * 4}, SPEED, Phaser.Easing.Linear.Out, false, 0);
	let flipTween = getFlipTween(sprite, card.name, 0);
	tween.onComplete.add(function() {
		enemyHandSprites.removeChild(sprite);
		enemyFieldSprites.add(sprite);
		func();
	});
	tween.start();
	flipTween.start();
}

function dumpField(func) {
	if (playerFieldSprites.length >= 1) {
		let tweens = [];
		tweens.push(dumpPlayerCardAnimation(playerFieldSprites.getChildAt(0), 0));
		for (let i = 1; i < playerFieldSprites.length; i++) {
			tweens.push(dumpPlayerCardAnimation(playerFieldSprites.getChildAt(i), 0));
		}

		for (let i = 0; i < enemyFieldSprites.length; i++) {
			tweens.push(dumpEnemyCardAnimation(enemyFieldSprites.getChildAt(i), 0));
		}

		onChainComplete(tweens[tweens.length - 1], function() {
			playerFieldSprites.removeAll(true);
			enemyFieldSprites.removeAll(true);
			func();
		});
		startAllTweens(tweens);
	}
	else {
		func();
	}
}


/**
*	Draws the specified number of cards given by the server. Dumps cards when necessary.
*/
function playDrawAnimation() {
	console.log('Current deck index:' + currentDeckIndex);
	game.world.bringToTop(playerDeckSprites);
	game.world.bringToTop(enemyDeckSprites);
	const DELAY = 300;
    let playerTween = drawPlayerCardAnimation(playerDeckSprites.getChildAt(currentDeckIndex), DELAY); 
    let enemyTween = drawEnemyCardAnimation(enemyDeckSprites.getChildAt(currentDeckIndex), DELAY);
    endOfChain(playerTween, getFlipTween(playerDeckSprites.getChildAt(currentDeckIndex), playerDraw[0].name, 0));
    endOfChain(enemyTween, getFlipTween(enemyDeckSprites.getChildAt(currentDeckIndex), enemyDraw[0].name, 0));

    for (let i = 1; i < playerDraw.length; i++) {
        endOfChain(playerTween, dumpPlayerCardAnimation(playerDeckSprites.getChildAt(currentDeckIndex)));
        endOfChain(enemyTween, dumpEnemyCardAnimation(enemyDeckSprites.getChildAt(currentDeckIndex)));
    	playerDeckSprites.removeChildAt(currentDeckIndex); //Remove from deck
    	enemyDeckSprites.removeChildAt(currentDeckIndex); //Remove from deck

        currentDeckIndex--;
		console.log('Current deck index:' + currentDeckIndex);
        endOfChain(playerTween, drawPlayerCardAnimation(playerDeckSprites.getChildAt(currentDeckIndex)));
        endOfChain(enemyTween, drawEnemyCardAnimation(enemyDeckSprites.getChildAt(currentDeckIndex)));

        endOfChain(playerTween, getFlipTween(playerDeckSprites.getChildAt(currentDeckIndex), playerDraw[i].name, 0));
        endOfChain(enemyTween, getFlipTween(enemyDeckSprites.getChildAt(currentDeckIndex), enemyDraw[i].name, 0));
    }

    onChainComplete(playerTween, function() {
    	//The last drawn cards go to the field
    	let playerSprite = playerDeckSprites.removeChildAt(currentDeckIndex);
    	let enemySprite = enemyDeckSprites.removeChildAt(currentDeckIndex);
    	playerFieldSprites.add(playerSprite);
    	enemyFieldSprites.add(enemySprite);
    	currentDeckIndex--;

    	if (waitingText) {
    		playerScoreText.setText(playerScore);
    		enemyScoreText.setText(enemyScore);
    	}
    	//Initialize stuff
    	else {
	    	waitingText = game.add.text(game.world.centerX + CARD_WIDTH, game.world.centerY, "", { fontSize: '50px' });
	    	waitingText.anchor.setTo(0.5);
	        playerScoreText = game.add.text(game.world.centerX, game.world.centerY + CARD_HEIGHT / 2, playerScore, { fontSize: '50px' });
		    playerScoreText.anchor.setTo(0.5);
	        enemyScoreText = game.add.text(game.world.centerX, game.world.centerY - CARD_HEIGHT / 2, enemyScore, { fontSize: '50px' });
		    enemyScoreText.anchor.setTo(0.5);
    	}
    	startTurn();
    });

    playerDraw = [];
    enemyDraw = [];
    playerTween.start();
    enemyTween.start();
}

function startTurn() {
	if (turn === playerNum) {
    	waitingText.setText("");
    	//Can click on cards
    	for (let i = 0; i < playerHandSprites.length; i++) {
    		let sprite = playerHandSprites.getChildAt(i);
    		sprite.inputEnabled = true;
    		sprite.events.onInputDown.add(function() {
		    	for (let j = 0; j < playerHandSprites.length; j++) {
		    		let s = playerHandSprites.getChildAt(j);
		    		s.events.onInputDown.removeAll();
		    		s.events.onInputOver.removeAll();
		    		s.events.onInputOut.removeAll();
		    		s.alpha = 1.0;
		    	}
    			playerHandSprites.setAll('inputEnabled', false);
    			socket.emit('server_play_card', i);
    		});
       		sprite.events.onInputOver.add(sprite => sprite.alpha = 0.5, this);
        	sprite.events.onInputOut.add(sprite => sprite.alpha = 1.0, this);
    	}
    }
    else {
    	waitingText.setText("Waiting for other player...");
    }
}

/**
*	Spreads the cards back out. Then, emits a 'ready' message to the server.
*/
function playSpreadAnimation() {
	const SPEED = 300;
	let spreadTweens = [];
	let enemySpreadTweens = [];
	for (let i = 0; i < INITIAL_HAND_SIZE; i++) {
		spreadTweens.push(game.add.tween(playerHandSprites.getChildAt(i)).to({ x: (i * CARD_WIDTH * CARD_SCALE) + (CARD_WIDTH * CARD_SCALE * 2 + DECK_X_LOCATION) }, SPEED, Phaser.Easing.Linear.Out, false, 0));
		enemySpreadTweens.push(game.add.tween(enemyHandSprites.getChildAt(i)).to({ x: (GAME_WIDTH - DECK_X_LOCATION - CARD_WIDTH * CARD_SCALE) - (CARD_WIDTH * CARD_SCALE * (i + 1)) }, SPEED, Phaser.Easing.Linear.Out, false, 0));
	}
	spreadTweens[INITIAL_HAND_SIZE - 1].onComplete.add(function() {
        socket.emit('ready');
	});
	startAllTweens(spreadTweens);
	startAllTweens(enemySpreadTweens);
}

/**
*	Plays the sort animation. Then, plays the spread animation to spread the cards back out.
*/
function playSortAnimation() {
	const SPEED = 300;
	const DELAY = 500;
	let sortTweens = [];
	let enemySortTweens = [];
	for (let i = 0; i < INITIAL_HAND_SIZE; i++) {
		sortTweens.push(game.add.tween(playerHandSprites.getChildAt(i)).to({ x: GAME_WIDTH / 2 }, SPEED, Phaser.Easing.Linear.Out, false, DELAY));
		enemySortTweens.push(game.add.tween(enemyHandSprites.getChildAt(i)).to({ x:GAME_WIDTH / 2 }, SPEED, Phaser.Easing.Linear.Out, false, DELAY));
	}
	sortTweens[INITIAL_HAND_SIZE - 1].onComplete.add(function() {
		let flipTweens = [];
		const FLIP_DELAY = 300;
		for (let j = 0; j < INITIAL_HAND_SIZE; j++) {
			flipTweens.push(getFlipTween(playerHandSprites.getChildAt(j), BACK, FLIP_DELAY));
		}

		onChainComplete(flipTweens[INITIAL_HAND_SIZE - 1], function() {
			cardSort();
			let backFlipTweens = [];
			for (let k = 0; k < INITIAL_HAND_SIZE; k++) {
				backFlipTweens.push(getFlipTween(playerHandSprites.getChildAt(k), hand[k].name, FLIP_DELAY));
			}
			onChainComplete(backFlipTweens[INITIAL_HAND_SIZE - 1], playSpreadAnimation);
			startAllTweens(backFlipTweens);
		});
		startAllTweens(flipTweens);
	});

	startAllTweens(sortTweens);
	startAllTweens(enemySortTweens);
}


/**
*	Draws starting hands for both players, flips the cards, then plays the sort animation.
*/
function playHandSetupAnimation() {
	let playerHandTweens = [];
	let enemyHandTweens = [];
	const SPEED = 300;
	const DELAY = 100;
	for (let i = 0; i < INITIAL_HAND_SIZE; i++) {
		let topCard = playerDeckSprites.getTop();
		playerDeckSprites.remove(topCard);
		playerHandSprites.add(topCard);

		playerHandTweens.push(game.add.tween(topCard).to({ x: (i * CARD_WIDTH * CARD_SCALE) + (CARD_WIDTH * CARD_SCALE * 2 + DECK_X_LOCATION) }, SPEED, Phaser.Easing.Linear.Out, false, i * DELAY));
		playerHandTweens[i].onStart.add(function() {
			topCard.bringToTop();
		});


		let topCard2 = enemyDeckSprites.getTop();
		enemyDeckSprites.remove(topCard2);
		enemyHandSprites.add(topCard2);

		enemyHandTweens.push(game.add.tween(topCard2).to({ x: (GAME_WIDTH - DECK_X_LOCATION - CARD_WIDTH * CARD_SCALE) - (CARD_WIDTH * CARD_SCALE * (i + 1)) }, SPEED, Phaser.Easing.Linear.Out, false, i * DELAY));
		enemyHandTweens[i].onStart.add(function() {
			topCard2.bringToTop();
		});
	}
	playerHandTweens[playerHandTweens.length - 1].onComplete.add(function() {
		//Flip all the cards
		for (let k = 0; k < INITIAL_HAND_SIZE; k++) {
			let tween = getFlipTween(playerHandSprites.getChildAt(k), hand[k].name, k * DELAY);
			if (k == INITIAL_HAND_SIZE - 1) {
				tween.onComplete.add(playSortAnimation);
			}
			tween.start();
		}

	});
	startAllTweens(playerHandTweens);
	startAllTweens(enemyHandTweens);
}

/**
*  Moves all the initialized card sprites to their initial deck position. Then, plays the hand setup animation.
*/
function playDeckSetupAnimation() {
    const SPEED = 300;
    const DELAY = 100;
    let playerTweens = [];
    let enemyTweens = [];
    for (let i = 0; i < INITIAL_DECK_SIZE; i++) {
        playerTweens.push(game.add.tween(playerDeckSprites.getChildAt(i)).to({ x: DECK_X_LOCATION }, SPEED, Phaser.Easing.Linear.Out, false, i * DELAY));
        enemyTweens.push(game.add.tween(enemyDeckSprites.getChildAt(i)).to({ x: GAME_WIDTH - DECK_X_LOCATION }, SPEED, Phaser.Easing.Linear.Out, false, i * DELAY));
    }

    playerTweens[playerTweens.length - 1].onComplete.add(playHandSetupAnimation);
    startAllTweens(playerTweens);
    startAllTweens(enemyTweens);

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
    });
    flipTween.chain(flipTween2);
    return flipTween;
}

function cardSort() {
	hand = sortedHand;
}

function startAllTweens(tweens_array) {
	for (let i = 0; i < tweens_array.length; i++) {
		tweens_array[i].start();
	}
}


function drawPlayerCardAnimation(sprite, delay = 0) {
    const SPEED = 400;
    return game.add.tween(sprite).to({ x: GAME_WIDTH - (2 * CARD_WIDTH), y: (GAME_HEIGHT - (CARD_HEIGHT * CARD_SCALE * ANCHOR * 4)) }, SPEED, Phaser.Easing.Linear.Out, false, delay);
}

function drawEnemyCardAnimation(sprite, delay = 0) {
    const SPEED = 400;
    return game.add.tween(sprite).to({ x: CARD_WIDTH * 2, y: CARD_HEIGHT * CARD_SCALE * ANCHOR * 4}, SPEED, Phaser.Easing.Linear.Out, false, delay);
}

function dumpPlayerCardAnimation(sprite, delay) {
    const SPEED = 400;
    const DELAY = 1500;
    return game.add.tween(sprite).to({x: GAME_WIDTH + CARD_WIDTH }, SPEED, Phaser.Easing.Linear.Out, false, DELAY);
}

function dumpEnemyCardAnimation(sprite, delay) {
    const SPEED = 400;
    const DELAY = 1500;
    return game.add.tween(sprite).to({x: -1 * CARD_WIDTH }, SPEED, Phaser.Easing.Linear.Out, false, DELAY);
}


function endOfChain(chain, newTween) {
    let end = chain;
    while (end.chainedTween != undefined) {
        end = end.chainedTween;
    }
    end.chain(newTween);
}

function onChainComplete(chain, func) {
    let end = chain;
    while (end.chainedTween != undefined) {
        end = end.chainedTween;
    }
    end.onComplete.add(func);
}