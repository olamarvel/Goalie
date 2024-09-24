const fs = require('fs');
const path = require('path');

// const logFile = path.join(path.dirname(process.execPath), 'log.txt');
const LOG_PATH = path.join(process.pkg?process.cwd():__dirname, 'log.txt');
const logStream = fs.createWriteStream(LOG_PATH, { flags: 'a' });

logStream.write(`Starting application at ${new Date().toISOString()}\n`);

process.on('uncaughtException', err => {
    console.error(err);
    if (logStream.writable) {
        logStream.write(`Uncaught Exception: ${err.stack}\n`);
    }
});

process.on('exit', code => {
    if (logStream.writable) {
        logStream.write(`Process exited with code: ${code}\n`);
        logStream.end(); // Ensure the stream is properly closed
    }
});

logStream.write(`Application is running at ${new Date().toISOString()}\n`);

// Ensure the stream is properly closed on process exit
process.on('beforeExit', () => {
    if (logStream.writable) {
        logStream.end();
    }
});
