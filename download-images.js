const fs = require('fs');
const https = require('node:https');

const path = require('path');


const root = "https://cdn.playbattleaces.com/images/icons"
const images = [
    "techtiers/core.svg",
    "units/crab.png",
    "units/hunter.png",
    "units/recall.png",
    "units/recallhunter.png",
    "units/scorpion.png",
    "units/beetle.png",
    "units/blink.png",
    "units/blinkhunter.png",
    "units/gunbot.png",
    "units/missilebot.png",
    "units/wasp.png",
    "units/hornet.png",
    "techtiers/foundry.svg",
    "units/ballista.png",
    "units/kingcrab.png",
    "units/crusader.png",
    "units/bomber.png",
    "units/shocker.png",
    "units/recallshocker.png",
    "units/mortar.png",
    "units/swiftshocker.png",
    "units/destroyer.png",
    "techtiers/starforge.svg",
    "units/butterfly.png",
    "units/dragonfly.png",
    "units/falcon.png",
    "units/airship.png",
    "units/advancedrecall.png",
    "units/stinger.png",
    "units/heavyturret.png",
    "techtiers/advancedfoundry.svg",
    "units/heavyballista.png",
    "units/predator.png",
    "techtiers/advancedstarforge.svg",
    "units/bulwark.png",
    "units/katbus.png",
    "units/locust.png",
    "units/valkyrie.png",
    "stats/damage.png", 
    "stats/health.png", 
    "stats/range.png", 
    "stats/speed.png"
].map((path) => `${root}/${path}`);

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
