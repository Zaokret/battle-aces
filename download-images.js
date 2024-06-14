const fs = require('fs');
const https = require('node:https');

const path = require('path');


const root = "https://cdn.playbattleaces.com/images/icons"

const units = JSON.parse(fs.readFileSync('data/units.json', 'utf8'));

const images = [
    "techtiers/core.svg",
    "techtiers/foundry.svg",
    "techtiers/starforge.svg",
    "techtiers/advancedfoundry.svg",
    "techtiers/advancedstarforge.svg",
    "stats/damage.png", 
    "stats/health.png", 
    "stats/range.png", 
    "stats/speed.png"
].concat(units.map(unit => `units/${unit.slug}.png`))
.map((path) => `${root}/${path}`);

images.forEach((imageUrl) => {
    const parsedUrl = new URL(imageUrl);
    const fileName = path.basename(parsedUrl.pathname);

    https.get(parsedUrl, res => {
        if (res.statusCode !== 200) {
            console.log(`Failed to get '${imageUrl}' (${res.statusCode})`);
            res.resume();
            return;
        }

        res.setEncoding('binary');

        const fileStream = fs.createWriteStream(fileName, {encoding: 'binary'});
        res.pipe(fileStream);

        fileStream.on('finish', () => {
            fileStream.close();
        });

        fileStream.on('error', (err) => {
            fs.unlink(fileName, () => {});
            console.log(`Error writing to file: ${err.message}`);
        });
    }).on('error', (err) => {console.log(err)});
})
