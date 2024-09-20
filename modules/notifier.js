import nodeNotifier from 'node-notifier';
import path from 'path';
import { fileURLToPath } from 'url';

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

export async function notifier(message, withoutActions) {
    return new Promise((resolve, reject) => {
        nodeNotifier.notify({
            'app-name': 'Fun fact Notifier by Olamarvel',
            title: withoutActions ? 'Info':'Here is a fun fact for you.',
            subtitle: "created by Olamarvel",
            message,
            sound: true,
            icon: path.join(__dirname, '../public/logo.png'),
            timeout: 10,
            closeLabel: "close",
            actions: withoutActions ? undefined : ["pause", "shutdown", "configure"],
            dropdownLabel: "control",
            
        }, (error, response, metadata) => {
            if (error) {
                reject(error);
            } else {
                resolve({ response, metadata });
            }
        });
    });
}
