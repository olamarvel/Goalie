const fs = require('fs');   
const path = require('path');

const CONFIG_PATH = path.resolve(process.pkg?process.cwd():__dirname, process.pkg?'config.json':'../config.json');
// console.log(CONFIG_PATH)
const loadConfig = () => {
    if (fs.existsSync(CONFIG_PATH)) {
        return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    }
    return {
        interval: 60,
        apiKey: undefined,
        schedule: '* * * * *',
        factType: 'general',
        cacheAmount: 10,
        rateOfFetching: 0.6
    };
};

module.exports = { loadConfig };
