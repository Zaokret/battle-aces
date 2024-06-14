const Jimp = require("jimp");
const fs = require('fs');

const whiteImagePath = (name) => `images/units/${name}.png`;
const blackImagePath = (name) => `images/units/${name}-black.png`;

const units = JSON.parse(fs.readFileSync('data/units.json', 'utf8'));

const slugs = units.map(unit => unit.slug)

slugs.forEach(slug => {
    Jimp.read( whiteImagePath(slug), (err, img) => {
        if (err) throw err;
        img
          .color([
              { apply: "darken", params: [100] }])
          .write(blackImagePath(slug)); 
      });
})

