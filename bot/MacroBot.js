const { getConfig } = require("../config.js");
const makeBot = require('./bot.js');
const OrderManager = require('./Orders/OrderManager.js');
const StateManager = require('./States/StateManager.js');
const MessageHandler = require('./MessageHandler.js');
const AutoIsland = require('./AutoIsland.js');
const CleanerUpper = require('./CleanerUpper.js');
const InventoryManager = require('./InventoryManager.js');
const StashManager = require('./StashManager.js');

const config = getConfig();

class MacroBot {

    constructor(ign) {
        this.ign = ign;
        this.bot = null;
        this.orderManager = null;
        this.stateManager = null;
        this.messageHandler = null;
        this.cleanUp = null;
        this.inventoryManager = null;
        this.stashManager = null;
        this.autoIsland = null;
    }

    async init() {
        this.bot = await makeBot(this.ign);

        this.stateManager = new StateManager(this.bot);
        this.inventoryManager = new InventoryManager(this.bot);
        this.orderManager = new OrderManager(this.bot, this.stateManager, this.inventoryManager);
        this.messageHandler = new MessageHandler(this.bot, this.stateManager, this.orderManager);
        this.autoIsland = new AutoIsland(this.bot, this.stateManager);
        this.stashManager = new StashManager(this.bot, this.stateManager, this.inventoryManager);
        this.cleanUp = new CleanerUpper(this.bot, this.stateManager, this.stashManager, this.inventoryManager);

        this.bot._client.on('open_window', async (window) => {
            const windowName = window.windowTitle;
            console.log(windowName);
        })

        this.autoIsland.whenReady(async () => {
            console.log('ready')
            await this.cleanUp.clean();

            await this.orderManager.setUp();
            console.log(this.orderManager.orders.map(order => `${order.item.getName({ noColorCodes: true})}:${order.size}`));
        })

    }

}

module.exports = MacroBot;