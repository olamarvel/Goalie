const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const nodeNotifier = require('node-notifier');
const openurl = require('openurl');
const fetch = require('node-fetch');
const Fotmob = require('fotmob').default;
const fotmob = new Fotmob();
const db = require('./modules/db');

const {
    startCronJob,
    shutdownServer,
    restartCronJob,
    pauseCronJob,
} = require('./modules/cronManager');
const {
    secondsToCron,
    shutdown,
    formatDateToRegex,
} = require('./modules/utils');
const { notifier } = require('./modules/notifier');

const popularLeagues = [47, 42, 87, 54, 55, 73, 53, 77, 533, 132];

const app = express();
const PORT = 50805;

const defaultSettings = {
    updateRate: 1, // Default update rate in seconds
    pauseSubscription: false, // Default pause subscription setting
    notificationTypes: {
        showImportant: false,
        showLess: true,
        showAll: false,
        selectNotificationType: false,
        customNotificationType: [
            'end14',
            'end2',
            'YC',
            'miss',
            'corner',
            'SI',
            'addedTime',
            'Y2C',
            'G',
            'attemptSaved',
            'start',
            'end1',
            'offside',
            'OG',
            'lineup',
        ],
    },
    redirectToHighlights: false, // Default redirect setting
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
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

app.get('/api/matches', async (req, res) => {
    try {
        const cacheKey = 'matches';
        const cachedMatches = db.get(cacheKey).value();

        if (cachedMatches && cachedMatches.timestamp > Date.now() - 60 * 1000) {
            return res.json(cachedMatches.data);
        }

        const matches = await fotmob.getMatchesByDate(
            formatDateToRegex(new Date())
        );

        const formattedMatches = matches.leagues
            .filter(league => popularLeagues.includes(league.id))
            .flatMap(league =>
                league.matches.map(match => ({
                    ...match,
                    competition: {
                        name: league.name,
                        primaryId: league.primaryId,
                        id: league.id,
                    },
                }))
            )
            .map(match => ({
                matchId: match.id,
                home: match.home,
                away: match.away,
                league: match.competition,
                startTime: match.time,
                status: match.status.finished
                    ? 'finished'
                    : match.status.started
                    ? 'ongoing'
                    : 'not started',
                score: {
                    string: match.status.scoreStr,
                    home: match.home.score,
                    away: match.away.score,
                },
                time: match.timeTS,
            }));

        db.set(cacheKey, {
            timestamp: Date.now(),
            data: formattedMatches,
        }).write();
        res.json(formattedMatches);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching matches');
    }
});

async function addMatchdetails(matchIdasString) {
    const matchDetails = await fotmob.getMatchDetails(matchIdasString);
    const match = matchDetails.general;

    const matchData = {
        matchId: match.matchId,
        home: match.homeTeam,
        away: match.awayTeam,
        league: {
            name: match.leagueName,
            primaryId: match.leagueId,
            id: match.leagueId,
        },
        startTime: match.matchTimeUTCDate,
        status: match.finished
            ? 'finished'
            : match.started
            ? 'ongoing'
            : 'not started',
        team: [match.homeTeam, match.awayTeam],
    };

    db.set(`subscribedMatches.${matchIdasString}`, {
        timestamp: Date.now(),
        data: matchData,
    }).write();

    return matchData;
}

app.get('/subscribedMatches', async (req, res) => {
    try {
        const subscribedMatches = db.get('subscribedMatches').value();
        const matches = await Promise.all(
            Object.values(subscribedMatches).map(
                async ({ timestamp, data }) => {
                    if (timestamp > Date.now() - 10 * 60 * 1000) {
                        return data;
                    }
                    return addMatchdetails(data.matchId);
                }
            )
        );

        res.json(matches);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching subscribed matches');
    }
});

app.post('/subscribeMatch/:matchId', async (req, res) => {
    const matchId = Number(req.params.matchId);
    const match = db.get('matches.data').find({ matchId }).value();
    const alreadySubscribed = db
        .get(`subscribedMatches.${req.params.matchId}`)
        .value();

    if (match && !alreadySubscribed) {
        await addMatchdetails(req.params.matchId);
        res.send('Match subscribed successfully');
    } else if (alreadySubscribed) {
        res.send('You are already subscribed');
    } else {
        res.status(404).send('Match not found');
    }
});

// Unsubscribe Endpoint
app.post('/unsubscribeMatch/:matchId', async (req, res) => {
    const matchId = req.params.matchId;
    const subscribedMatch = db.get(`subscribedMatches.${matchId}`).value();

    if (subscribedMatch) {
        if (db.get('subscribedMatches').unset(matchId).write())
            res.send('Match unsubscribed successfully');
        else
            res.send(
                "dung!!! this shouldn't happen: unable to unsubcribe. contact developer"
            );
    } else {
        res.status(404).send('Match not found in subscriptions');
    }
});

app.post('/settings/:matchId', (req, res) => {
    const matchId = req.params.matchId;
    const settings = req.body;
    db.set(`settings.${matchId}`, settings).write();
    res.send('Settings saved successfully');
});

app.get('/settings/:matchId', (req, res) => {
    const matchId = req.params.matchId;
    const settings = db.get(`settings.${matchId}`).value();

    // Merge default settings with existing settings
    const mergedSettings = { ...defaultSettings, ...settings };

    res.json(mergedSettings);
});

const server = app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    // main();
    startCronJob(secondsToCron(60 * 5))
});

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
    setTimeout(() => {
        openurl.open('http://localhost:50805');
    }, 3000);
}

async function main() {
    try {
        // const cacheKey = 'currentMatches';
        // const cachedMatches = db.get(cacheKey).value();
        // if (cachedMatches && cachedMatches.timestamp > Date.now() - 60 * 1000) {
        //     const matches = cachedMatches.data;
        //     handleGoals(matches);
        //     return;
        // }
        // const matches = await fotmob.getMatchesByDate('20201020');
        // const allMatches = matches.leagues.flatMap(league => league.matches);
        // db.set(cacheKey, { timestamp: Date.now(), data: allMatches }).write();
        // handleGoals(allMatches);
    } catch (error) {
        console.error(error);
        notifier('Error fetching matches or goals', true);
    }
}

function handleGoals(matches) {
    const ongoingGoals = matches.filter(
        match =>
            match.status === 'IN_PROGRESS' &&
            match.events.some(event => event.type === 'goal')
    );

    ongoingGoals.forEach(goal => {
        const match = goal.match;
        const player = goal.events.find(event => event.type === 'goal').player;
        notifier(
            `Goal scored by ${player} in match ${match.home.name} vs ${match.away.name}. Current score: ${match.score}`,
            false
        );
    });
}

console.log('Server is running');
