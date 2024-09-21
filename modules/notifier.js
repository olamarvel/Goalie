const nodeNotifier = require('node-notifier');
const openurl = require('openurl');
const path = require('path');
const { pauseCronJob, shutdownServer } = require('./cronManager');

async function notifier(message, withoutActions) {
    return new Promise((resolve, reject) => {
        nodeNotifier.notify(
            {
                'app-name': 'Fun fact Notifier by Olamarvel',
                title: withoutActions ? 'Info' : 'Here is a fun fact for you.',
                subtitle: 'created by Olamarvel',
                message,
                sound: true,
                icon: path.join(__dirname, '../public/logo.png'),
                timeout: 10,
                closeLabel: 'close',
                actions: withoutActions ? undefined : ['pause', 'shutdown', 'configure'],
                dropdownLabel: 'control',
            },
            (error, response, metadata) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({ response, metadata });
                }
            }
        );
    });
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
        await openurl.open('http://localhost:50805');
        console.log('Successfully opened');
    }, 3000);
}

module.exports = { notifier };
