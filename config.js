const fs = require("fs");
const path = require("path");

const CONFIG_PATH = path.join(__dirname, "config.json");

const defaultConfig = {
    igns: [],
    webhooks: []
    //TODO this shit lmao
}

if (!fs.existsSync(CONFIG_PATH))
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(defaultConfig, null, 2), "utf-8");

let fileConfig = {};
try {
    fileConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
} catch (e) {
    console.warn("Failed to read config.json, using default", e);
}
let config = { ...defaultConfig, ...fileConfig };

function updateConfig(newConfig) {
    if (typeof newConfig === "string") newConfig = JSON.parse(newConfig);

    config = { ...newConfig, ...config };
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
}

function getConfig() {
    return config;
}

module.exports = { getConfig, updateConfig };