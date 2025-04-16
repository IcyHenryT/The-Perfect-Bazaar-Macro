const Item = require('./Item.js');

class InventoryManager {
    constructor(bot) {
        this.bot = bot;
    }

    getInventory() {
        return this.bot.inventory.slots.map(item => new Item(item));
    }

    getSlot(options = {}) {
        const { uuid, id, name, num } = options;
        const inventory = this.getInventory();

        const slot = inventory.find(item => {
            if (uuid && item.getUuid() !== uuid) return false;
            if (id && item.getId() !== id) return false;
            if (name && item.getName({ noColorCodes: true }) !== name) return false;
            if (name && item.getName({ noColorCodes: false }) !== name) return false;
            if (num && item.slotNum !== num) return false;
            return true;
        });

        return slot;
    }

}

module.exports = InventoryManager;