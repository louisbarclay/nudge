const fs = require("fs")
const chokidar = require("chokidar")

const htmlFiles = [
  "extension/html/injected/facebook/intro.html",
  "extension/html/injected/facebook/confirm_content.html",
  "extension/html/injected/facebook/run_content.html",
  "extension/html/injected/facebook/run.html",
  "extension/html/injected/facebook/share_content.html",
  "extension/html/injected/facebook/share_bottom.html",
  "extension/html/injected/facebook/share.html",
  "extension/html/injected/facebook/more_content.html",
  "extension/html/injected/hider-menu.html",
  "extension/html/injected/nudge/corner.html",
  "extension/html/injected/nudge/scroll.html",
]
const htmlJsFile = "extension/js/content/storage/html.js"

// Simplify logging
const log = console.log.bind(console)

htmlFiles.forEach(function (htmlFile) {
  const watcher = chokidar.watch(htmlFile, {
    persistent: true,
  })
  log(`Watching ${htmlFile}`)

  watcher.on("change", (path) => {
    log(`File ${path} has been changed`)
    writeNewHtmlSnippet()
  })
})

writeNewHtmlSnippet()

function writeNewHtmlSnippet() {
  let extensionStorage = {}
  htmlFiles.forEach((htmlFile) => {
    let htmlFileName = htmlFile.split("/").pop()
    let html = fs.readFileSync(htmlFile, "utf8")
    extensionStorage[htmlFileName] = html
  })
  fs.writeFile(
    htmlJsFile,
    `const extensionStorage = ${JSON.stringify(extensionStorage)}`,
    function (err) {
      if (err) return console.log(err)
      log(`Updated HTML in JS file`)
    }
  )
}
