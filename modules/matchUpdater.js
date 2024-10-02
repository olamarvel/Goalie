const Fotmob = require('fotmob').default;
const fotmob = new Fotmob();
const db = require('./db');
const { notifier } = require('./notifier');
const { Sleep } = require('./utils');

const checkForMatchUpdates = async () => {
    try {
        const subscribedMatches = db.get('subscribedMatches').value();

        const matchesEvent = await Promise.all(
            Object.values(subscribedMatches).map(
                async (match) => {
                    const { timestamp, data: { matchId, team } } = match
                    const matchIdasString = matchId.toString();
                    let events;
                    const cachedMatchEvent = db
                        .get(`matchEvents.${matchIdasString}`)
                        .value() || {
                        events: [],
                        areThereAnyHighlights: true,
                        isAutoCommentary: true,
                    };

                    // if (
                    //     cachedMatch &&
                    //     cachedMatch.timestamp > Date.now() - 60 * 1000
                    // ) {
                    //     event = cachedMatchEvent;
                    // } else {
                    const matchCommentary = await fotmob.request('ltc', {
                        ltcUrl: `data.fotmob.com/webcl/ltc/gsm/${matchId}_en.json.gz`,
                        teams: JSON.stringify([team[0].name,team[1].name]),
                    });
                    events = matchCommentary.events;
                    // }

                    if (!events) {
                        console.error(
                            `Invalid match details for matchId ${matchIdasString}`
                        );
                        notifier(
                            `Invalid match Commentary for matchId ${matchIdasString}. Skiping`,
                            true
                        );
                        return null; // Skip invalid match details
                    }

                    // const match = matchDetails.general;

                    // Check for new events
                    const newEvents = events.filter(event => {
                        return !cachedMatchEvent.events.some(
                            cachedEvent => cachedEvent.id === event.id
                        );
                    });

                    if (newEvents.length > 0) {
                        notifier(
                            `New events in match ${team[0].name || 'unknown'} vs ${
                                team[1].name || 'unknown'
                            }: Displaying now`,
                            false
                        );
                        await Sleep();

                        for (let i = 0; i < newEvents.length; i++) {
                            const event = newEvents[i];
                            notifier(event.text, false,match);
                            await Sleep();
                        }

                        // Update cache with new events
                        cachedMatchEvent.events.push(...newEvents);
                        cachedMatchEvent.areThereAnyHighlights ||= matchCommentary.areThereAnyHighlights
                        cachedMatchEvent.isAutoCommentary ||= matchCommentary.isAutoCommentary
                        
                        db.set(
                            `matchEvents.${matchIdasString}`,
                            cachedMatchEvent
                        ).write();
                    }

                    return newEvents;
                }
            )
        );
    } catch (error) {
        console.error('Error checking for match updates:', error);
    }
};

module.exports = {
    checkForMatchUpdates,
};
