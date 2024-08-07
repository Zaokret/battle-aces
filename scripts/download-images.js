const fs = require('fs');
const https = require('node:https');

const path = require('path');


const root = "https://cdn.playbattleaces.com/images/icons"

const units = JSON.parse(fs.readFileSync('./data/units.json', 'utf8'));

const images = [
    "techtiers/core.svg",
    "techtiers/foundry.svg",
    "techtiers/starforge.svg",
    "techtiers/advancedfoundry.svg",
    "techtiers/advancedstarforge.svg",
    "stats/damage.png", 
    "stats/health.png", 
    "stats/range.png", 
    "stats/speed.png",
    "abilities/blink.png",
    "abilities/overclock.png",
    "abilities/recall.png",
    "abilities/setup.png"
].concat(units.map(unit => `units/${unit.slug}.png`))
.map((path) => `${root}/${path}`);

const icons = JSON.parse(fs.readFileSync('./data/icons.json'))

function downloadImage({folderName, fileName, imageUrl, parsedUrl}) {
    const directoryPath = `./images/${folderName}`
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
    }

    const filePath = path.join(directoryPath, fileName);

    https.get(parsedUrl, res => {
        if (res.statusCode !== 200) {
            console.log(`Failed to get '${imageUrl}' (${res.statusCode})`);
            res.resume();
            return;
        }

        res.setEncoding('binary');

        const fileStream = fs.createWriteStream(filePath, {encoding: 'binary'});
        res.pipe(fileStream);

        fileStream.on('finish', () => {
            fileStream.close();
            
        });

        fileStream.on('error', (err) => {
            fs.unlink(filePath, () => {});
            console.log(`Error writing to file: ${err.message}`);
        });
    }).on('error', (err) => {console.log(err)});
}

Object.keys(icons).forEach(name => {
    const slug = name.toLowerCase()
    downloadImage({
        folderName: 'icons', 
        fileName: slug + '.png', 
        imageUrl: icons[name], 
        parsedUrl: new URL(icons[name])
    })
})

images.forEach((imageUrl) => {
    const parsedUrl = new URL(imageUrl);
    const parts = parsedUrl.pathname.split('/');
    const folderName = parts[parts.length - 2]; 
    const fileName = parts[parts.length - 1]; 

    downloadImage({imageUrl, folderName, fileName, parsedUrl})
})
