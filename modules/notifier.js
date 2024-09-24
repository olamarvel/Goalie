const nodeNotifier = require('node-notifier');
const openurl = require('openurl');
const path = require('path');

async function notifier(message, withoutActions) {
    return new Promise((resolve, reject) => {
        const notifier = process.pkg
            ? new nodeNotifier.WindowsToaster({
                  withFallback: false, // Use Growl Fallback if <= 10.8
                  customPath: path.join(
                      path.dirname(process.execPath),
                      'path-to-executable/notifier/snoretoast-x64.exe'
                  ), // Relative/Absolute path to binary if you want to use your own fork of terminal-notifier
              })
            : nodeNotifier;

        notifier.notify(
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

module.exports = { notifier };
