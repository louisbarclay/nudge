// Utility script to generate JS with snippets

var fs = require("fs")
var gsjson = require("google-spreadsheet-to-json")
var divs = false

gsjson({
  spreadsheetId: "1Y-xQb1qRgnicD_0M-8REXKbSPi4lnsQW7lqUqh52fiw"
  // other options...
})
  .then(function(result) {
    divs = result

    // Get into more acceptable format

    let cleanedDivs = {}
    divs.forEach(function(div) {
      if (cleanedDivs[div.domain]) {
      } else {
        cleanedDivs[div.domain] = []
      }
      let cleanedDiv = {}
      cleanedDiv.uniqueId = div.uniqueid
      cleanedDiv.description = div.description
      if (div.classname) {
        cleanedDiv.className = div.classname
      }
      if (div.id) {
        cleanedDiv.id = div.id
      }
      if (div.includepages) {
        cleanedDiv.includePages = div.includepages
      }
      if (div.ignorepages) {
        cleanedDiv.ignorePages = div.ignorepages
      }
      cleanedDivs[div.domain].push(cleanedDiv)
    })

    var divsFileName = "extension/js/vars/divs.js"

    fs.writeFile(
      divsFileName,
      `const divs = ${JSON.stringify(cleanedDivs)}`,
      function(err) {
        if (err) return console.log(err)
        console.log(`Saved new divs`)
      }
    )
  })
  .catch(function(err) {
    console.log(err.message)
    console.log(err.stack)
  })
