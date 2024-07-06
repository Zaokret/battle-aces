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

`npm install -g pnpm` install package manager

`pnpm install` install project dependencies

### Proxy Server

`pnpm server:dev` run express.js server

`curl http://localhost:3000/data` test GET endpoint

### Client

`pnpm client:dev` bundle and watch javascript with esbuild

open `index.html` with [http-server](https://www.npmjs.com/package/http-server) or similar tool

### Scraper

`pnpm scrape` to download the latest unit information and assets

`pnpm list` to prettify unit.json

## Game integration

Deck builder supports viewing your in-game selected and saved decks by uploading game configuration file.

#### Game configuration path
##### Windows: 
`C:\Users\<USER_NAME>\AppData\LocalLow\Uncapped Games\Battle Aces\gameconfig-localuser.toml` 
##### Linux
`SteamLibrary/steamapps/compatdata/STEAM_APP_ID/pfx/drive_c/users/steamuser/AppData/LocalLow/Uncapped Games/Battle Aces/gameconfig-localuser.toml`

Game syncs game configuration file to a remote server. Overwrites of this file are ignored.


