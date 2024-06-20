var express = require('express');
var app = express();
var cors = require('cors');
var fetch = require('node-fetch');
var fs = require('fs');
var path = require('path')

var buildId = '';
var filePath = path.join(__dirname, 'data.json');
var corsOptions = {
    origin: 'https://zaokret.github.io',
    optionsSuccessStatus: 200 
  }

app.use(cors(corsOptions))

app.get('/data', function (req, res) {
    fetchData().then(data => {
        res.json(data);
    })
});
var port = 3000;
app.listen(port, function () {
    console.log(`Battle Aces Proxy Server listening on port ${port}.`);
});

function fetchData() {
    return fetch(`https://www.playbattleaces.com/units`)
        .then((res) => res.text())
        .then(extractBuildId)
        .then((id) => {
            if(buildId !== id) {
                buildId = id;
                return fetch(urlBuilder(id))
                .then(res => res.json())
                .then(body => {
                    const model = {
                        tiers: parseTechTiers(body),
                        units: parseAndSortUnits(body),
                    }
                    fs.writeFile(filePath, JSON.stringify(model), (err) => console.error(err))
                    return model;
                })
            }
            else {
                const str = fs.readFileSync(filePath);
                return JSON.parse(str)
            }
        })
}

function urlBuilder(buildId) {
    return `https://www.playbattleaces.com/_next/data/${buildId}/en-US/units.json`;
}

function extractBuildId(text) {
    const regex = /"buildId":\s*"(.*?)"/;
    const match = text.match(regex);
    return match ? match[1] : null;
}

function parseAndSortUnits(body) {
    const getTechTierNameById = (id) => {
        const tier = body.pageProps.data.allTechTiers.find(
            (tier) => tier.techTierId === id
        );
        return tier.name;
    };

    return body.pageProps.data.allUnits
        .map((unit) => ({
            id: unit.id,
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
        .sort((a, b) => a.techTierId - b.techTierId);
}

function parseTechTiers(body) {
    return body.pageProps.data.allTechTiers.map((tier) => ({
        name: tier.name,
        slug: tier.slug,
        techTierId: tier.techTierId,
    }));
}
