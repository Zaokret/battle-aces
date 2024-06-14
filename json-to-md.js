const json2md = require("json2md")
const fs = require('fs');

const units = JSON.parse(fs.readFileSync('data/units.json', 'utf8'));

const keyToName = {
    "name": "Name",
    "unitTag": "Description",
    "techTier": "Tech Tier",
    "statDamage": "Damage",
    "statHealth": "Health",
    "statRange": "Range",
    "statSpeed": "Speed",
    "unitAbility": "Ability",
    "costBandwidth": "Bandwidth",
    "costMatter": "Matter",
    "costEnergy": "Energy",
}

const dictionaries = units.map(unit => {
    unit.unitAbility = unit.unitAbility || '/'
    unit.antiAir = unit.antiAir ? 'Yes' : 'No';
    const dictionary = {};
    Object.keys(keyToName).forEach(key => {
        dictionary[keyToName[key]] = unit[key]
    })
    return dictionary;
})

const headers = Object.keys(dictionaries[0])

const md = json2md({
    table: {headers: headers, rows: dictionaries}, 
})

fs.writeFileSync('data/units.md', md);
