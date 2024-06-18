const https = require('node:https');
const fs = require('fs');

function getBuildId(callback) {
  const req = https.get(`https://www.playbattleaces.com/units`, (res) => {
    let data = '';
  
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      callback(extractBuildId(data))
    });
  });
  req.end();
}

function extractBuildId(text) {
  const regex = /"buildId":\s*"(.*?)"/;
  const match = text.match(regex);
  return match ? match[1] : null;
}

const urlBuilder = (buildId) => `https://www.playbattleaces.com/_next/data/${buildId}/en-US/units.json`;

function downloadUnits(callback) {
  return function(buildId)  {
  const req = https.get(urlBuilder(buildId), (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      callback(JSON.parse(data))
    });
  });
  req.end();
}
}

const saveUnits = (json) => {
  const sortedUnits = parseAndSortUnits(json);
  writeToFile(sortedUnits);
}

const writeToFile = (data) => {
  if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data');
  }

  fs.writeFile('data/units.json', JSON.stringify(data), 'utf8', (err) => {
      if (err) throw err;
          console.log('The file data/units.json has been created!');
  });
}

const parseAndSortUnits = (body) => {
    const getTechTierNameById = (id) => {
      const tier = body.pageProps.data.allTechTiers.find(
          (tier) => tier.techTierId === id
      );
      return tier.name;
    };
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
      unitTagArray: parseUnitTags(unit.unitTag),
      slug: unit.slug,
      videoTurnaround: `https://cdn.playbattleaces.com/videos/turnarounds/${unit.slug}.mp4`,
      videoGameplay: `https://cdn.playbattleaces.com/videos/gameplay/${unit.slug}.mp4`,
      website: `https://www.playbattleaces.com/units/${unit.slug}`,
      image: `https://cdn.playbattleaces.com/images/icons/units/${unit.slug}.png`
    })).sort((a,b)=> a.techTierId-b.techTierId)
}

function parseUnitTags(tags) {
  return tags
  .replace(' Unit', '')
  .replace(' Damage', '')
  .replace(' Defense', '-Defense')
  .replace('\n', '')
  .split(' ')
}

getBuildId(downloadUnits(saveUnits));

