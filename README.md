# Battle Aces

## Try it out

[Deck Builder](https://zaokret.github.io/battle-aces/) with live data from https://www.playbattleaces.com/

## Features

 - view your in-game decks
 - share a deck with an URL
 - save 4 decks to a browser local storage
 - save deck templates to your machine 
 - view units in 3D 
 - grab an instant screenshot

## Manual Scraping

run `npm install` to install project dependencies

run `npm run scrape` to download the latest unit information and assets

## Game integration

Deck builder supports viewing your in-game selected and saved decks by uploading game configuration file.

Game configuration path on Windows: `C:\Users\<USER_NAME>\AppData\LocalLow\Uncapped Games\Battle Aces\gameconfig-localuser.toml` 

Game syncs game configuration file to a remote server. Overwrites of this file are ignored.


