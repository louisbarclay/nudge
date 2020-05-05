var config = {
  debug: false,
  offByDefault: true,
  resetDivSettings: false,
  fastTimer: false,
  timelineTest: false,
  dev: false,
  previewMode: false,
}

// Dev config variables
if (!chrome.runtime.getManifest().update_url) {
  console.log("Env: dev")
  config.dev = true
  config.debug = true
  config.offByDefault = true
  config.resetDivSettings = false
  config.fastTimer = false
  config.timelineTest = false
  config.previewMode = false
}
