const fs = require('fs')
const filePath = './server/.env'

if(!fs.existsSync(filePath)) {
    try {
        fs.writeFileSync(filePath, "")
        console.log('created .env file in ' + filePath)
    } catch (error) {
        console.error(error)
    }
}
else {
    console.log('.env file already exists')
}