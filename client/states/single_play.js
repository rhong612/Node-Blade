var singlePlayState = {
    create: function() {
        socket.emit('start_single_game');

        socket.on('receive_hand', function(cards) {
            const bgm = game.add.audio(BGM);
            bgm.loopFull();
            bgm.volume = 0.2;


            hand = cards.hand.slice();
            playerDraw = cards.playerDraw;
            enemyDraw = cards.enemyDraw;

            initializeCardSprites();
            playSetupAnimation();
            bgm.play();

            currentDeckIndex = INITIAL_HAND_SIZE;
            console.log(playerDraw);
            console.log(enemyDraw);
        });
    },
    update: function() {
    }
}

function getDrawAnimationChain() {
    let playerTween = drawPlayerCardAnimation(playerCardSprites.getChildAt(currentDeckIndex)); 
    let enemyTween = drawEnemyCardAnimation(enemyCardSprites.getChildAt(currentDeckIndex));
    endOfChain(playerTween, getFlipTween(playerCardSprites.getChildAt(currentDeckIndex), playerDraw[0], 0));
    endOfChain(enemyTween, getFlipTween(enemyCardSprites.getChildAt(currentDeckIndex), enemyDraw[0], 0));

    for (let i = 1; i < playerDraw.length; i++) {
        endOfChain(playerTween, dumpPlayerCardAnimation(playerCardSprites.getChildAt(currentDeckIndex)));
        endOfChain(enemyTween, dumpEnemyCardAnimation(enemyCardSprites.getChildAt(currentDeckIndex)));

        currentDeckIndex++;
        endOfChain(playerTween, drawPlayerCardAnimation(playerCardSprites.getChildAt(currentDeckIndex)));
        endOfChain(enemyTween, drawEnemyCardAnimation(enemyCardSprites.getChildAt(currentDeckIndex)));

        endOfChain(playerTween, getFlipTween(playerCardSprites.getChildAt(currentDeckIndex), playerDraw[i], 0));
        endOfChain(enemyTween, getFlipTween(enemyCardSprites.getChildAt(currentDeckIndex), enemyDraw[i], 0));
    }
    playerDraw = [];
    enemyDraw = [];
    return {playerTween: playerTween, enemyTween: enemyTween};
}

function drawPlayerCardAnimation(sprite) {
    const SPEED = 400;
    return game.add.tween(sprite).to({ x: GAME_WIDTH - (2 * CARD_WIDTH), y: (GAME_HEIGHT - (CARD_HEIGHT * CARD_SCALE * ANCHOR * 4)) }, SPEED, Phaser.Easing.Linear.Out, false);
}

function drawEnemyCardAnimation(sprite) {
    const SPEED = 400;
    return game.add.tween(sprite).to({ x: CARD_WIDTH * 2, y: CARD_HEIGHT * CARD_SCALE * ANCHOR * 4}, SPEED, Phaser.Easing.Linear.Out, false);
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