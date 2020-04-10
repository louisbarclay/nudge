// Utility script to generate JS with snippets

var fs = require("fs")
var gsjson = require("google-spreadsheet-to-json")
var hidees = false

gsjson({
  spreadsheetId: "1Y-xQb1qRgnicD_0M-8REXKbSPi4lnsQW7lqUqh52fiw"
  // other options...
})
  .then(function(result) {
    hidees = result

    // Get into more acceptable format

    let cleanedHidees = []
    hidees.forEach(function(hidee) {
      let cleanedHidee = {}
      cleanedHidee.slug = hidee.slug
      cleanedHidee.description = hidee.description
      cleanedHidee.domain = hidee.domain
      if (hidee.classname) {
        cleanedHidee.className = hidee.classname
      }
      if (hidee.id) {
        cleanedHidee.id = hidee.id
      }
      if (hidee.includepages) {
        cleanedHidee.includePages = hidee.includepages
      }
      if (hidee.ignorepages) {
        cleanedHidee.ignorePages = hidee.ignorepages
      }
      if (hidee.showmenu) {
        cleanedHidee.showMenu = true
      } else {
        cleanedHidee.showMenu = false
      }
      cleanedHidees.push(cleanedHidee)
    })

    var hideesFileName = "extension/js/vars/hidees.js"

    fs.writeFile(
      hideesFileName,
      `const hideesStore = ${JSON.stringify(cleanedHidees)}`,
      function(err) {
        if (err) return console.log(err)
        console.log(`Saved new hidees`)
      }
    )
  })
  .catch(function(err) {
    console.log(err.message)
    console.log(err.stack)
  })
