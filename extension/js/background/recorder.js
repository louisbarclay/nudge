function domainTimeUpdater(domain, startTime, endTime, source) {
  // This is after a visit has been completed, so will include lastVisitEnd (endTime)
  startTime = moment(startTime)
  endTime = moment(endTime)

  var statusObj = open("status")
  dataAdder(statusObj, domain, endTime, "lastVisitEnd")
  close("status", statusObj, "lastVisitEnd")

  // Actual time adding stuff
  // Get addTime in milliseconds
  var duration = moment(endTime).diff(startTime)
  // Open date
  var date = moment(endTime).format("YYYY-MM-DD")
  var dateObj = open(date)
  var prevAllDomainsTime = false
  if (
    typeof dateObj.$allDomains !== "undefined" &&
    "time" in dateObj.$allDomains
  ) {
    prevAllDomainsTime = dateObj.$allDomains.time
  }

  // If startOfDay exists already, check it's for the right day
  if ("startOfDay" in statusObj) {
    if (
      moment(statusObj.startOfDay).format("YYYY-MM-DD") !==
      moment(endTime).format("YYYY-MM-DD")
    ) {
      statusObj.startOfDay = moment(endTime).startOf("day")
    }
    // If not, set it
  } else {
    statusObj.startOfDay = moment(endTime).startOf("day")
  }

  // console.log(prevAllDomainsTime);
  // Add to existing time in date object
  dataAdder(dateObj, domain, duration, "time", addTogether)
  dataAdder(dateObj, allDomains, duration, "time", addTogether)
  // See what allDomains is from beginning
  var allDomainsReal = moment(endTime).diff(statusObj.startOfDay)
  dataAdder(dateObj, domain, 0, "runningCounter")
  close(date, dateObj, "date close in time updater")
  // Define previous and now, in
  var totalTimeToday = dateObj[domain].time

  if (allDomainsReal - dateObj.$allDomains.time !== 0) {
    eventLog("allDomains_unsynced", {
      allDomainsReal,
      allDomains: dateObj.$allDomains.time
    })
  }

  // We assume it wasn't a shutdown
  var shutdown = false

  // Now we identify as a shutdown if domain is true, and not a $ domain, and if there are not any tabs of that kind when visit is closed off
  if (isNudgeDomain(domain)) {
    chrome.tabs.query({}, function(tabs) {
      // log(tabs)
      if (tabsChecker(tabs, domain)) {
        // This is the main place that switching off after closing all tabs of a domain happens
        // It doesn't check for snooze at all when doing this

        dataAdder(statusObj, domain, endTime, "lastShutdown")
        shutdown = true

        // Shutdown happened so turn off site if off by default is on
        if (settingsLocal.off_by_default) {
          changeSetting(true, "domains", domain, "off")
        }

        // log(tabs)
        close("status", statusObj, "status close in check off")
        // Find out whether the domain has been nudged recently
      }
      eventLog(
        "visit",
        {
          domain,
          startTime,
          endTime,
          duration,
          totalTimeToday,
          source,
          shutdown,
          allDomainsDiff: dateObj.$allDomains.time - allDomainsReal
        },
        endTime
      )
    })
  } else {
    // TODO: duplicating this is awful
    eventLog(
      "visit",
      {
        domain,
        startTime,
        endTime,
        duration,
        totalTimeToday,
        source,
        shutdown,
        allDomainsDiff: dateObj.$allDomains.time - allDomainsReal
      },
      endTime
    )
  }

  if (source.includes("newDay")) {
    console.log("New day so closing off keys that we dont need")
    for (var key in localStorage) {
      var dateCheck = new RegExp("[0-9]{4}-[0-9]{2}-[0-9]{2}")
      if (dateCheck.test(key) && key !== moment(endTime).format("YYYY-MM-DD")) {
        // Closes off any previous days and sends them to cloud storage
        if (settingsLocal.share_data) {
          var dayInfo = JSON.parse(localStorage[key])
          dayInfo.settings = settingsLocal
          // Take events out
          delete dayInfo.events
          // Used to send data here - not doing that any more
          // Remove previous day to free up space
          localStorage.removeItem(key)
        } else {
          // Remove previous day to free up space
          localStorage.removeItem(key)
        }
      }
    }
  }
}

// Runs within timeline adder if the new timeline event does not match the old one
function domainVisitUpdater(domain, time, source) {
  time = moment(time)
  var date = moment(time).format("YYYY-MM-DD")
  var dateObj = open(date)
  dataAdder(dateObj, domain, 1, "visits", addTogether)
  close(date, dateObj, "date close in visit updater")
  var totalVisits = dateObj[domain].visits
  var totalTimeToday = dateObj[domain].time

  if (isNudgeDomain(domain)) {
    // Run the live updater
    var liveUpdateObj = {
      type: "live_update",
      domain,
      before: totalTimeToday / 1000,
      runningCounter: 0,
      total: totalTimeToday / 1000,
      visits: totalVisits
    }
    liveUpdate(domain, liveUpdateObj)
  }

  var statusObj = open("status")
  if (!keyDefined(statusObj, domain)) {
    statusObj[domain] = {}
  }
  // Initialise domain statusObj keys if don't exist
  var domainStatusObj = statusObj[domain]
  // Assume no last shutdown
  var lastShutdown = false
  if (keyDefined(domainStatusObj, "lastShutdown")) {
    // Unless there has been one
    lastShutdown = moment(domainStatusObj.lastShutdown)
  }
  // Deleted a whole bunch of code around compulsives

  // Close status off
  close("status", statusObj, "status close in visit updater2")
}

// Runs every second and sends a time nudge if you hit a time nudge level
function domainCurrentTimeUpdater() {
  var currentState = checkCurrentState()
  // Check if currentState is for a domain we care about
  var domain = currentState.domain
  if (isNudgeDomain(domain)) {
    var date = moment().format("YYYY-MM-DD")
    var dateObj = open(date)
    // Increments running counter by 1 second, since this function runs every second
    dataAdder(dateObj, domain, 1, "runningCounter", addTogether)
    close(date, dateObj, "date close in time nudger")
    // Brings out these items as variables in the function for easier manipulation
    var runningCounter = dateObj[domain].runningCounter
    // Set a temporary 0 value on time if undefined
    var time = 0
    if (!isUndefined(dateObj[domain].time)) {
      time = Math.round(dateObj[domain].time / 1000) // Adjustment back to seconds
    }
    // Sets a temporary total time value and evaluates it against our time nudge levels
    var totalTimeTemp = runningCounter + time
    // Send out live info which time.js uses for the rainbow timer
    var liveUpdateObj = {
      type: "live_update",
      domain,
      before: time,
      runningCounter,
      total: totalTimeTemp,
      visits: dateObj[domain].visits
    }
    liveUpdate(domain, liveUpdateObj)
    // Live updater for popup would need to be chrome.runtime.sendMessage
  }
}
