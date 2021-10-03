// run from root
// export the dotenv config to js/background/env.js,
// for use in web
require("dotenv").config();
const fs = require("fs")

const envLocation = 'extension/js/background/env.js'
const keys = ['GOOGLE_API_KEY', 'HIDEES_GOOGLE_SHEET']
const envObject = keys.reduce((obj, key) => ({
    ...obj,
    [key]: process.env[key]
}), {});

fs.writeFile(
    envLocation,
    `const NUDGE_ENV = ${JSON.stringify(envObject)}`,
    function (err) {
        if (err) return console.log(err)
        console.log(`Exported environment keys ${keys.join(', ')} to the extension.`)
    }
)