const constants = require('./constants')

class Player {
	constructor(username) {
		this.username = username;
		this.currentGameID = constants.NO_GAME;
		this.status = constants.STATUS_MENU;
	}

	onMenu() {
		return this.status === constants.STATUS_MENU;
	}
}


class PlayerManager {
	constructor(io) {
		this.playersOnline= {};
		this.playersWaitingLobby = {};
		this.io = io;
	}

	attachIO(io) {
		this.io = io;
	}

	addNewPlayer(socket) {
		const username = ('guest' + new Date().valueOf()).substring(0, constants.MAX_USERNAME_LENGTH - 1);
		this.playersOnline[socket.id] = new Player(username);
		socket.emit('display_name', username);
		this.io.emit('update_players', this.getListOfPlayerNames());
	}

	movePlayerToWaitingLobby(id) {
		this.playersWaitingLobby[id] = this.playersOnline[id];
		this.playersWaitingLobby[id].status = constants.STATUS_WAITING;
		this.io.sockets.connected[id].join('waiting_room');
		this.refreshWaitingList();
	}

	removePlayersFromWaitingLobby(ids) {
		for (let i = 0; i < ids.length; i++) {
			delete this.playersWaitingLobby[ids[i]];
			this.io.sockets.connected[ids[i]].leave('waiting_room');
		}
		this.refreshWaitingList();
	}

	getPlayer(id) {
		return this.playersOnline[id];
	}

	removePlayer(id) {
		delete this.playersOnline[id];
		delete this.playersWaitingLobby[id];
		this.refreshWaitingList();
		this.updateOnlinePlayersList();
	}

	getListOfPlayerNames() {	
		const usernameList = [];
		for (const player in this.playersOnline) {
			usernameList.push(this.playersOnline[player].username);
		}
		return usernameList;
	}

	getWaitingLobby() {
		return this.playersWaitingLobby;
	}

	getOnlinePlayers() {
		return this.playersOnline;
	}

	refreshWaitingList() {
		this.io.in('waiting_room').emit('client_waiting_list', this.playersWaitingLobby);
	}

	updateOnlinePlayersList() {
		this.io.emit('update_players', this.getListOfPlayerNames());
	}
}



module.exports = new PlayerManager();