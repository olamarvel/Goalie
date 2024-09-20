import { fileURLToPath } from 'url';
import { loadConfig } from './modules/config.js';
import { notifier } from './modules/notifier.js';
import {
    getFact,
    getRandomSavedFact,
    saveFact,
} from './modules/factFetcher.js';
import {
    startCronJob,
    pauseCronJob,
    shutdownServer,
} from './modules/cronManager.js';
import open from 'open';
import { server } from './server.js';
import nodeNotifier from 'node-notifier';
import { secondsToCron } from './modules/utils.js';

const config = loadConfig();

const {
    apiKey: API_KEY,
    cacheAmount,
} = config;

if (!API_KEY) {
    notifier('No API key detected, kindly configure', true);
    open('http://localhost:50805');
}

nodeNotifier.on('pause', pauseCronJob);
nodeNotifier.on('shutdown', () => {
    shutdownServer(server);
});
nodeNotifier.on('configure', configureSetting);

async function configureSetting() {
    notifier(
        'Got it! You would like to configure the application. Redirecting you in 3 seconds...',
        true
    );
    setTimeout(async () => {
        await open('http://localhost:50805');
        console.log('Successfully opened');
    }, 3000);
}

export async function main() {
    let fact;
    if (Math.random() <= (config.rateOfFetching || 0.5)) {
        fact = await getFact(API_KEY);
        saveFact(fact, cacheAmount);
    } else fact = getRandomSavedFact();
    if (!fact) {
        notifier('Unable to fetch a new Fact, try checking your internet connection or checking your api key',true);
        return;
    }

    const { response } = await notifier(fact, false);
    console.log(response, 'first');
}