const Order = require('./Order.js');

class OrderManager {

    constructor(bot) {
        this.bot = bot;
        this.orders = [];
    }

    addOrder(nbt) {
        this.orders.push(new Order(nbt));
    }

    async removeOrder(nbt) {
        for (let i = 0; i < this.orders.length; i++) {
            const order = this.orders[i];
            if (order.nbt === nbt) {
                if (!order.wasClaimed()) await order.cancelOrder();
                this.orders.splice(i, 1);
                break;
            }
        }
    }
}

module.exports = OrderManager;