var reload = false

start()

setInterval(everySecond, 1000)

chrome.runtime.setUninstallURL("https://goo.gl/forms/YqSuCKMQhP3PcFz13")

// Get things going
function start() {
  chrome.storage.sync.get(null, function(syncStorage) {
    // If items.settings doesn't exist, the user is old school style
    // This must hardly ever trigger!
    if (typeof syncStorage == "undefined") {
      log("Startup: no sync storage")
      createNewInstance()
    } else if (typeof syncStorage.settings == "undefined") {
      log("Startup: no settings in sync storage")
      createNewInstance()
    } else if (typeof syncStorage.settings.userId == "undefined") {
      log("Startup: no user ID in syncstorage.settings")
      createNewInstance()
    } else {
      log("Startup: user ID in syncstorage.settings")
      // If items.settings and userId does exist, there is stuff there we need to grab
      // This will also add any new settings in
      loadSettingsAndAmplitude()
    }

    // Clear local and sync storage and create settings for the first time
    function createNewInstance() {
      // Clear localStorage
      localStorageClear()
      // Clear syncStorage
      syncStorageClear()
      storageSet(
        {
          settings: createSettings()
        },
        loadSettingsAndAmplitude
      )
    }
  })
}

// Get settings from sync to settingsLocal, and run options page if asked for
async function loadSettingsAndAmplitude() {
  // Get settings
  chrome.storage.sync.get("settings", function(item) {
    // Get settings locally
    settingsLocal = item.settings

    // Initialise Amplitude - must do it here, before any Amplitude events are sent
    if (settingsLocal.share_data) {
      amplitude.getInstance().init(amplitudeCreds.apiKey)
      // Set user ID
      amplitude.getInstance().setUserId(settingsLocal.userId)
    }

    // Add individual settings that don't exist
    Object.keys(defaultSettings).forEach(function(key) {
      if (isUndefined(item.settings[key])) {
        console.log(`${key} not present in settings, will update with default`)
        changeSetting(defaultSettings[key], key)
      }
    })

    // Show update article on startup if it hasn't been shown since the update
    // For this to work, there must be changeSetting to get show_update_article
    // to be false on the Chrome update
    if (!settingsLocal.show_update_article) {
      chrome.tabs.create({
        url: getUrl(`html/pages/update53.html`)
      })
      changeSetting(true, "show_update_article")
    }

    // Set all domains off by default
    if (settingsLocal.off_by_default) {
      toggleOffByDefault(settingsLocal.off_by_default)
    }

    // Analytics
    if (settingsLocal.share_data) {
      // Log startup event
      amplitude
        .getInstance()
        .logEvent("startup", { share_data: settingsLocal.share_data })
      // Always sync all settings on startup, just to make sure they're in sync
      var identify = new amplitude.Identify()
      flushSettingsToAmplitude(settingsLocal, identify)
      amplitude.getInstance().identify(identify)
    } else {
      // Amplitude HTTP request for non-share data people
      var url = "https://api.amplitude.com/2/httpapi"

      var data = {
        api_key: amplitudeCreds.apiKey,
        events: [
          {
            user_id: settingsLocal.userId,
            event_type: "startup",
            event_properties: {
              share_data: settingsLocal.share_data
            }
          }
        ]
      }

      async function postData() {
        try {
          const response = await fetch(url, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
              "Content-Type": "application/json",
              Accept: "*/*"
            }
          })
          const json = await response.json()
          // log("Success:", JSON.stringify(json))
        } catch (error) {}
      }

      postData()
    }
  })
}

// Set the initial currentState
function checkCurrentState() {
  var initialState = {
    domain: notInChrome,
    source: "initial",
    time: moment(),
    lastEverySecond: moment(),
    lastRealDomain: notInChrome
  }
  var statusObj = open("status")
  // FIXME: sometimes lastEverySecond is not defined. This is a problem!
  if (!keyDefined(statusObj, "currentState")) {
    dataAdder(statusObj, "currentState", initialState)
    // Also define startOfDay here!
    dataAdder(statusObj, "startOfDay", initialState.time)
  } else {
    // Only if any tabs exist - because then we are still 'in' Chrome
    // If there is already a gap, don't update lastEverySecond
    if (
      moment().diff(moment(statusObj.currentState.lastEverySecond), "seconds") >
      2
    ) {
      // Do nothing
    } else {
      statusObj.currentState.lastEverySecond = moment()
    }
  }
  close("status", statusObj, "checkCurrentState")
  return statusObj.currentState
}

// Creates a timeline event (or object, same thing)
function timelineObject(domain, source, timeOverride, lastRealDomain) {
  return {
    time: timeOverride ? moment(timeOverride) : moment(),
    domain,
    source: source,
    lastEverySecond: moment(),
    lastRealDomain: isNudgeDomain(domain) ? domain : lastRealDomain
  }
}

