// Utility script to generate JS with snippets

var fs = require("fs")

const snippetsArray = [
  "extension/html/injected/facebook/intro.html",
  "extension/html/injected/facebook/confirm_content.html",
  "extension/html/injected/facebook/run_content.html",
  "extension/html/injected/facebook/share_content.html",
  "extension/html/injected/facebook/share_bottom.html",
  "extension/html/injected/facebook/share.html",
  "extension/html/injected/facebook/more_content.html",
  "extension/html/injected/other/circle.html",
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

// var folderName = "extension"
// var zipName = `releases/NudgeExtension_v${manifest.version}.zip`

// zipFolder(folderName, zipName, async function(err) {
//   if (err) {
//     console.log("oh no! ", err)
//   } else {
//     console.log(
//       `Successfully zipped the ${folderName} directory and stored as ${zipName}`
//     )

//     try {
//       if (allowUpload) {
//         console.log("Proceeding with upload")
//         const token = await webStore.fetchToken()
//         const myZipFile = fs.createReadStream(zipName)
//         const upload = await webStore.uploadExisting(myZipFile, token)
//         console.log(upload)
//         if (allowPublish && upload.uploadState === "SUCCESS") {
//           console.log("Proceeding with publishing")
//           const target = "default" // Can also be 'trustedTesters'
//           const publish = await webStore.publish(target, token)
//           console.log(publish)

//           // Proceed with increasing version number
//           var versionParts = manifest.version.split(".")
//           var vArray = {
//             vMajor: versionParts[0],
//             vMinor: versionParts[1],
//             vPatch: versionParts[2]
//           }
//           vArray.vPatch = parseFloat(vArray.vPatch) + 1
//           var periodString = "."
//           var newVersionNumberString =
//             vArray.vMajor +
//             periodString +
//             vArray.vMinor +
//             periodString +
//             vArray.vPatch
//           manifest.version = newVersionNumberString

//           fs.writeFile(
//             circleFileName,
//             JSON.stringify(manifest, null, 2),
//             function(err) {
//               if (err) return console.log(err)
//               console.log(
//                 `Bumped version from ${previousVersion} to ${manifest.version}`
//               )
//               // console.log("Written to " + manifestFileName);
//             }
//           )
//         } else {
//           console.log(
//             "Not going to publish. Either not allowed or upload failed"
//           )
//         }
//       }
//     } catch (e) {
//       console.log(e)
//     }
//   }
// })
