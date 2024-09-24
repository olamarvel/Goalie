const fs = require('fs');
const path = require('path');
const { notifier } = require('./modules/notifier');
const nodeNotifier = require('node-notifier');

const CONFIG_PATH = path.join(process.pkg?process.cwd():__dirname, 'config.json');


const {
    getFact,
    getRandomSavedFact,
    saveFact,
} = require('./modules/factFetcher');
const openurl = require('openurl');

const express = require('express');
const bodyParser = require('body-parser');
const { loadConfig } = require('./modules/config');
const {
    startCronJob,
    shutdownServer,
    restartCronJob,
    pauseCronJob,
} = require('./modules/cronManager');
const { secondsToCron, shutdown } = require('./modules/utils');

const app = express();
const PORT = 50805;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

let config = loadConfig();

app.get('/', () => {
    path.join(__dirname, 'public', 'index.html');
});

app.get('/welcome.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'welcome.html'));
});

app.get('/config', (req, res) => {
    res.json(config);
});

app.post('/set-config', (req, res) => {
    const {
        interval,
        apiKey,
        schedule,
        factType,
        cacheAmount,
        rateOfFetching,
    } = req.body;
    config = {
        interval: Math.abs(parseInt(interval, 10)) || 60,
        apiKey: apiKey || config.apiKey,
        schedule: schedule || config.schedule,
        factType: factType || config.factType,
        cacheAmount: parseInt(cacheAmount, 10) || config.cacheAmount,
        rateOfFetching: parseFloat(rateOfFetching) || config.rateOfFetching,
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
    if (config.apiKey) startCronJob(secondsToCron(config.interval || 60), main);
});
if (!config.apiKey) {
    notifier('No API key detected, kindly configure', true);
    openurl.open('http://localhost:50805');
}

nodeNotifier.on('pause', pauseCronJob);
nodeNotifier.on('shutdown', () => {
    shutdownServer(server);
});
nodeNotifier.on('configure', configureSetting);

function configureSetting() {
    notifier(
        'Got it! You would like to configure the application. Redirecting you in 3 seconds...',
        true
    );
    setTimeout(async () => {
        openurl.open('http://localhost:50805');
        console.log('Successfully opened');
    }, 3000);
}

async function main() {
    let fact;
    if (Math.random() <= (config.rateOfFetching || 0.5)) {
        fact = await getFact(config.apiKey);
        saveFact(fact, config.cacheAmount);
    } else {
        fact = getRandomSavedFact();
    }
    if (!fact) {
        notifier(
            'Unable to fetch a new Fact, try checking your internet connection or checking your api key',
            true
        );
        return;
    }

    const { response } = await notifier(fact, false);
    console.log(response, 'first');
}
// startCronJob(secondsToCron(config.interval || 60), main);
require('./log.js');
