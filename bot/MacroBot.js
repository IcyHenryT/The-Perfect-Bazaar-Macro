const { getConfig } = require("./config.js");
const makeBot = require('./bot.js');
const OrderManager = require('./OrderManager.js');

const config = getConfig();

class MacroBot {

    constructor(ign) {
        this.ign = ign;
        this.bot = null;
        this.orderManager = null;

        this.init();
    }

    async init() {
        this.bot = await makeBot(this.ign);

        this.orderManager = new OrderManager(this.bot);
    }

}

module.exports = MacroBot;