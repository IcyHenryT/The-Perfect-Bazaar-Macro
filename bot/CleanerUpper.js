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

                await this.claimAllSoldOrders();

                const closeButton = this.inventoryManager.getSlot({ window: true, name: "Go Back" });
                bot.betterClick(closeButton.slotNum);

                //Click sell entire inventory
                await betterOnce(bot, 'windowOpen');
                bot.betterClick(47);

                try {
                    //Click confirm
                    await betterOnce(bot, 'windowOpen');
                    bot.betterClick(11);
                } catch (e) {
                    console.log(`Error selling inv, probably not items`, e);
                }

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

    async relistOneBuyOrder() {
        return new Promise((resolve) => {
            console.log(`Starting to relist order`);
            const buyOrder = this.inventoryManager.getSlot({ window: true, nameIncludes: "BUY" });
            if (buyOrder.getLore({ noColorCodes: true })?.includes("100%")) {
                console.log(`Order already 100%`);
            }

            if (!buyOrder) return resolve(false);

            this.bot.betterClick(buyOrder.slotNum);
            resolve(true);
        })
    }

    async claimAllSoldOrders() {
        const claimAll = this.inventoryManager.getSlot({ window: true, name: "Claim All Coins" });
        console.log(claimAll);

        this.bot.betterClick(claimAll.slotNum, 0, 0);
        await betterOnce(this.bot, 'windowOpen');

        return;
        while (true) {
            const result = await this.claimOneSoldOrder();
            if (!result) {
                console.log(`No more orders to claim`);
                break;
            }
            console.log(`Claimed an order`);

            await sleep(1000);
        }
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

    async claimOneSoldOrder() {
        return new Promise((resolve) => {
            console.log(`Starting to claim order`);
            const soldOrder = this.inventoryManager.getSlot({ window: true, loreIncludes: "100%!", nameIncludes: "SELL" });

            if (!soldOrder) return resolve(false);

            this.bot.betterClick(soldOrder.slotNum);
            resolve(true);
        })
    }

    async flipOneOrder() {
        return new Promise(async (resolve) => {
            console.log(`Starting to flip order`);
            const order = this.inventoryManager.getSlot({ window: true, nameIncludes: "BUY" });
            if (!order) return resolve(false);

            const itemName = order.getName({ noColorCodes: true }).split(" ").splice(1).join(" ");

            if (order.getLore({ noColorCodes: true })?.includes("100%")) {
                console.log(`${itemName} is 100%, flipping`);
                this.bot.betterClick(order.slotNum, 1, 0);

                await betterOnce(this.bot, 'windowOpen');
                const activeOrders = this.inventoryManager.getSlot({ window: true, num: 15 }).getLore({ noColorCodes: true });
                let orderPrice;
                for (const order of activeOrders) {
                    if (!order.includes('each')) continue;
                    orderPrice = parseFloat(order.split(' ')[1]);
                    break;
                }

                console.log(`Order price: ${orderPrice}`);
                this.bot.betterClick(15, 0, 0);
                await betterOnce(this.bot, 'windowOpen');

                this.bot.editSign((orderPrice - 0.1).toString());
                await betterOnce(this.bot, 'windowOpen');

                return resolve(true);
            }

            this.bot.betterClick(order.slotNum);
            resolve(true);
        })
    }
}

module.exports = CleanerUpper;