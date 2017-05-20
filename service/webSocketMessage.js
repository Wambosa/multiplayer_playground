"use strict";


class WebSocketMessage {
	
	constructor(params) {

		this.client = params.client;
		this.message = params.message;
		
		this.hint = params.message.slice(0,1);
		this.type = {
			i: "input",
			c: "color",
			l: "lag",
			p: "player"
		}[this.hint];
	}
}


module.exports = WebSocketMessage;