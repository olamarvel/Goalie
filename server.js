import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { pauseCronJob, restartCronJob, shutdownServer, startCronJob } from './modules/cronManager.js';
import { secondsToCron } from './modules/utils.js';
import { loadConfig } from './modules/config.js';

import { dirname } from 'path';

// Check if running inside pkg bundle
const isPkg = typeof process.pkg !== 'undefined';

// Get __dirname and __filename correctly whether in dev or bundled with pkg
let __filename;
let __dirname;

if (isPkg) {
    __filename = process.execPath;
    __dirname = path.dirname(__filename);
} else {
    __filename = fileURLToPath(import.meta.url);
    __dirname = dirname(__filename);
}

const app = express();
const PORT = 50805;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

let config = loadConfig();

// Load existing config if available
const CONFIG_PATH = 'config.json';
if (fs.existsSync(CONFIG_PATH)) {
    config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/welcome.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'welcome.html'));
});

app.get('/config', (req, res) => {
    res.json(config);
});

app.post('/set-config', (req, res) => {
    const { interval, apiKey, schedule, factType, cacheAmount, rateOfFetching } = req.body;
    config = {
        interval: Math.abs(parseInt(interval, 10)) || 60,
        apiKey: apiKey || config.apiKey,
        schedule: schedule || config.schedule,
        factType: factType || config.factType,
        cacheAmount: parseInt(cacheAmount, 10) || config.cacheAmount,
        rateOfFetching: parseFloat(rateOfFetching) || config.rateOfFetching
    };
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    res.send('Configuration updated successfully.');
    pauseCronJob()
    startCronJob()
});

app.post('/pause', (req, res) => {
    pauseCronJob();
    res.send('Notifications paused.');
});

app.post('/restart', (req, res) => {
    restartCronJob();
    res.send('Notifications restarted.');
});

app.post('/shutdown', (req, res) => {
    shutdownServer(server);
    res.send('Server shutting down...');
});

export const server = app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    startCronJob(secondsToCron(config.interval || 60));
});
