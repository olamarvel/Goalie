const cron = require('node-cron');
const { notifier } = require('./notifier');
const { shutdown } = require('./utils');
const { loadConfig } = require('./config');
const { secondsToCron } = require('./utils');

let job;
let config = loadConfig();

function pauseCronJob() {
    if (job) {
        job.stop();
        console.log('Cron job stopped');
        notifier('Got it! Notifications paused. To resume, please visit http://localhost:50805/', true);
    }
}

function restartCronJob(main) {
    if (job) {
        job.start();
        console.log('Cron job restarted');
        notifier('Got it! Notifications resumed. To pause or stop, please visit http://localhost:50805/', true);
    } else {
        startCronJob(secondsToCron(config.interval), main);
    }
}

function shutdownServer(server) {
    console.log('Shutting down server');
    pauseCronJob();
    notifier('Got it! The application will be terminated. To continue passive learning, please relaunch the application.', true);
    setTimeout(() => {
        shutdown(server);
    }, 5000);
}

function startCronJob(schedule, main) {
    job = cron.schedule(schedule, () => {
        console.log('Running the task based on the interval');
        main();
    });
    job.start();
}

module.exports = { pauseCronJob, restartCronJob, startCronJob, shutdownServer };
