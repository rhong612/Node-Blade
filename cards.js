"use strict";
class Card {

    /*
    *   sort_value - used to determine card sorting order at the beginning of the game
    *   draw_value - used to break ties when comparing cards drawn from the deck
    *   activate - callback function that applies the card's effect. the function should take a MultiGame object. Return true if the card activated successfully. Return false otherwise. The default function simply adds the card's draw_value to the appropriate player
    */
    constructor(name, sort_value, draw_value, activate = function(game) {
        if (game.turn === 1) {
            game.playerOneScore += this.draw_value;
            game.playerOneField.push(this);
            game.playerOneBolt = undefined;
        }
        else {
            game.playerTwoScore += this.draw_value;
            game.playerTwoField.push(this);
            game.playerTwoBolt = undefined;
        }
        return true;
    }) {
        this.name = name;
        this.sort_value = sort_value;
        this.draw_value = draw_value;
        this.activate = activate;
    }
}


//List of cards
const BOLT = new Card('BOLT', 8, 1, function(game) {
    if (game.turn === 1) {
        if (game.playerTwoBolt) {
            return false;
        }
        game.playerTwoBolt = game.playerTwoField.pop(); //Remove top field card
        //Cut score in half if bolted card was force
        if (game.playerTwoBolt.name === FORCE.name) {
            game.playerTwoScore = Math.floor(game.playerTwoScore / 2); //Note: Math.floor is used to ensure that the score hits 0 if a force that is drawn as the 1st card is bolted away
        }
        //Else simply subtract the card's value
        else {
            game.playerTwoScore -= game.playerTwoBolt.draw_value;
        }
    }
    else {
        if (game.playerOneBolt) {
            return false;
        }
        game.playerOneBolt = game.playerOneField.pop();
        if (game.playerOneBolt.name === FORCE.name) {
            game.playerOneScore = Math.floor(game.playerOneScore / 2);
        }
        else {
            game.playerOneScore -= game.playerOneBolt.draw_value;
        }
    }
    return true;
});


const MIRROR = new Card('MIRROR', 10, 1, function(game) {
    let tempScore = game.playerOneScore;
    game.playerOneScore = game.playerTwoScore;
    game.playerTwoScore = tempScore;

    let tempField = game.playerOneField;
    game.playerOneField = game.playerTwoField;
    game.playerTwoField = tempField;

    let tempBolt = game.playerOneBolt;
    game.playerOneBolt = game.playerTwoBolt;
    game.playerTwoBolt = tempBolt;

    return true;
})

const FORCE = new Card('FORCE', 11, 1, function(game) {
    if (game.turn === 1) {
        game.playerOneScore *= 2;
        game.playerOneField.push(this);
        game.playerOneBolt = undefined;
    }
    else {
        game.playerTwoScore *= 2;
        game.playerTwoField.push(this);
        game.playerTwoBolt = undefined;
    }
    return true;
})

const WAND = new Card('WAND', 1, 1, function(game) {
    if (game.turn === 1) {
        if (game.playerOneBolt) {
            //Don't activate the card if it's the 1st card
            if (game.playerOneField.length === 1) {
                game.playerOneField.push(game.playerOneBolt);
                game.playerOneScore += game.playerOneBolt.draw_value;
                game.playerOneBolt = undefined;
            }
            else {
                game.playerOneBolt.activate(game);
                game.playerOneBolt = undefined;
            }
        }
        else {
            game.playerOneScore += 1;
            game.playerOneField.push(this);
        }
    }
    else {
        if (game.playerTwoBolt) {
            //Don't activate the card if it's the 1st card
            if (game.playerTwoField.length === 1) {
                game.playerTwoField.push(game.playerTwoBolt);
                game.playerTwoScore += game.playerTwoBolt.draw_value;
                game.playerTwoBolt = undefined;
            }
            else {
                game.playerTwoBolt.activate(game);
                game.playerTwoBolt = undefined;
            }
        }
        else {
            game.playerTwoScore += 1;
            game.playerTwoField.push(this);
        }
    }
    return true;
})

const TWO_CARD = new Card('BLADE_PISTOL', 2, 2)
const THREE_CARD = new Card('BOW', 3, 3)
const FOUR_CARD = new Card('SWORD', 4, 4)
const FIVE_CARD = new Card('SHOTGUN', 5, 5)
const SIX_CARD = new Card('SPEAR', 6, 6)
const SEVEN_CARD = new Card('BROADSWORD', 7, 7)


module.exports = {
    BOLT: BOLT,
    MIRROR: MIRROR,
    FORCE: FORCE,
    WAND: WAND,
    TWO_CARD: TWO_CARD,
    THREE_CARD: THREE_CARD,
    FOUR_CARD: FOUR_CARD,
    FIVE_CARD: FIVE_CARD,
    SIX_CARD: SIX_CARD,
    SEVEN_CARD: SEVEN_CARD
};