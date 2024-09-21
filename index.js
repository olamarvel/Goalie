const { loadConfig } = require('./modules/config');
const { notifier } = require('./modules/notifier');
const { getFact, getRandomSavedFact, saveFact } = require('./modules/factFetcher');
const openurl = require('openurl');
const { startCronJob, stopCronJob, shutdownServer, setNewInterval } = require('./modules/cronManager');
const { secondsToCron } = require('./modules/utils');
const { server } = require('./server');

const fs = require("fs");
const path = require('path');

const logFile = path.join(__dirname, 'log.txt');
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

logStream.write(`Starting application at ${new Date().toISOString()}\n`);

process.on('uncaughtException', (err) => {
    logStream.write(`Uncaught Exception: ${err.stack}\n`);
});

process.on('exit', (code) => {
    logStream.write(`Process exited with code: ${code}\n`);
});

const config = loadConfig();

const { apiKey: API_KEY, cacheAmount } = config;

if (!API_KEY) {
    notifier('No API key detected, kindly configure', true);
    openurl.open('http://localhost:50805');
}

async function main() {
    let fact;
    if (Math.random() <= (config.rateOfFetching || 0.5)) {
        fact = await getFact(API_KEY);
        saveFact(fact, cacheAmount);
    } else {
        fact = getRandomSavedFact();
    }
    if (!fact) {
        notifier('Unable to fetch a new Fact, try checking your internet connection or checking your api key', true);
        return;
    }

    const { response } = await notifier(fact, false);
    console.log(response, 'first');
}

logStream.write(`Application is running at ${new Date().toISOString()}\n`);
startCronJob(secondsToCron(config.interval || 60), main);

module.exports = { main };
