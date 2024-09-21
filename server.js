const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { loadConfig } = require('./modules/config');
const { startCronJob, shutdownServer, restartCronJob, pauseCronJob } = require('./modules/cronManager');
const { secondsToCron } = require('./modules/utils');
const { main } = require('./index');

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
    pauseCronJob();
    startCronJob(secondsToCron(config.interval), main);
    res.send('Configuration updated successfully.');
});

app.post('/pause', (req, res) => {
    pauseCronJob();
    res.send('Notifications paused.');
});

app.post('/restart', (req, res) => {
    restartCronJob(main);
    res.send('Notifications restarted.');
});

app.post('/shutdown', (req, res) => {
    shutdownServer(server);
    res.send('Server shutting down...');
});

const server = app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    startCronJob(secondsToCron(config.interval || 60), main);
});

module.exports = { server };
