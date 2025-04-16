const { getConfig } = require("../config.js");
const makeBot = require('./bot.js');
const OrderManager = require('./Orders/OrderManager.js');
const StateManager = require('./States/StateManager.js');
const MessageHandler = require('./MessageHandler.js');
const AutoIsland = require('./AutoIsland.js');

const config = getConfig();

class MacroBot {

    constructor(ign) {
        this.ign = ign;
        this.bot = null;
        this.orderManager = null;
        this.stateManager = null;
        this.messageHandler = null;
        this.autoIsland = null;
    }

    async init() {
        this.bot = await makeBot(this.ign);

        this.stateManager = new StateManager(this.bot);
        this.orderManager = new OrderManager(this.bot);
        this.messageHandler = new MessageHandler(this.bot, this.stateManager, this.orderManager);
        this.autoIsland = new AutoIsland(this.bot, this.stateManager);
    }

}

module.exports = MacroBot;