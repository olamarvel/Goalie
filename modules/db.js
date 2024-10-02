
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low(adapter);

db.defaults({
    config: {},
    matches: [],
    subscribedMatches: {},
    settings: {},
    matchEvents:{}
}).write();

module.exports= db