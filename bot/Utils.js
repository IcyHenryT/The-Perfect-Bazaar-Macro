const axios = require('axios');

const sleep = (ms => new Promise(resolve => setTimeout(resolve, ms)));

async function multipleAttempts(func, attempts = 3) {
    let lastError = null;
    
    for (let i = 0; i < attempts; i++) {
        try {
            return await func();
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError;
}

async function getUUID(ign) {
    return (await axios.get(`https://api.mojang.com/users/profiles/minecraft/${ign}`)).data.id;
}

async function betterOnce(listener, event, callback, timeframe = 5000) {
    return new Promise((resolve, reject) => {

        const listen = (...args) => {
            if (callback) {
                if (!callback(...args)) return;
            }
            listener.off(event, listen);
            resolve(...args);
        };

        setTimeout(() => {
            listener.off(event, listen);
            reject(`Didn't find in time! ${event}`);
        }, timeframe);

        listener.on(event, listen);
    });
}

function simplifyNbt(data) {//I stole this straight from prismarine-nbt I can't lie but like I didn't want another dependency cause like exe gets really big so I just did this
    if (!data) return data;
    
    const transform = (value, type) => {
        if (type === 'compound') {
            return Object.keys(value).reduce((acc, key) => {
                acc[key] = simplifyNbt(value[key])
                return acc
            }, {})
        }
        if (type === 'list') {
            return value.value.map(function (v) { return transform(v, value.type) })
        }
        return value
    }
    return transform(data.value, data.type)
}

module.exports = { multipleAttempts, getUUID, sleep, betterOnce, simplifyNbt };