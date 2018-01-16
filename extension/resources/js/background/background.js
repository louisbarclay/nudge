var reload = false;

initialise();

setInterval(everySecond, 1000);

// TODO: need security around this!
function initialise() {
  chrome.storage.sync.get(null, function(items) {
    // If items.settings doesn't exist, the user is old school style
    // This must hardly ever trigger!
    if (isEmpty(items.settings)) {
      // Clear localStorage
      localStorageClear();
      // Clear syncStorage
      syncStorageClear();
      storageSet(
        {
          settings: initSettings()
        },
        syncSettingsLocal
      );
    } else {
      // If items.settings does exist, there is stuff there we need to grab
      syncSettingsLocal();
      // Where do you sync the domain list from? Surely you must keep in settings?
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
  if (!keyDefined(statusObj, "currentState")) {
    dataAdder(statusObj, "currentState", initialState);
  } else {
    // Only if any tabs exist
    if (statusObj.currentState.domain !== notInChrome) {
      statusObj.currentState.lastEverySecond = moment();
    }
  }
  close("status", statusObj);
  return statusObj.currentState;
}

// Add to timeline on window in and window out

var testState = {
  domain: "facebook.com",
  source: "initial",
  lastEverySecond: moment(),
  time: moment()
    .add(-1, "days")
    .toString()
};

var testCounter = 0;

function timeline(domain, source, timeOverride, callback) {
  // Open status to look at currentState
  var s = open("status");
  // Test counter at 2. currentState constant for first call, then for second, after which it can be changed
  // if (testCounter < 2) {
  //   s.currentState = testState;
  //   testCounter++;
  // }
  var newS = timelineObject(domain, source);
  // Override time if needed
  if (notUndefined(timeOverride)) {
    newS.time = timeOverride;
  }

  // If it's a current day splitter, take currentState time as start of newS day
  if (source === "dateSplit_currentDay") {
    s.currentState.time = moment(newS.time).startOf("day");
  }

  // If there is a gap, do a gap
  if (
    moment(newS.time).diff(moment(s.currentState.lastEverySecond), "seconds") >
      2 &&
    // Prevent gap recursion
    !source.includes("gap")
  ) {
    // Check whether there is a gap where everySecond didn't ping
    // New retro-active event
    timeline(
      notInChrome,
      source + " gap",
      s.currentState.lastEverySecond,
      function() {
        // Original event
        timeline(domain, source + " gap");
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

  // If previous domain is same as current domain, don't do anything - unless day has changed
  if (
    s.currentState.domain === domain &&
    source !== "dateSplit_previousDay" &&
    source !== "dateSplit_currentDay"
  ) {
    // Do nothing
  } else {
    // First, create new variable lastState, which is what we had before the changes we're about to make
    var lastState = s.currentState;
    s.currentState = newS;
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
  close("status", s);
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
