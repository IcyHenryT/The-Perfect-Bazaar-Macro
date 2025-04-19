const States = require('./States/States.js');
const { betterOnce, sleep } = require('./Utils.js');

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

            //Open BZ
            try {
                bot.chat(`/managebazaarorders`);
                await betterOnce(bot, 'windowOpen');
                console.log(`starting to claim sold orders`);

                await this.claimAllSoldOrders();

                console.log(`Claimed all sold orders`);

                const closeButton = this.inventoryManager.getSlot({ window: true, name: "Go Back" });
                bot.betterClick(closeButton.slotNum);
                console.log(`Clicking sold`);


                console.log(`Starting to sell inv`);
                //Click sell entire inventory
                await betterOnce(bot, 'windowOpen');
                bot.betterClick(47);

                try {
                    //Click confirm
                    await betterOnce(bot, 'windowOpen');
                    bot.betterClick(11);
                    await betterOnce(bot, 'windowOpen');
                } catch (e) {
                    console.log(`Error selling inv, probably not items`, e);
                }

                console.log(`sold inv`);

                //Open orders again
                bot.betterClick(50);
                await betterOnce(bot, 'windowOpen');

                this.flipAllOrders();

            } catch (e) {
                console.log(`Error with claiming BZ`, e);
            }
        } catch (e) {
            console.error(`Error while cleaning:`, e);
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
            const order = this.inventoryManager.getSlot({ window: true, nameIncludes: "BUY", loreIncludes: "100%" });
            console.log(order);
            if (!order) return resolve(false);

            const itemName = order.getName({ noColorCodes: true }).split(" ").splice(1).join(" ");

            console.log(`${itemName} is 100%, flipping`);
            this.bot.betterClick(order.slotNum, 1, 0);

            await betterOnce(this.bot, 'windowOpen');
            const activeOrders = this.inventoryManager.getSlot({ window: true, num: 15 }).getLore({ noColorCodes: true });
            console.log(activeOrders);
            let orderPrice;
            for (const order of activeOrders) {
                if (!order.includes('each')) continue;
                orderPrice = parseFloat(order.split(' ')[1]);
                break;
            }

            console.log(`Order price: ${orderPrice}`);
            if (!orderPrice || isNaN(orderPrice)) {
                console.log(`No order price found for ${itemName}`);
                return resolve(false);
            }

            this.bot.betterClick(15, 0, 0);
            await this.bot.waitForTicks(3);

            this.bot.editSign((orderPrice - 0.1).toString());
            await betterOnce(this.bot, 'windowOpen');

            return resolve(true);
        })
    }
}

module.exports = CleanerUpper;