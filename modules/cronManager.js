import cron from 'node-cron';
import { main } from '../index.js'; 
import { notifier } from './notifier.js';
import { secondsToCron, shutdown } from './utils.js';
import { loadConfig } from './config.js';

let job;
let config = loadConfig();

export function pauseCronJob() {
    if (job) {
        job.stop();
        console.log('Cron job stopped');
        notifier(
            'Got it! Notifications paused. To resume, please visit http://localhost:50805/',
            true
        );
    }
}

export function restartCronJob() {
    if (job) {
        job.start();
        console.log('Cron job restarted');
        notifier(
            'Got it! Notifications resumed. To pause or stop, please visit http://localhost:50805/',
            true
        );
    } else {
        startCronJob(secondsToCron(config.interval));
    }
}

export function shutdownServer(server) {
    console.log('Shutting down server');
    pauseCronJob();
    notifier(
        'Got it! The application will be terminated. To continue passive learning, please relaunch the application.',
        true
    );
    setTimeout(() => {
        shutdown(server);
    }, 5000);
}

export function startCronJob(schedule) {
    job = cron.schedule(schedule, () => {
        console.log('Running the task based on the interval');
        main();
    });
    job.start();
}
