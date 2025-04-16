class Item {

    constructor(slot) {
        this.slot = slot;
        this.nbt = simplifyNbt(slot.nbt);
    }

    getNbt() {
        return this.nbt;
    }

    getLore(options = {}) {
        const lore = this.nbt.Display.lore;

        if (options.noColorCodes) {
            return lore.map(line => line.replace(/§./, ""))
        }

        return lore;
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

    static getFromNbt(nbt) {
        nbt = simplifyNbt(nbt);
        const id = nbt.ExtraAttributes.id;
        if (!id) {
            throw new Error(`Item ID not found in NBT: ${JSON.stringify(nbt)}`);
        }

        return new Item(id);
    }

}

module.exports = Item;