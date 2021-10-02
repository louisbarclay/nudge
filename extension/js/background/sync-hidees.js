if (!NUDGE_ENV) {
  log("warning: Google Sheet v4 API values are missing");
}

const url = `https://sheets.googleapis.com/v4/spreadsheets/${NUDGE_ENV.HIDEES_GOOGLE_SHEET}/values/Hidden Sections?key=${NUDGE_ENV.GOOGLE_API_KEY}`

async function checkHidees() {
  return new Promise(async (resolve) => {
    try {
      const rows = await fetch(url).then(r => r.json()).then(obj => obj.values);
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
      log("Loaded hidees")
      resolve(hidees)
    } catch (e) {
      resolve(false)
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
