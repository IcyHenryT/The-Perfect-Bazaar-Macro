const States = require('./States/States.js');
const { betterOnce, sleep } = require('./Utils.js');

class StashManager {
    constructor(bot, state, InventoryManager) {
        this.bot = bot;
        this.state = state;
        this.inventoryManager = InventoryManager;
    }

    async openStash(type) {
        console.log(`Opening stash`);

        const { bot } = this;
        try {
            bot.chat(`/viewstash ${type}`);
            try {
                await betterOnce(bot, 'windowOpen')
            } catch {
                console.log(`Stash is already empty :)`)
            };
        } catch (e) {
            console.error(`Error while opening stash:`, e);
            bot.betterWindowClose();
            throw e;
        }
    }

    async clearMaterials() {
        console.log('Clearing stash');

        const { bot, inventoryManager } = this;

        try {
            await this.openStash('material');

            if (!bot.currentWindow) return;

            const sellButton = inventoryManager.getSlot({ window: true, name: "Sell Stash Now" });

            bot.betterClick(sellButton.slotNum);
            await betterOnce(bot, 'windowOpen');

            bot.betterClick(11);
            await sleep(500);
            return;
        } catch (e) {
            console.error(`Error cleaning stash`, e);
            bot.betterWindowClose();
            throw e;
        }
    }
}

module.exports = StashManager;