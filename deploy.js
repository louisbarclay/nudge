// Utility script to deploy
// Needs a credentials.js file to refer to (git ignored)

var fs = require("fs")
var zipFolder = require("zip-folder")
var credentials = require("./credentials")
var allowUpload = true
var allowPublish = true
const webStore = require("chrome-webstore-upload")({
  extensionId: "dmhgdnbkjkejeddddlklojinngaideac",
  clientId: credentials.id,
  clientSecret: credentials.secret,
  refreshToken: credentials.refreshToken
})

// Useful: https://github.com/DrewML/chrome-webstore-upload/blob/master/How%20to%20generate%20Google%20API%20keys.md

var manifestFileName = "extension/manifest.json"
var manifest = JSON.parse(fs.readFileSync(manifestFileName, "utf8"))
var previousVersion = manifest.version

var folderName = "extension"
var zipName = `releases/NudgeExtension_v${manifest.version}.zip`

zipFolder(folderName, zipName, async function(err) {
  if (err) {
    console.log("oh no! ", err)
  } else {
    console.log(
      `Successfully zipped the ${folderName} directory and stored as ${zipName}`
    )

    try {
      if (allowUpload) {
        console.log("Proceeding with upload")
        const token = await webStore.fetchToken()
        const myZipFile = fs.createReadStream(zipName)
        const upload = await webStore.uploadExisting(myZipFile, token)
        console.log(upload)
        if (allowPublish && upload.uploadState === "SUCCESS") {
          console.log("Proceeding with publishing")
          const target = "default" // Can also be 'trustedTesters'
          const publish = await webStore.publish(target, token)
          console.log(publish)

          // Proceed with increasing version number
          var versionParts = manifest.version.split(".")
          var vArray = {
            vMajor: versionParts[0],
            vMinor: versionParts[1],
            vPatch: versionParts[2]
          }
          vArray.vPatch = parseFloat(vArray.vPatch) + 1
          var periodString = "."
          var newVersionNumberString =
            vArray.vMajor +
            periodString +
            vArray.vMinor +
            periodString +
            vArray.vPatch
          manifest.version = newVersionNumberString

          fs.writeFile(
            manifestFileName,
            JSON.stringify(manifest, null, 2),
            function(err) {
              if (err) return console.log(err)
              console.log(
                `Bumped version from ${previousVersion} to ${manifest.version}`
              )
              // console.log("Written to " + manifestFileName);
            }
          )
        } else {
          console.log(
            "Not going to publish. Either not allowed or upload failed"
          )
        }
      }
    } catch (e) {
      console.log(e)
    }
  }
})
