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
    const DELAY = 500;
    let cardsLeft = playerDraw.length;

    let playerTween = drawCardAnimation(playerCardSprites[currentDeckIndex]); 
    let enemyTween = drawCardAnimation(enemyCardSprites[currentDeckIndex]);
    cardsLeft--;

    while (cardsLeft > 0) {
        endOfChain(playerTween, dumpCardAnimation(playerCardSprites[currentDeckIndex], DELAY));
        endOfChain(enemyTween, dumpCardAnimation(enemyCardSprites[currentDeckIndex], DELAY));

        currentDeckIndex++;
        endOfChain(playerTween, drawCardAnimation(playerCardSprites[currentDeckIndex]));
        endOfChain(enemyTween, drawCardAnimation(enemyCardSprites[currentDeckIndex]));
        cardsLeft--;
    }
    return {playerTween: playerTween, enemyTween: enemyTween};
}

function drawCardAnimation(sprite) {
    const SPEED = 400;
    return game.add.tween(sprite).to({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2  }, SPEED, Phaser.Easing.Linear.Out, false);
}

function dumpCardAnimation(sprite, delay) {
    const SPEED = 400;
    return game.add.tween(sprite).to({x: -1 * CARD_WIDTH }, SPEED, Phaser.Easing.Linear.Out, false, delay);
}

function endOfChain(chain, newTween) {
    let end = chain;
    while (end.chainedTween != undefined) {
        end = end.chainedTween;
    }
    end.chain(newTween);
}