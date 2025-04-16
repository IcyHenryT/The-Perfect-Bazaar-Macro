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

    async claimOneSoldOrder() {
        return new Promise((resolve) => {
            console.log(`Starting to claim order`);
            const soldOrder = this.inventoryManager.getSlot({ window: true, loreIncludes: "100%!", nameIncludes: "SELL" });

            if (!soldOrder) return resolve(false);
            
            this.bot.betterClick(soldOrder.slotNum);
            resolve(true);
        })
    }
}

module.exports = CleanerUpper;