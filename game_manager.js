let MultiGame = require('./multi_game');
let pm = require('./player_manager');
let constants = require('./constants');


class GameManager {
    constructor(playerManager) {
        this.num_games = 0;
        this.current_ongoing_games = [];
        this.playerManager = pm;
    }

    /**
    *   Getter for the player manager
    *   @return the PlayerManager object
    */
    getPlayerManager() {
        return this.playerManager;
    }

    /**
    *   Creates a new MultiGame for the 2 socket IDs
    *   @param id1 - the id for player 1
    *   @param id2 - the id for player 2
    */
    createMultiGame(id1, id2, io) {
        let gameID = this.num_games;
        let newGame = new MultiGame(gameID, id1, id2, this.playerManager.getPlayer(id1).username, this.playerManager.getPlayer(id2).username);
        this.current_ongoing_games.push(newGame);

        this.playerManager.getPlayer(id1).currentGameID = gameID;
        this.playerManager.getPlayer(id2).currentGameID = gameID;
        this.playerManager.getPlayer(id1).status = constants.STATUS_INGAME;
        this.playerManager.getPlayer(id2).status = constants.STATUS_INGAME;

        let unsortedPlayerOneHand = newGame.playerOneHand.slice();
        let unsortedPlayerTwoHand = newGame.playerTwoHand.slice();
        newGame.sort(newGame.playerOneHand);
        newGame.sort(newGame.playerTwoHand);

        io.to(newGame.playerOneID).emit('receive_hand_multi', {playerNum: 1, hand: unsortedPlayerOneHand.map(card=>card.name), sortedHand: newGame.playerOneHand.map(card=>card.name)});
        io.to(newGame.playerTwoID).emit('receive_hand_multi', {playerNum: 2, hand: unsortedPlayerTwoHand.map(card=>card.name), sortedHand: newGame.playerTwoHand.map(card=>card.name)});


        if (this.num_games + 1 === Number.MAX_SAFE_INTEGER) {
            this.num_games = 0;
        }
        else {
            this.num_games++;
        }
    }

    /**
    *   Gets the game associated with the given ID
    *   @param gameID - the ID of the game
    *   @returns - A MultiGame with the given ID
    */
    getGame(gameID) {
        return this.current_ongoing_games[gameID];
    }

    removeGame(gameID) {
        let game = this.current_ongoing_games[gameID];
        if (game) {
            let id1 = game.playerOneID;
            let id2 = game.playerTwoID;
            this.playerManager.getPlayer(id1).currentGameID = constants.NO_GAME;
            this.playerManager.getPlayer(id1).status = constants.STATUS_MENU;
            this.playerManager.getPlayer(id2).currentGameID = constants.NO_GAME;
            this.playerManager.getPlayer(id2).status = constants.STATUS_MENU;
            delete this.current_ongoing_games[gameID];
            return game;
        }
        return undefined;
    }
}

module.exports = new GameManager();