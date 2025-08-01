const mineflayer = require('mineflayer');
const { getUUID, betterOnce, getWindowName } = require('./Utils.js');

async function makeBot(ign) {
    return new Promise(async (resolve) => {
        let bot = mineflayer.createBot({
            username: ign,
            auth: 'microsoft',
            version: '1.8.9',
            host: 'play.hypixel.net',
        });

        bot.betterClick = function (slot, mode1 = 0, mode2 = 0) {
            if (!bot.currentWindow) {
                console.log(`No window found for clicking ${slot}`);
                return;
            }

            bot.currentWindow.requiresConfirmation = false;
            bot.clickWindow(slot, mode1, mode2);
        };

        bot.betterWindowClose = function () {

            if (!bot.currentWindow) {
                console.log(`No window found for closing`);
                return;
            }

            console.log(`Closing window`);

            try { bot.closeWindow(bot.currentWindow) } catch { };

        };

        bot.newWindow = async function (name = '') {
            await betterOnce(bot, 'windowOpen');
            const windowName = getWindowName(bot.currentWindow);
            if (!windowName.includes(name)) throw new Error(`While waiting for ${name} we got ${windowName}`);
            return windowName;
        }

        bot.editSign = function (lines) {
            if (typeof lines === 'string') lines = [lines, "  ^^Flipping^^  ", " Previous Price: ", "60.3/u"];

            bot._client.write('update_sign', {
                location: bot.entity.position.offset(-1, 0, 0),
                text1: `{"italic":false,"extra":[${lines[0]}],"text":""}`,
                text2: `{"italic":false,"extra":[${lines[1]}],"text":""}`,
                text3: `{"italic":false,"extra":[${lines[2]}],"text":""}`,
                text4: `{"italic":false,"extra":[${lines[3]}],"text":""}`
            });
        };

        bot.recentPurse = null;

        bot.getPurse = function (useRecent = false) {
            const scoreboard = bot?.scoreboard?.sidebar?.items ?? [];
            let purse = null;

            for (const item of scoreboard) {
                const line = item?.displayName?.getText(null)?.replace(item?.name, '') ?? '';
                if (line.includes('Purse:') || line.includes('Piggy:')) {
                    let purseText = line.split(':')[1]?.split('(')[0]?.trim() ?? '';
                    purse = parseInt(purseText.replace(/\D/g, ''), 10);
                    break;
                }
            }

            console.log(`Recent purse: ${bot.recentPurse}, Current found: ${purse}, useRecent: ${useRecent}`);

            if (useRecent && bot.recentPurse != null) {
                const lowerBound = bot.recentPurse * 0.99;
                const upperBound = bot.recentPurse * 1.01;
                if (purse < lowerBound || purse > upperBound) {
                    return bot.recentPurse;
                }
            }

            bot.recentPurse = purse;
            return purse;
        };

        bot.ensureOrdersOpen = async function () {
            let attempts = 0;
            while (!getWindowName(bot.currentWindow)?.includes("Bazaar Orders") && attempts < 3) {
                if (bot.currentWindow) {
                    bot.betterWindowClose();
                    await bot.waitForTicks(3);
                }
                bot.chat('/managebazaarorders');
                try { await bot.newWindow("Bazaar Orders") } catch {};
                attempts++
            }

            if (!getWindowName(bot.currentWindow)?.includes("Bazaar Orders")) {
                throw new Error(`Failed to open bazaar orders after 3 tries`);
            }
            return true;
        }

        bot.once("login", async () => {
            if (!bot.uuid) bot.uuid = await getUUID(ign);
            bot.head = `https://mc-heads.net/head/${bot.uuid}.png`;
            console.log(`${ign} logged in!`);
            resolve(bot);
        });
    })

}

module.exports = makeBot;