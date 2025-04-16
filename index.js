const prompt = require('prompt-sync')();
const { updateConfig, getConfig } = require('./config.js');
const MacroBot = require('./bot/Macro.js');
let config = getConfig();

function checkConfig() {

    const checkIgn = () => {
        if (config.igns.length !== 0) return;
        const answer = prompt("Enter your Minecraft IGN: ")?.trim();
        if (!answer || answer.length === 0) {
            console.log(`Please enter a valid IGN`);
            return checkIgn();
        }

        updateConfig({ igns: answer })
        config = getConfig();
    }

    checkIgn();
}

async function initBot() {

}

checkConfig();