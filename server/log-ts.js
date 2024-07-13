const cron = require('node-cron');
const mongoose = require('mongoose');
const fetch = require('node-fetch');

const deckModes = {
    '1v1': 0,
    '2v2': 1
}

mongoose.connect('mongodb://127.0.0.1:27017/battle-aces');

const deckSchema = new mongoose.Schema({
    name: String,
    rating: Number,
    deck: String,
    mode: Number,
    timestamp: Number
})
const Deck = mongoose.model('Deck', deckSchema);

function storeResults(obj, mode) {
    let collection = [];
    const miliseconds = new Date(obj.timestamp).getTime()
    for (const row of obj[mode]) {
        if(row[2].every(Boolean)) {
            const hash = row[2].sort((a,b) => a-b).join(',')
            collection.push({
                name: row[0],
                rating: row[1],
                deck: hash,
                mode: deckModes[mode],
                timestamp: miliseconds
            })
        }
    }

    Deck.insertMany(collection).then(() => {
        console.log(`Inserted ${mode} ${obj.timestamp}`)
    })
}
const intervalStr = '30 */2 * * *'
cron.schedule(intervalStr, () => {
    console.log(`Leaderboard job started at ${new Date().toISOString()}`)

    fetch('https://cdn.playbattleaces.com/data/leaderboards/1v1.json')
        .then(res=>res.json())
        .then((obj) => {
            storeResults(obj, '1v1')
        })

    fetch('https://cdn.playbattleaces.com/data/leaderboards/2v2.json')
        .then(res=>res.json())
        .then((obj) => {
            storeResults(obj, '2v2')
        })
});
console.log(`Running leaderboard job at minute 30 past every 2nd hour`)