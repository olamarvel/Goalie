import axios from 'axios';
import fs from 'fs';
import { isDifferenceMoreThanAWeek } from './utils.js';

const FILE_PATH = 'facts.json';

export async function getFact(API_KEY) {
    try {
        const response = await axios.get('https://api.api-ninjas.com/v1/facts', {
            headers: { 'X-Api-Key': API_KEY },
        });
        if (response.status !== 200 || !response.data[0]?.fact) {
            console.log('Bad request:', response.status);
            return null;
        }
        return response.data[0].fact;
    } catch (error) {
        console.error('Error fetching fact:', error.message);
        return null;
    }
}

export function saveFact(fact, cacheAmount) {
    if (!fs.existsSync(FILE_PATH)) {
        fs.writeFileSync(FILE_PATH, JSON.stringify([]));
    }
    let facts = JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));

    // Filter out old facts
    facts = facts.filter(storedFact => !isDifferenceMoreThanAWeek(storedFact.date, new Date()));

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
export function getRandomSavedFact() {
    try {
        if (!fs.existsSync(FILE_PATH)) {
            console.error('Facts file does not exist.');
            return null;
        }
        
        const facts = JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));
        if (facts.length === 0) {
            console.error('No facts available.');
            return null;
        }
        
        const randomIndex = Math.floor(Math.random() * facts.length);
        return facts[randomIndex].fact;
    } catch (error) {
        console.error('Error reading facts:', error.message);
        return null;
    }
}