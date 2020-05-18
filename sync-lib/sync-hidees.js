require("dotenv").config()
const fs = require("fs")
global.fetch = require("node-fetch")
const GetSheetDone = require("get-sheet-done")

// Simplify logging
const log = console.log.bind(console)
const hideesLocation = "extension/js/vars/hidees.js"

// This will make sure we do an initial check
let currentHidees = false

// Start checking
log("Initialising Google Sheet checker")
checkHidees()
// setInterval(checkHidees, 60000)

function checkHidees() {
  GetSheetDone.raw(process.env.HIDEES_GOOGLE_SHEET).then((sheet) => {
    log("Connecting to Google Sheet")
    let hidees = []
    // Get row headers
    const keys = sheet.data[0]
    // Exclude row headers
    sheet.data.forEach((row, index) => {
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
  })
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
