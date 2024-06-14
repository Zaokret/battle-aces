## RUN

run `npm install` to install project dependencies

run `npm run scrape` to download the latest unit information from `https://www.playbattleaces.com` with the following headers
```
headers = [
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
    "Energy"
]
```
in `.json` and `.md` format located in `./data`
as well as unit, tech tier and stat assets in `./images`

