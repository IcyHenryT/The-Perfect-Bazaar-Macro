class OrderType {
    static BUY = 'BUY';
    static SELL = 'SELL';

    static getTypeFromItem(item) {
        let name = item.getName();

        return name.includes(this.BUY) ? this.BUY : this.SELL;
    }

}

module.exports = OrderType;