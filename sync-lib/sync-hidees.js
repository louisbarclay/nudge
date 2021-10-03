require("dotenv").config()
const fs = require("fs")
global.fetch = require("node-fetch")
const {google} = require('googleapis');
const GOOGLE_API_SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

// Simplify logging
const log = console.log.bind(console)
const hideesLocation = "extension/js/vars/hidees.js"

// This will make sure we do an initial check
let currentHidees = false

// Check credentials
if (!process.env.GOOGLE_API_KEY || !process.env.HIDEES_GOOGLE_SHEET) {
  log("[node sync-lib] warning: Google Sheet v4 API values are missing. Not syncing hidees from the Google Sheet.");
  process.exit(0);
} 

// Start checking for sheet updates
log("Initialising Google Sheet checker")
checkHidees()
// setInterval(checkHidees, 60000)

function checkHidees() {

  const sheets = google.sheets({version: 'v4', auth: process.env.GOOGLE_API_KEY});
  sheets.spreadsheets.values.get({
    spreadsheetId: process.env.HIDEES_GOOGLE_SHEET,
    range: 'Hidden Sections',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const rows = res.data.values;
    if (rows.length) {
      log("Connecting to Google Sheet")
      let hidees = []
      // Get row headers
      const keys = rows[0]

      // Exclude row headers
      rows.forEach((row, index) => {
        if (index > 0) {
          let hidee = {}
          row.forEach((columnValue, index) => {
            // Clean column values
            if (columnValue) {
              if (keys[index].includes("style.")) {
                if (!hidee.style) {
                  hidee.style = {}
                }
                hidee.style[keys[index].replace("style.", "")] = columnValue
              } else {
                columnValue = cleanValue(columnValue)
                hidee[keys[index]] = columnValue
              }
            }
          })
          // Make a hidee style object if there is none
          if (!hidee.style) {
            hidee.style = {}
          }
          if (hidee.import) {
            delete hidee.import
            hidees.push(hidee)
          }
        }
      })

      // If current hidees is false (initial state) or not the same as new hidees, write new file
      if (!currentHidees || currentHidees.length !== hidees.length) {
        // Set current hidees
        currentHidees = hidees
        fs.writeFile(
          hideesLocation,
          `const hideesStore = ${JSON.stringify(hidees)}`,
          function (err) {
            if (err) return console.log(err)
            console.log(`Saved new hidees from Google Sheet`)
          }
        )
      } else {
        log("No new hidees on Google Sheet")
      }
  } else {
    console.log('No data found.');
  }
  });

}

// Util
const cleanValue = (columnValue) => {
  if (columnValue === "TRUE") {
    return true
  }
  if (columnValue === "FALSE") {
    return false
  }
  return columnValue
}
