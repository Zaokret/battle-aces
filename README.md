# Battle Aces

## Try it out

[Deck Builder](https://zaokret.github.io/battle-aces/) with live data from https://www.playbattleaces.com/

## Features

 - view your in-game decks
 - share a deck with an URL
 - save 4 decks to a browser local storage
 - save deck templates to your machine 
 - view units 3D video 
 - grab an instant screenshot

## Run it yourself

### Client
`npm install` install client dependencies

`npm run client:dev` bundle and watch javascript with esbuild

`npm run server:dev` run express.js server

open `index.html` with [http-server](https://www.npmjs.com/package/http-server) or similar tool

### Proxy Server
`cd server` navigate to server folder

`npm install` install server dependencies 

`echo "" > .env` to create an empty `.env` file

`npm run dev` run for development 

test `http://localhost:3000/data` GET endpoint

### Scraper
`npm install` to install project dependencies

`npm run scrape` to download the latest unit information and assets

`npm run list` to prettify unit.json

## Game integration

Deck builder supports viewing your in-game selected and saved decks by uploading game configuration file.

#### Game configuration path
##### Windows: 
`C:\Users\<USER_NAME>\AppData\LocalLow\Uncapped Games\Battle Aces\gameconfig-localuser.toml` 
##### Linux
`SteamLibrary/steamapps/compatdata/STEAM_APP_ID/pfx/drive_c/users/steamuser/AppData/LocalLow/Uncapped Games/Battle Aces/gameconfig-localuser.toml`

Game syncs game configuration file to a remote server. Overwrites of this file are ignored.


