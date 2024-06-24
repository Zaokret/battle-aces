var express = require('express');
var app = express();
var cors = require('cors');
var fetch = require('node-fetch');
var fs = require('fs');
var path = require('path')
require('@dotenvx/dotenvx').config()


function isProd() {
    return process.env.STATUS === 'production';
}

var buildId = '';
var filePath = path.join(__dirname, 'data.json');
var corsOptions = {
    origin: isProd() ? 'https://zaokret.github.io' : '*',
    optionsSuccessStatus: 200 
  }

app.use(cors(corsOptions))

app.get('/data', function (req, res) {
    fetchData().then(data => {
        res.json(data);
    })
});

app.get('/callback', async function (req, res) {
    console.log(req.query)

    const params = new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: req.query.code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI
      });
    
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept-Encoding': 'application/x-www-form-urlencoded'
      };

      const tokenRes = await fetch('https://discord.com/api/oauth2/token', { method: 'POST', body: params, headers: headers });
      const token = await tokenRes.json();

      const userResponse = await fetch('https://discord.com/api/users/@me', {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
          ...headers
        }
      })
      
    const user = await userResponse.json();
    res.json(user);
});

// app.get('/revoke', async (req,res) => {
    
//     const params = new URLSearchParams({
//         client_id: process.env.DISCORD_CLIENT_ID,
//         client_secret: process.env.DISCORD_CLIENT_SECRET,
//         token: access_token, // GET THIS FROM JWT 
//         token_type_hint: 'access_token' || 'refresh_token' // GET THIS FROM JWT 
//       });
    
//       const headers = {
//         'Content-Type': 'application/x-www-form-urlencoded',
//       };

//       const tokenRes = await fetch('https://discord.com/api/oauth2/token/revoke', { method: 'POST', body: params, headers: headers });
//       const token = await tokenRes.json();
// })

// local
// https://discord.com/oauth2/authorize?client_id=1056528749333594194&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback&scope=identify
// prod
// https://discord.com/oauth2/authorize?client_id=1056528749333594194&response_type=code&redirect_uri=https%3A%2F%2Fdeckbuilder.autos%2Fcallback&scope=identify

const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
    console.log(`Battle Aces Proxy Server listening on port ${PORT} in ${process.env.STATUS} mode.`);
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
