export function isDifferenceMoreThanAWeek(date1, date2) {
    const time1 = new Date(date1).getTime();
    const time2 = new Date(date2).getTime();
    const differenceInMilliseconds = Math.abs(time1 - time2);
    const differenceInWeeks = differenceInMilliseconds / (1000 * 60 * 60 * 24 * 7);
    return differenceInWeeks > 1;
}

export function secondsToCron(seconds) {
    if (isNaN(seconds) || seconds < 1) {
        throw new Error('Seconds must be a positive number.');
    }

    if (seconds <= 59) {
        return `*/${seconds} * * * * *`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (remainingSeconds === 0) {
        return `0 */${minutes} * * * *`;
    } else {
        return `${remainingSeconds} */${minutes} * * * *`;
    }
}

export function shutdown(server) {
    console.log('Shutting down server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });

    // Force close server after 5 seconds
    setTimeout(() => {
        console.error('Forcing server shutdown...');
        process.exit(1);
    }, 5000);
}