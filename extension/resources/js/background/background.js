var reload = false;

initialise();

setInterval(everySecond, 1000);

// TODO: need security around this!
function initialise() {
  chrome.storage.sync.get(null, function(items) {
    // If items.settings doesn't exist, the user is old school style
    // This must hardly ever trigger!
    if (typeof items == "undefined") {
      console.log("Startup A");
      runInit();
    } else if (typeof items.settings == "undefined") {
      console.log("Startup B");
      runInit();
    } else if (typeof items.settings.userId == "undefined") {
      console.log("Startup C");
      runInit();
    } else {
      console.log("Startup D");
      // If items.settings and userId does exist, there is stuff there we need to grab
      syncSettingsLocalInit();
    }
    function runInit() {
      // Clear localStorage
      localStorageClear();
      // Clear syncStorage
      syncStorageClear();
      storageSet(
        {
          settings: initSettings()
        },
        syncSettingsLocalInit
      );
    }
  });
}

// Set the initial currentState
function checkCurrentState() {
  var initialState = {
    domain: false,
    source: "initial",
    time: moment(),
    lastEverySecond: moment()
  };
  var statusObj = open("status");
  // FIXME: sometimes lastEverySecond is not defined. This is a problem!
  if (!keyDefined(statusObj, "currentState")) {
    dataAdder(statusObj, "currentState", initialState);
    // Also define startOfDay here!
    dataAdder(statusObj, "startOfDay", initialState.time);
  } else {
    // Only if any tabs exist - because then we are still 'in' Chrome
    // If there is already a gap, don't update lastEverySecond
    // console.log(
    //   moment().diff(moment(statusObj.currentState.lastEverySecond), "seconds")
    // );
    if (
      moment().diff(moment(statusObj.currentState.lastEverySecond), "seconds") >
      2
    ) {
      // Do nothing
    } else {
      statusObj.currentState.lastEverySecond = moment();
    }
  }
  close("status", statusObj);
  return statusObj.currentState;
}

// Add to timeline on window in and window out
function timeline(domain, source, timeOverride, callback) {
  // console.log(domain, source, moment(timeOverride).calendar());
  if (t) {
    return;
  }
  // Open status to look at currentState
  var s = open("status");
  if (typeof s.currentState == "undefined") {
    console.log("Current state is not yet defined so no point continuing");
    return;
  }
  // Test counter at 2. currentState constant for first call, then for second, after which it can be changed
  var newS = timelineObject(domain, source);
  // console.log(newS);
  // Override time if needed
  if (notUndefined(timeOverride)) {
    newS.time = timeOverride;
  }

  // If it's a current day splitter, take currentState time as start of newS day
  if (source === "dateSplit_currentDay") {
    s.currentState.time = moment(newS.time).startOf("day");
    // Also, log start of day for comparison purposes
    s.startOfDay = moment(newS.time).startOf("day");
  }
  // If there is a gap, do a gap
  if (
    moment(newS.time).diff(moment(s.currentState.lastEverySecond), "seconds") >
      2 &&
    // Prevent gap recursion
    !source.includes("gap")
  ) {
    console.log(
      `newS time is ${moment(newS.time).format(
        "HH:mm:ss"
      )} and currentState.lastEverySecond is ${moment(
        s.currentState.lastEverySecond
      ).format("HH:mm:ss")}, and the diff is calculated at ${moment(
        newS.time
      ).diff(moment(s.currentState.lastEverySecond), "seconds")}`
    );
    // Check whether there is a gap where everySecond didn't ping
    // New retro-active event
    timeline(
      notInChrome,
      source + " gapStart",
      s.currentState.lastEverySecond,
      function() {
        // Original event
        timeline(domain, source + " gapEnd");
      }
    );
    return;
  }

  // Check whether dates match
  // If they don't, we close off the previous date (and send it to the cloud, taking what we need!)
  if (
    moment(s.currentState.time).format("YYYY-MM-DD") !==
      moment(newS.time).format("YYYY-MM-DD") &&
    // Safety feature to stop recursion
    !source.includes("dateSplit")
  ) {
    if (
      moment(s.currentState.time).format("YYYY-MM-DD") ===
      moment(newS.time)
        .add(-1, "days")
        .format("YYYY-MM-DD")
    ) {
      // Last date is literally yesterday
      // Ask here if source includes gap?
      timeline(
        s.currentState.domain,
        "dateSplit_previousDay",
        moment(s.currentState.time).endOf("day"),
        function() {
          timeline(domain, "dateSplit_currentDay");
        }
      );
      return;
    } else {
      timeline(
        domain,
        "dateSplit_previousDay",
        moment(s.currentState.time).endOf("day"),
        function() {
          timeline(domain, "dateSplit_currentDay");
        }
      );
      return;
    }
  }

  // If previous domain is same as current domain, don't do anything - unless day has changed
  // FIXME: this seems like it needs to be tested well
  if (
    s.currentState.domain === domain &&
    source !== "dateSplit_previousDay" &&
    source !== "dateSplit_currentDay" &&
    !source.includes("gapStart") // Also don't update timeline if gapStart, but DO if gapEnd
  ) {
    // Do nothing
  } else {
    // First, create new variable lastState, which is what we had before the changes we're about to make
    var lastState = s.currentState;
    s.currentState = newS;
    // Close before running other functions
    close("status", s);
    // Update time (close off visit)
    domainTimeUpdater(
      lastState.domain,
      moment(lastState.time),
      s.currentState.time,
      source
    );
    // Update visit
    domainVisitUpdater(domain, newS.time, source);
  }
  if (callback) {
    callback();
  }
}

// timelineAdder test
function timelineAdderTest() {
  function runAfter(initial, callback) {
    initial();
    setTimeout(callback, 1000);
  }
}
