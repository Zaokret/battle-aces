# Battle Aces

## Live data

[Deck Builder](https://zaokret.github.io/battle-aces/) with live data from https://www.playbattleaces.com/

## Manual Scraping

run `npm install` to install project dependencies

run `npm run scrape` to download the latest unit information and assets

## Game integration

Work in progress.

Game configuration, selected and saved decks are located in 
`C:\Users\<USER_NAME>\AppData\LocalLow\Uncapped Games\Battle Aces\gameconfig-localuser.toml` file that is synched to a remote server. Manual overwrites of this file are ignored, and the following message is written in `Player.log`
> TailoredUXTracking - noticed a steam inventory change, but no unit call to action changes were detected

I've tried disabling steam cloud sync. 


