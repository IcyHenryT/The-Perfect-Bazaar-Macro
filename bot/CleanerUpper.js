const OrderType = require('./Orders/OrderType.js');
const Order = require('./Orders/Order.js');
const States = require('./States/States.js');
const { sleep } = require('./Utils.js');

class CleanerUpper {
    constructor(bot, state, stash, inventoryManager) {
        this.bot = bot;
        this.state = state;
        this.stash = stash;
        this.inventoryManager = inventoryManager;
    }

    async clean() {
        console.log(`Starting to clean`);

        const { state, bot, stash } = this;
        state.set(States.CLEANING);
        try {
            await stash.clearMaterials();

            try {
                await bot.ensureOrdersOpen();

                console.log(`Starting to claim sold orders`);

                await this.claimAllSoldOrders();

                console.log(`Claimed all sold orders`);

                const closeButton = this.inventoryManager.getSlot({ window: true, name: "Go Back" });
                bot.betterClick(closeButton.slotNum);
                console.log(`Clicking sold`);

                console.log(`Starting to sell inv`);

                await bot.newWindow("Bazaar");
                bot.betterClick(47);

                try {
                    await bot.newWindow("Are you sure?");
                    bot.betterClick(11);
                    await bot.newWindow("Bazaar");
                } catch (e) {
                    console.log(`Error selling inv, probably no items`, e);
                }

                console.log(`sold inv`);

                bot.betterClick(50);
                await bot.newWindow("Bazaar Orders");

                await this.flipAllOrders();

            } catch (e) {
                console.log(`Error with claiming BZ`, e);
            }
        } catch (e) {
            console.error(`Error while cleaning:`, e);
        } finally {
            state.set(States.WAITING);
            bot.betterWindowClose();
        }
    }

    async claimAllSoldOrders() {
        const claimAll = this.inventoryManager.getSlot({ window: true, name: "Claim All Coins" });

        this.bot.betterClick(claimAll.slotNum, 0, 0);
        await sleep(500);
        return;
    }

    async flipAllOrders() {
        while (true) {
            const result = await this.flipOneOrder();
            if (!result) {
                console.log(`No more orders to flip`);
                break;
            }
            console.log(`Flipped an order`);

            await sleep(1000);
        }
    }

    async flipOneOrder() {
        return new Promise(async (resolve) => {
            console.log(`Starting to flip order`);
            const orderSlot = this.inventoryManager.getSlot({ window: true, nameIncludes: OrderType.BUY, loreIncludes: "100%" });

            if (!orderSlot) return resolve(false);

            const order = new Order(orderSlot, this.bot, this.state, this.inventoryManager);

            await order.flip()
            resolve(true)
        })
    }
}

module.exports = CleanerUpper;