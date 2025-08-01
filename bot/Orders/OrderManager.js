const Order = require('./Order.js');
const OrderType = require('./OrderType.js');
const States = require('../States/States.js');

class OrderManager {

    constructor(bot, stateManager, inventoryManager) {
        this.stateManager = stateManager;
        this.bot = bot;
        this.inventoryManager = inventoryManager;
        this.orders = [];

        this.addOrder = this.addOrder.bind(this);
    }

    addOrder(item) {
        this.orders.push(new Order(item, this.bot, this.stateManager, this.inventoryManager));
    }

    async removeOrder(item) {
        this.orders = this.orders.filter(async order => {
            if (order.nbt == item.nbt) {
                if (!order.wasClaimed()) await order.cancelOrder();
                return false;
            }
            return true;
        })
    }

    async setUp() {
        console.log(`Starting to setup`);

        const { stateManager, bot, inventoryManager } = this;
        stateManager.set(States.CLEANING);
        try {

            await bot.ensureOrdersOpen();
            
            const window = inventoryManager.getWindow();

            window.forEach(item => {
                let name = item.getName({ noColorCodes: true});
                let isOrder = name?.includes(OrderType.BUY) || name?.includes(OrderType.SELL);

                if (isOrder) this.addOrder(item);
            });
            
        } catch(e) {
            console.error(`Error setting up orders`, e);
        } finally {
            stateManager.set(States.WAITING);
            bot.betterWindowClose();
        }
    }
}

module.exports = OrderManager;