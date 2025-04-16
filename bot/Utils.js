const axios = require('axios');

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

module.exports = { multipleAttempts, getUUID };