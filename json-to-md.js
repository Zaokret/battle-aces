const json2md = require("json2md")
const fs = require('fs');

const units = JSON.parse(fs.readFileSync('data/units.json', 'utf8'));

const headers = [
     "Icon",
     "Name",
     "Description",
     "Tech Tier",
     "Damage",
     "Health",
     "Range",
     "Speed",
     "Ability",
     "Bandwidth",
     "Matter",
     "Energy",
]

const createImageLink = (unitName) => {
    return `<img src="./images/units/${unitName}-black.png" style="padding:50px !important;" height="100">`;
}

const dictionaries = units.map(unit => {
    const dictionary = {
        "Icon": createImageLink(unit.slug),
        "Name": unit.name, 
        "Description": unit.unitTag, 
        "Tech Tier": unit.techTier, 
        "Damage": unit.statDamage, 
        "Health": unit.statHealth, 
        "Range": unit.statRange, 
        "Speed": unit.statSpeed, 
        "Ability": unit.unitAbility || '/', 
        "Bandwidth": unit.costBandwidth, 
        "Matter": unit.costMatter, 
        "Energy": unit.costEnergy, 
    };

    return dictionary
})

const md = json2md({
    h1: 'Battle Aces',
    p: ['run `npm install` to install project dependencies', 
        'run `npm run scrape` to download the latest unit information and assets from `https://www.playbattleaces.com`'],
    table: {headers: headers, rows: dictionaries}, 
})

// if (!fs.existsSync('./docs')) {
//     fs.mkdirSync('./docs');
// }

fs.writeFileSync('README.md', md);
