const States = require('./States/States.js');
const { getConfig } = require("../config.js");
const { sleep, betterOnce } = require('./Utils.js');

let { visitFriend } = getConfig();

class AutoIsland {
    constructor(bot, state) {
        this.bot = bot;
        this.state = state;
        this.currentlyConfirming = true;
        this.onIsland = false;
        this.baseMessage = "Private Island";
        this.whenReadyCallback = null;

        this.checkLocraw = this.checkLocraw.bind(this);
        this.bot.on('spawn', this.checkLocraw);
        this.checkLocraw(true);
    }

    async checkLocraw(confirm = false) {
        if (this.currentlyConfirming && !confirm) return;
        if (this.state.get() !== States.MOVING) this.state.set(States.MOVING);

        await sleep(10_000);
        this.currentlyConfirming = false;
        this.bot.chat('/locraw');

        let foundLocraw = false;

        const check = async (message, type) => {
            if (type !== 'chat') return;

            try {
                try { var locraw = JSON.parse(message) } catch { return }
                foundLocraw = true;
                this.bot.off('message', check);
                if (locraw.server === 'limbo') {
                    this.move('/l');
                } else if (locraw.lobbyname) {
                    this.move('/skyblock');
                } else if (locraw.map !== this.baseMessage) {
                    this.move('/is');
                } else if (visitFriend) {
                    let scoreboard = this.bot?.scoreboard?.sidebar?.items?.map(item => item?.displayName?.getText(null)?.replace(item?.name, ''));
                    let guests = scoreboard.find(line => line?.includes('✌'));
                    let ownIsland = scoreboard.find(line => line?.includes('Your Island'));
                    if (!guests || ownIsland) {
                        this.bot.chat(`/visit ${visitFriend}`);
                        await betterOnce(this.bot, 'windowOpen');
                        await sleep(150);
                        this.bot.betterClick(11, 0, 0);

                        try {
                            console.log(`Started betterOnce`);
                            await betterOnce(this.bot, 'message', (message, type) => {
                                if (type !== 'chat') return;
                                const text = message.getText(null);
                                if (text == `This island doesn't allow everyone to guest!`) {
                                    visitFriend = false;
                                    console.log(`§6[§bTPM§6] §cHey so this person has invites off :(`);
                                    this.checkLocraw();
                                    this.move('/hub');//ok we gotta go to hub so that it realizes something changed
                                    return true;
                                }
                            }, 5_000);
                        } catch (e) {
                            console.log(e);
                        }
                    } else {
                        this.onIsland = true;
                        this.state.set(States.WAITING);
                        if (this.whenReadyCallback) {
                            this.whenReadyCallback();
                            this.whenReadyCallback = null;
                        }
                    }
                } else if (this.state.get() === States.MOVING) {
                    this.onIsland = true;
                    this.state.set(States.WAITING);
                    if (this.whenReadyCallback) {
                        this.whenReadyCallback();
                        this.whenReadyCallback = null;
                    }
                }
            } catch (e) {
                console.error(e);
                this.checkLocraw(confirm);
            };
        }

        this.bot.on('message', check);

        setTimeout(() => {
            if (!foundLocraw) {
                this.checkLocraw(confirm);
                this.bot.off('message', check);
            }
        }, 5000)
    }

    async move(place) {
        this.onIsland = false;
        await sleep(3000);
        this.bot.chat(place);
        this.state.set('moving');
        this.currentlyConfirming = true;
        this.checkLocraw(true);//confirm we made it
    }

    onIslandCheck() {
        return this.onIsland;
    }

    whenReady(callback) {
        this.whenReadyCallback = callback;
    }

}
module.exports = AutoIsland;