function timeline(domain, source, timeOverride) {
  // Testing tools
  if (config.timelineTest && !timeOverride) {
    return
  }

  // Log
  // log(domain, source)

  // Open status
  var status = open("status")
  // Create previous state
  var previousState = false
  // Set previous state if exists
  if (typeof status.currentState == "undefined") {
    console.log("Current state not yet defined - exit timeline")
    return
  } else {
    previousState = status.currentState
  }

  // Set prevDomain
  var prevDomain = previousState.domain
  var prevTime = previousState.time
  var lastRealDomain = previousState.lastRealDomain

  // Define currentState
  status.currentState = timelineObject(
    domain,
    source,
    timeOverride ? timeOverride : false,
    lastRealDomain
  )

  // Set other variables
  var currDomain = status.currentState.domain
  var currTime = status.currentState.time
  var gapTime = previousState.lastEverySecond

  // Define gap diff
  var gapDiff = moment(currTime).diff(moment(gapTime), "seconds")
  // Define date diff
  var dateDiff = moment(currTime)
    .startOf("day")
    .diff(moment(prevTime).startOf("day"), "days")

  // Record data
  if (isNaN(gapDiff) || isNaN(dateDiff)) {
    // Serious problem
    console.log(gapDiff)
    console.log(dateDiff)
  } else if (gapDiff < 2 && dateDiff === 0) {
    // Normal
    if (prevDomain !== domain) {
      // Close the status
      close("status", status, "normal")
      // Do normal
      domainTimeUpdater(prevDomain, prevTime, currTime, source)
      domainVisitUpdater(currDomain, currTime, source)
    } else {
      // Do nothing
    }
  } else {
    // Close the status
    close("status", status, "other")
    // Process other cases
    if (gapDiff >= 2 && dateDiff === 0) {
      // Gap only
      // From previousTime to previousEverySecond
      domainTimeUpdater(prevDomain, prevTime, gapTime, `${source}-to-gap`)
      // Visit starting at previousEverySecond
      domainVisitUpdater(notInChrome, gapTime, `${source}-gap-notInChrome`)
      // From previousEverySecond to currentTime
      domainTimeUpdater(
        notInChrome,
        gapTime,
        currTime,
        `${source}-gap-to-currentTime`
      )
      // Visit starting at currentTime
      domainVisitUpdater(currDomain, currTime, `${source}-post-gap`)
    } else if (gapDiff < 2 && dateDiff > 0) {
      // Date diff only
      // From previousTime to endOfDay
      domainTimeUpdater(
        prevDomain,
        prevTime,
        moment(prevTime).endOf("day"),
        `${source}-to-endOfDay`
      )
      // Visit starting at startOfDay
      domainVisitUpdater(
        prevDomain,
        moment(currTime).startOf("day"),
        `${source}-startOfDay`
      )
      // From startOfDay to currentTime
      domainTimeUpdater(
        prevDomain,
        moment(currTime).startOf("day"),
        currTime,
        `${source}-startOfDay-to-currentTime-newDay`
      )
      // Visit starting at currentTime
      domainVisitUpdater(currDomain, currTime, `${source}-post-startOfDay`)
    } else {
      // Both date diff and gap diff
      if (moment(gapTime).isBefore(moment(currTime).startOf("day"))) {
        // Gap then day change stuff
        // From previousTime to previousEverySecond
        domainTimeUpdater(
          prevDomain,
          prevTime,
          gapTime,
          `${source}-to-gap-COMBO1`
        )
        // Visit starting at previousEverySecond
        domainVisitUpdater(
          notInChrome,
          gapTime,
          `${source}-gap-notInChrome-COMBO1`
        )
        // From previousEverySecond to endOfDay
        domainTimeUpdater(
          notInChrome,
          gapTime,
          moment(gapTime).endOf("day"),
          `${source}-gap-to-endOfDay-COMBO1`
        )
        // Visit starting at startOfDay
        domainVisitUpdater(
          notInChrome,
          moment(currTime).startOf("day"),
          `${source}-post-gap-COMBO1`
        )
        // From startOfDay to currentTime
        domainTimeUpdater(
          notInChrome,
          moment(currTime).startOf("day"),
          currTime,
          `${source}-startOfDay-to-currentTime-COMBO1-newDay`
        )
        // Visit starting at currentTime
        domainVisitUpdater(
          currDomain,
          currTime,
          `${source}-post-startOfDay-COMBO1`
        )
      } else if (moment(gapTime).isAfter(moment(currTime).startOf("day"))) {
        // Day change then gap stuff
        // From previousTime to endOfDay
        domainTimeUpdater(
          prevDomain,
          prevTime,
          moment(prevTime).endOf("day"),
          `${source}-to-endOfDay-COMBO2`
        )
        // Visit starting at startOfDay
        domainVisitUpdater(
          prevDomain,
          moment(currTime).startOf("day"),
          `${source}-startOfDay-COMBO2`
        )
        // From startOfDay to gap
        domainTimeUpdater(
          prevDomain,
          moment(currTime).startOf("day"),
          gapTime,
          `${source}-startOfDay-to-gap-COMBO2-newDay`
        )
        // Visit starting at gap
        domainVisitUpdater(notInChrome, gapTime, `${source}-gap-COMBO2`)
        // From gap to currentTime
        domainTimeUpdater(
          notInChrome,
          gapTime,
          currTime,
          `${source}-gap-to-currentTime-COMBO2`
        )
        // Visit starting at currentTime
        domainVisitUpdater(currDomain, currTime, `${source}-post-gap-COMBO2`)
      } else {
        console.log("Serious error, must fix")
      }
    }
  }
}
