"use strict";

const token = require('../service/token');
const WebSocketMessage = require('../service/webSocketMessage');

//note: polyfill browser environment
global.window = global.document = global;


class GameServer {
	
	constructor(params) {
		
		//Import shared game library code.
		require('./game.js');

		this.verbose = params.verbose || true;
		
		this.artificialLag = params.artificialLag || 0;
		
		this.games = {};
		this.gameCount = 0;
		
		this.messages = [];
		
		this.localTime = 0;
		this._dt = new Date().getTime();
		this._dte = new Date().getTime();
		
		setInterval(() => {
			this._dt = new Date().getTime() - this._dte;
			this._dte = new Date().getTime();
			this.localTime += this._dt / 1000.0;
		}, 4);
	}
	
	log() {
		if(this.verbose)
			console.log.apply(this, arguments);
	}
	
	onMessage(webSocketMessage) {
	
		if(!this.artificialLag)
			return this.messageHandler(webSocketMessage);
	
		//note: stash messages for later
		this.messages.push(webSocketMessage);

		setTimeout(function() {
			
			if(this.messages.length)
				this.messageHandler( this.messages.shift());
				
		//todo: why is _this_ binded if there is no use of the _this_ keyword?
		}.bind(this), this.artificialLag);
	}
	
	messageHandler (webSocketMessage) {
	
		let client = webSocketMessage.client;
		let message = webSocketMessage.message;
		let type = webSocketMessage.type;
	
		let slices = message.split('.');
	
		let otherClient =
			client.game.playerHost.userid == client.userid ?
				client.game.playerClient : client.game.playerHost;
	
		//todo: convert slices into named params in websocketmessage
		if(type == 'input')
			this.onInput(client, slices);
		else if(type == 'player')
			client.send('s.p.' + slices[1]);
		else if(type == 'color')
			if(otherClient)
				otherClient.send('s.c.' + slices[1]);
		else if(type == 'lag')
			this.artificialLag = parseFloat(slices[1]);
	}
	
	onInput (client, slices) {
		// The input commands come in like u-l,
		// so we split them up into separate commands,
		// and then update the players
		var inputCommands = slices[1].split('-');
		var inputTime = slices[2].replace('-','.');
		var inputSeq = slices[3];

		// the client should be in a game, so
		// we can tell that game to handle the input
		if(client && client.game && client.game.gamecore)
			client.game.gamecore.handleServerInput(client, inputCommands, inputTime, inputSeq);
	}

	findGame (player) {

		this.log(`SERVER    | new player looking for a game. ${this.gameCount} games running`);

		//so there are games active,
		//lets see if one needs another player
		if(this.gameCount) {
				
			var joinedAGame = false;

			//Check the list of games for an open game
			for(var gameid in this.games) {
				
				//only care about our own properties.
				if(!this.games.hasOwnProperty(gameid)) continue;
				
				//get the game we are checking against
				var gameInstance = this.games[gameid];

				//If the game is a player short
				if(gameInstance.playerCount < 2) {

					//someone wants us to join!
					joinedAGame = true;
					
					//increase the player count and store
					//the player as the client of this game
					gameInstance.playerClient = player;
					gameInstance.gamecore.players.other.instance = player;
					gameInstance.playerCount++;

					//start running the game on the server,
					//which will tell them to respawn/start
					this.startGame(gameInstance);

				} //if less than 2 players
			} //for all games

			//now if we didn't join a game,
			//we must create one
			if(!joinedAGame) {

				this.createGame(player);

			} //if no join already

		} else { //if there are any games at all

			//no games? create one!
			this.createGame(player);
		}
	}

	createGame (player) {

		//Create a new game instance
		var thegame = {
			id : token(),                //generate a new id for the game
			playerHost: player,         //so we know who initiated the game
			playerClient: null,         //nobody else joined yet, since its new
			playerCount: 1              //for simple checking of state
		};

		//Store it in the list of game
		this.games[ thegame.id ] = thegame;

		//Keep track
		this.gameCount++;

		//Create a new game core instance, this actually runs the
		//game code like collisions and such.
		thegame.gamecore = new gameCore( thegame );
		
		//Start updating the game loop on the server
		thegame.gamecore.update( new Date().getTime() );

		//tell the player that they are now the host
		//s=server message, h=you are hosting

		player.send('s.h.'+ String(thegame.gamecore.localTime).replace('.','-'));
		
		player.game = thegame;
		player.hosting = true;
		
		this.log(`SERVER    | player ${player.userid} created game.id ${player.game.id}`);

		return thegame;
	}
	
	startGame (game) {

		//right so a game has 2 players and wants to begin
		//the host already knows they are hosting,
		//tell the other client they are joining a game
		//s=server message, j=you are joining, send them the host id
		game.playerClient.send('s.j.' + game.playerHost.userid);
		game.playerClient.game = game;

		//now we tell both that the game is ready to start
		//clients will reset their positions in this case.
		game.playerClient.send('s.r.'+ String(game.gamecore.localTime).replace('.','-'));
		game.playerHost.send('s.r.'+ String(game.gamecore.localTime).replace('.','-'));
 
		//set this flag, so that the update loop can run it.
		game.active = true;
	}
	
	endGame (gameid, userid) {
	
			let thegame = this.games[gameid];
	
			if(thegame) {
	
				//stop the game updates immediate
				thegame.gamecore.stopUpdate();
	
				//if the game has two players, the one is leaving
				if(thegame.playerCount > 1) {
	
					//send the players the message the game is ending
					if(userid == thegame.playerHost.userid) {
	
						//the host left, oh snap. Lets try join another game
						if(thegame.playerClient) {
							//tell them the game is over
							thegame.playerClient.send('s.e');
							//now look for/create a new game.
							this.findGame(thegame.playerClient);
						}
						
					} else {
						//the other player left, we were hosting
						if(thegame.playerHost) {
							//tell the client the game is ended
							thegame.playerHost.send('s.e');
							//i am no longer hosting, this game is going down
							thegame.playerHost.hosting = false;
							//now look for/create a new game.
							this.findGame(thegame.playerHost);
						}
					}
				}
	
				delete this.games[gameid];
				this.gameCount--;
	
				this.log(`SERVER    | game ${gameid} removed. there are now ${this.gameCount} running `);
	
			} else {
				this.log(`SERVER    | game ${gameid} was not found!`);
			}
	
		}
}


module.exports = GameServer;