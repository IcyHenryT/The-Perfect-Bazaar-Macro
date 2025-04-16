const States = require('./States/States.js');
const { betterOnce } = require('./Utils.js');

class CleanerUpper {
    constructor(bot, state, stash) {
        this.bot = bot;
        this.state = state;
        this.stash = stash;
    }

    async clean() {
        console.log(`Starting to clean`);

        const { state, bot, stash } = this;
        state.set(States.CLEANING);
        try {
            await stash.clearMaterials();
        } catch (e) {
            console.error(`Error while cleaning:`, e);
            state.set(States.WAITING);
            bot.betterWindowClose();
        }
    }
}

module.exports = CleanerUpper;