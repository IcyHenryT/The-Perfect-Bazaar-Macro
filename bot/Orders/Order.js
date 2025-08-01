const OrderType = require('./OrderType.js');
const Item = require('../Item.js');
const States = require('../States/States.js');
const { onlyNumbers } = require('../Utils.js');

class Order {

    constructor(item, bot, stateManager, inventoryManager) {
        this.item = item;
        this.nbt = item.nbt;
        this.bot = bot;
        this.stateManager = stateManager;
        this.inventoryManager = inventoryManager;
        this.type = OrderType.getTypeFromItem(item);
        this.isClaimed = false;
        this.percentFilled = 0;
        this.size = this.getSize();
    }

    getSize() {
        const lore = this.item.getLore({ noColorCodes: true });
        const keyWord = this.type === OrderType.BUY ? "Order amount:" : "Offer amount:";
        const line = lore.find(line => line.includes(keyWord));
        if (!line) throw new Error(`Failed to find ${keyWord} line ${JSON.stringify(lore)}!`);
        const size = onlyNumbers(line);
        this.size = size;
        return size;
    }

    findPercent() {
        const lore = this.item.getLore({ noColorCodes: true });
        const line = lore.find(line => line.includes("Filled:"));
        if (!line) throw new Error(`Failed to find filled line ${JSON.stringify(lore)}!`);
        const filled = onlyNumbers(line.split(" ")[2]);
        this.percentFilled = filled;
        return filled;
    }

    async cancel() {
        
    }

    async claim(options = { requireFilled: false, requireSpace: false }) {
        const { bot, stateManager } = this;

        try {
            stateManager.set(States.CLAIMING);

            await bot.ensureOrdersOpen();

            const slot = this.item.refindSlot(bot.currentWindow);

            if (!slot) throw new Error(`Slot not found! Was in ${this.item.slot} before`);
            const item = new Item(slot);
            this.item = item;
            this.nbt = item.nbt;

            const lore = item.getLore({ noColorCodes: true }); 
            
            const claimLine = lore.find(line => line?.includes("You have"));
            const amount = onlyNumbers(claimLine.split('.')[0]);

            if (!amount) throw new Error(`Amount not found! Was in ${claimLine} before`);

            const filled = this.findPercent() === 100;
    
            if (options.requireFilled && !filled) throw new Error(`Tried claiming order but it's only ${this.percentFilled}% filled!`); 

            this.isClaimed = true;

            if (this.type === OrderType.BUY) { 
                const spaceLeft = bot.inventory.slots.filter(slot => slot.item == null).length;
                const maxItems = spaceLeft * 64;

                if (amount > maxItems) {
                    this.isClaimed = false;
                    if (options.requireSpace) throw new Error(`Tried claiming order but it has ${amount} to claim and only ${maxItems} left in inventory!!`);
                }

            }

            bot.betterClick(slot.slot);
        } catch (e) {
            console.error(`Error claiming ${this.type} order`, e);
            this.isClaimed = false;
        } finally {
            await bot.waitForTicks(5);
            stateManager.set(States.WAITING);
        }
    }

    async flip(options = { price: null }) {
        if (this.type !== OrderType.BUY) throw new Error("Only buy orders can be flipped");

        const { bot, stateManager, inventoryManager } = this;

        try {
            stateManager.set(States.CLAIMING);
            await bot.ensureOrdersOpen();


            console.log(`Got bazaar orders`);

            const slot = this.item.refindSlot(bot.currentWindow);

            if (!slot) throw new Error(`Slot not found! Was in ${this.item.slot} before`);
            const item = new Item(slot);
            this.item = item;
            this.nbt = item.nbt;

            const filled = this.findPercent() === 100;
    
            if (!filled) throw new Error(`Tried flipping order but it's only ${this.percentFilled}% filled!`); 

            const itemName = this.item.getName({ noColorCodes: true }).split(" ").splice(1).join(" ");

            console.log(`${itemName} is 100%, flipping`);
            this.bot.betterClick(slot.slot, 1, 0);

            let price = options.price;

            await this.bot.newWindow("Order options");
            if (!price) {
                const activeOrders = inventoryManager.getSlot({ window: true, num: 15 }).getLore({ noColorCodes: true });
                console.log(activeOrders);

                for (const order of activeOrders) {
                    if (!order.includes('each')) continue;
                    price = parseFloat(order.split(' ')[1]);
                    break;
                }
            }

            console.log(`Order price: ${price}`);
            if (!price || isNaN(price)) {
                console.log(`No order price found for ${itemName}`);
                return resolve(false);
            }

            this.bot.betterClick(15, 0, 0);
            await this.bot.waitForTicks(3);

            this.bot.editSign((price - 0.1).toString());
            await this.bot.newWindow("Bazaar Orders");

            this.isClaimed = true
        } catch (e) {
            console.error(`Error flipping buy order`, e);
            this.isClaimed = false;
        } finally {
            await bot.waitForTicks(5);
            stateManager.set(States.WAITING);
        }
    }
    
    wasClaimed() {
        return this.isClaimed;
    }

}

module.exports = Order;