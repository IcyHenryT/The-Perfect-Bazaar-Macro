class Item {

    constructor(id) {
        this.id = id;
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