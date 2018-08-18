class Card {

    /*
    *   sort_value - used to determine card sorting order at the beginning of the game
    *   draw_value - used to break ties when comparing cards drawn from the deck
    *   activate - callback function that applies the card's effect. the function should take a MultiGame object. The default function simply adds the card's draw_value to the appropriate player
    */
    constructor(name, sort_value, draw_value, activate = function(game) {
        if (game.turn === 1) {
            game.playerOneScore += this.draw_value;
        }
        else {
            game.playerTwoScore += this.draw_value;
        }
    }) {
        this.name = name;
        this.sort_value = sort_value;
        this.draw_value = draw_value;
        this.activate = activate;
    }
}


//List of cards
const BOLT = new Card('BOLT', 8, 0, function(game) {

});

const BLAST = new Card('BLAST', 9, 0, function(game) {

})

const MIRROR = new Card('MIRROR', 10, 0, function(game) {
    
})

const FORCE = new Card('FORCE', 11, 0, function(game) {
    
})

const WAND = new Card('WAND', 1, 1, function(game) {
    
})

const TWO_CARD = new Card('BLADE_PISTOL', 2, 2)
const THREE_CARD = new Card('BOW', 3, 3)
const FOUR_CARD = new Card('SWORD', 4, 4)
const FIVE_CARD = new Card('SHOTGUN', 5, 5)
const SIX_CARD = new Card('SPEAR', 6, 6)
const SEVEN_CARD = new Card('BROADSWORD', 7, 7)


module.exports = {
    BOLT: BOLT,
    BLAST: BLAST,
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