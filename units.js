const https = require('node:https');
const fs = require('fs');

const url = `https://www.playbattleaces.com/_next/data/vuFZqVvMXztY8K-0tzQtZ/en-US/units.json`;

const req = https.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    let json = JSON.parse(data);
    const units = parseUnits(json);
    const sortedUnits = units.sort((a,b)=> a.techTierId-b.techTierId);
    writeToFile(sortedUnits);
  });
});

req.end();

const writeToFile = (data) => {
    fs.writeFile('data/units.json', JSON.stringify(data), 'utf8', (err) => {
        if (err) throw err;
            console.log('The file has been saved!');
    });
}

const parseUnits = (body) => {
    return body.pageProps.data.allUnits.map(unit => ({
      costBandwidth: unit.costBandwidth,
      costMatter: unit.costMatter,
      costEnergy: unit.costEnergy,
      name: unit.name,
      statDamage: unit.statDamage,
      statHealth: unit.statHealth,
      statRange: unit.statRange,
      statSpeed: unit.statSpeed,
      techTier: getTechTierNameById(unit.techTier.techTierId),
      techTierId: unit.techTier.techTierId,
      unitAbility: unit.unitAbility && unit.unitAbility.name,
      unitTag: unit.unitTag,
      slug: unit.slug,
    }))
}

const getTechTierNameById = (id) => {
    const tiers = ['Core', 'Foundry', 'Starforge', 'Advanced Foundry', 'Advanced Starforge']
    return tiers[id];
}

