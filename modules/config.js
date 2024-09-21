const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.resolve(__dirname, '../config.json');

const loadConfig = () => {
    if (fs.existsSync(CONFIG_PATH)) {
        return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    }
    return {
        interval: 60,
        apiKey: 'your-api-key',
        schedule: '* * * * *',
        factType: 'general',
        cacheAmount: 10,
        rateOfFetching: 10
    };
};

module.exports = { loadConfig };
