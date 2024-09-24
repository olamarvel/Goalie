const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { isDifferenceMoreThanAWeek } = require('./utils');

const FILE_PATH = path.resolve(process.pkg?process.cwd():__dirname, '../facts.json');

async function getFact(API_KEY) {

    try {
        const response = await fetch('https://api.api-ninjas.com/v1/facts', {
            headers: { 'X-Api-Key': API_KEY },
        });

        const data = await response.json();
        if (!response.ok) {
            console.log('Bad request:', data.error);
            return null;
        }

        if (!data[0]?.fact) {
            return null;
        }

        return data[0].fact;
    } catch (error) {
        console.error('Error fetching fact:', error.message);
        return null;
    }
}

function saveFact(fact, cacheAmount) {
    if (fact === null) return;
    if (!fs.existsSync(FILE_PATH)) {
        fs.writeFileSync(FILE_PATH, JSON.stringify([]));
    }
    let facts = JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));

    // Filter out old facts
    facts = facts.filter(
        storedFact => !isDifferenceMoreThanAWeek(storedFact.date, new Date())
    ).filter(storedFact => storedFact.fact);

    // Ensure the number of facts does not exceed cacheAmount
    if (facts.length >= cacheAmount) {
        facts.splice(0, facts.length - cacheAmount + 1); // Adjusting splice logic
    }

    // Add the new fact
    facts.push({ fact, date: new Date() });

    // Write updated facts to the file
    fs.writeFileSync(FILE_PATH, JSON.stringify(facts, null, 2));
}

/**
 * Get a random fact from the saved facts in the JSON file.
 * @returns {string|null} - A random fact or null if no facts are available.
 */
function getRandomSavedFact() {
    try {
        if (!fs.existsSync(FILE_PATH)) {
            console.error('Facts file does not exist.');
            return null;
        }

        const facts = JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));
        if (facts.length === 0) {
            console.error('No facts available.');
            return 'Do you know that if you set a higher fetch chance on the dashboard, you get more fresh facts but also burn through your API key quickly?';
        }

        const randomIndex = Math.floor(Math.random() * facts.length);
        return facts[randomIndex].fact;
    } catch (error) {
        console.error('Error reading facts:', error.message);
        return null;
    }
}

module.exports = { getFact, getRandomSavedFact, saveFact };
