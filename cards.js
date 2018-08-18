class Card {

    /*
    *   sort_value - used to determine card sorting order at the beginning of the game
    *   draw_value - used to break ties when comparing cards drawn from the deck
    *   activate - callback function that applies the card's effect
    */
    constructor(name, sort_value, draw_value, activate) {
        this.name = name;
        this.sort_value = sort_value;
        this.draw_value = draw_value;
        this.activate = activate;
    }
}


//List of cards
const BOLT = new Card('BOLT', 8, 0, function() {

});

const BLAST = new Card('BLAST', 9, 0, function() {

})

const MIRROR = new Card('MIRROR', 10, 0, function() {
    
})

const FORCE = new Card('FORCE', 11, 0, function() {
    
})

const WAND = new Card('WAND', 1, 1, function() {
    
})

const TWO_CARD = new Card('BLADE_PISTOL', 2, 2, function() {
    
})

const THREE_CARD = new Card('BOW', 3, 3, function() {
    
})

const FOUR_CARD = new Card('SWORD', 4, 4, function() {
    
})

const FIVE_CARD = new Card('SHOTGUN', 5, 5, function() {
    
})

const SIX_CARD = new Card('SPEAR', 6, 6, function() {
    
})

const SEVEN_CARD = new Card('BROADSWORD', 7, 7, function() {
    
})


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