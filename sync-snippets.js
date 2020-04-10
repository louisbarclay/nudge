// Utility script to generate JS with snippets

var fs = require("fs")

const snippetsArray = [
  "extension/html/injected/facebook/intro.html",
  "extension/html/injected/facebook/confirm_content.html",
  "extension/html/injected/facebook/run_content.html",
  "extension/html/injected/facebook/run.html",
  "extension/html/injected/facebook/share_content.html",
  "extension/html/injected/facebook/share_bottom.html",
  "extension/html/injected/facebook/share.html",
  "extension/html/injected/facebook/more_content.html",
  "extension/html/injected/other/hider-menu.html",
  "extension/html/injected/other/hider-menu-alt.html",
  "extension/html/injected/nudge/corner.html",
  "extension/html/injected/nudge/scroll.html",
  "extension/html/pages/welcome.html"
]

var nudgeStorage = {}

snippetsArray.forEach(function(snippetFileName) {
  let snippet = fs.readFileSync(snippetFileName, "utf8")
  let url = snippetFileName.split("/").pop()
  nudgeStorage[url] = snippet
})

var snippetsFileName = "extension/js/content/snippets.js"

var snippets = fs.readFileSync(snippetsFileName, "utf8")

fs.writeFile(
  snippetsFileName,
  `const nudgeStorage = ${JSON.stringify(nudgeStorage)}`,
  function(err) {
    if (err) return console.log(err)
    console.log(`Saved new snippets`)
  }
)
