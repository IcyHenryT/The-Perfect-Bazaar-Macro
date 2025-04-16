const { getConfig } = require("../config.js");

class MessageHandler {
    constructor(bot, stateManager, orderManager) {
        this.bot = bot;
        this.stateManager = stateManager;
        this.orderManager = orderManager;

        this.init();
    }

    init() {
        this.bot.on('message', (message, type) => {
            if (type !== 'chat') return;
            let text = message.getText(null).trim();
            if (!text) return;

            this.handleMessage(message, text);
        });
    }

    async handleMessage(message, text) {
        let sentMessage = false;

        switch(message) {
            //stuff
        }

        if (!sentMessage) {
            console.log(message.toAnsi())
        }
    }
}

module.exports = MessageHandler;