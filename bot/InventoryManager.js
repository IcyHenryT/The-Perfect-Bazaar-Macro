const Item = require('./Item.js');

class InventoryManager {
    constructor(bot) {
        this.bot = bot;
    }

    getInventory() {
        return this.bot.inventory.slots.map(item => new Item(item));
    }

    getWindow() {
        return this.bot.currentWindow ?
            this.bot.currentWindow.slots.map(item => new Item(item)) :
            [];
    }

    getSlot(options = {}) {
        const inventory = options.window ? this.getWindow() : this.getInventory();

        const slot = inventory.find(item => {
            if (!item?.slot) return false;
            let valid = true;

            //Essentially creates an "and" statement
            for (const key in options) {
                let value = options[key];

                switch (key) {
                    case "name":
                        valid = item.getName({ noColorCodes: true }) === value || item.getName({ noColorCodes: false }) === value;
                        break;
                    case "nameIncludes":
                        valid = item.getName({ noColorCodes: true }).includes(value) || item.getName({ noColorCodes: false }).includes(value);
                        break;
                    case "uuid":
                        valid = item.getUuid() === value;
                        break;
                    case "id":
                        valid = item.getId() === value;
                        break;
                    case "loreIncludes":
                        valid = item.getLore({ noColorCodes: true })?.join('\n')?.includes(value) || item.getLore({ noColorCodes: false })?.join('\n')?.includes(value);
                        break;
                    case "num":
                        valid = item.slotNum === value;
                        break;
                }
            }

            return valid;
        });

        return slot || null;
    }

}

module.exports = InventoryManager;