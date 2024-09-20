import fs from 'fs';

const CONFIG_PATH = 'config.json';

export function loadConfig() {
    if (fs.existsSync(CONFIG_PATH)) {
        return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    }
    return {
        interval: 60,
        apiKey: undefined,
        schedule: '* * * * *',
        factType: 'general',
        cacheAmount: 10,
        rateOfFetching: 10
    };
}
