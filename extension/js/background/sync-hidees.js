async function checkHidees() {
  return new Promise((resolve) => {
    try {
      raw("1Y-xQb1qRgnicD_0M-8REXKbSPi4lnsQW7lqUqh52fiw").then((sheet) => {
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
        log("Loaded hidees")
        resolve(hidees)
      })
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
