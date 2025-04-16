const OrderType = require('./OrderType.js');
const Item = require('./Item.js');

class Order {

    constructor(nbt) {
        this.nbt = nbt;
        this.item = Item.getFromNbt(nbt);
        this.type = OrderType.getTypeFromNbt(nbt);
        this.isClaimed = false;
    }

    async cancelOrder() {

    }

    async claimOrder() {


        this.isClaimed = true;
    }

    async flipOrder() {

    }
    
    wasClaimed() {
        return this.isClaimed;
    }

}

module.exports = Order;