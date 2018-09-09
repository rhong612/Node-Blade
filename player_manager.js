"use strict";
const constants = require('./constants')

class Player {
	constructor(username) {
		this.username = username;
		this.currentGameID = constants.NO_GAME;
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
		let username = ('guest' + Math.floor(Math.random() * 10000));
		while (this.contains(username)) {
			username = ('guest' + Math.floor(Math.random() * 10000));
		}
		this.playersOnline[socket.id] = new Player(username);
		socket.emit('display_name', username);
		this.io.emit('update_players', this.getListOfPlayerNames());
	}

	movePlayerToWaitingLobby(id) {
		this.playersWaitingLobby[id] = this.playersOnline[id];
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

	contains(username) {
		for (let id in this.getOnlinePlayers()) {
				if (this.getOnlinePlayers()[id].username === username) {
					return true;
			}
		}
		return false;
	}
}



module.exports = new PlayerManager();