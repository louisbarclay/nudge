// Utility script to generate JS with snippets

var fs = require("fs")
const { GoogleSpreadsheet } = require("google-spreadsheet")

var credentials = require("./credentials")

;(async () => {
  // spreadsheet key is the long id in the sheets URL
  const doc = new GoogleSpreadsheet(
    "1Y-xQb1qRgnicD_0M-8REXKbSPi4lnsQW7lqUqh52fiw"
  )

  doc.useApiKey(credentials.api_key)

  await doc.loadInfo() // loads document properties and worksheets
  console.log(doc.title)

  const sheet = doc.sheetsByIndex[0] // or use doc.sheetsById[id]
  const rows = await sheet.getRows()
  console.log(rows)
})()

// var snippetsFileName = "extension/js/content/snippets.js"

// var snippets = fs.readFileSync(snippetsFileName, "utf8")

// fs.writeFile(
//   snippetsFileName,
//   `const nudgeStorage = ${JSON.stringify(nudgeStorage)}`,
//   function(err) {
//     if (err) return console.log(err)
//     console.log(`Saved new snippets`)
//   }
// )
