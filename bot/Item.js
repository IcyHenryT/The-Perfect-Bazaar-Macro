const { simplifyNbt } = require("./Utils.js");

class Item {

    constructor(slot) {
        this.slot = slot;
        this.slotNum = slot?.slot;
        this.nbt = simplifyNbt(slot?.nbt);
    }

    getNbt() {
        return this.nbt;
    }

    getLore(options = {}) {
        const lore = this.nbt?.display?.Lore;

        if (options.noColorCodes) {
            return lore?.map(line => line?.replace(/§./, ""))
        }

        return lore;
    }

    getSlot() {
        return this.slot;
    }

    getUuid() {
        let uuid = this.nbt?.ExtraAttributes?.uuid;
        if (!uuid) {
            uuid = this.getId();
        }
        return uuid;
    }

    getId() {
        const ExtraAttributes = this.nbt?.ExtraAttributes;

        if (!ExtraAttributes) return null;
        let id = ExtraAttributes.id;
        const split = id?.split('_');
        const first = split[0];
        if (first === 'RUNE' || first === "UNIQUE") {//Don't want to list incorrect rune
            id = `${Object.keys(ExtraAttributes.runes)[0]}_RUNE`;
        }
        return id;
    }

    getName(options = {}) {
        const name = this.nbt.display.Name;

        return options.noColorCodes ? name.replace(/§./, "") : name;
    }

    getProfit() {

    }

    getMovingVolume() {

    }

    getPrice() {

    }

    getWeight() {

    }

    isAllowed() {

    }

}

module.exports = Item;