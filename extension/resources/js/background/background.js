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
  close("status", statusObj, "checkCurrentState");
  return statusObj.currentState;
}

function timeline(domain, source, timeOverride) {
  if (testMode && !timeOverride) {
    return;
  }

  // Log
  // console.log(domain, source);

  // Open status
  var status = open("status");
  // Create previous state
  var previousState = false;
  // Set previous state if exists
  if (typeof status.currentState == "undefined") {
    console.log("Current state not yet defined - exit timeline");
    return;
  } else {
    previousState = status.currentState;
  }

  // Set prevDomain
  var prevDomain = previousState.domain;
  var prevTime = previousState.time;

  // Define currentState
  status.currentState = timelineObject(
    domain,
    source,
    timeOverride ? timeOverride : false
  );

  // Only actually close current state if needed
  // FIXME: implications of this for the gap and day events? Must test
  // console.log(prevDomain);
  // console.log(domain);
  // console.log(`Closed ${source} ${status.currentState.time.toISOString()}`);

  // Set other variables
  var currDomain = status.currentState.domain;
  var currTime = status.currentState.time;
  var gapTime = previousState.lastEverySecond;

  // Logs
  // if (moment(prevTime).valueOf() === moment(currTime).valueOf()) {
  //   console.log("This can happen and it's OK");
  // }
  // console.log(moment(prevTime).format("hh:mm:ss"));
  // console.log(moment(currTime).format("hh:mm:ss"));

  // console.log(`Curr time: ${moment(currTime).toISOString()}`);
  // console.log(`Last e s : ${gapTime}`);
  // console.log(`Prev time: ${prevTime}`);

  // Define gap diff
  var gapDiff = moment(currTime).diff(moment(gapTime), "seconds");
  // Define date diff
  var dateDiff = moment(currTime)
    .startOf("day")
    .diff(moment(prevTime).startOf("day"), "days");

  // Record data
  if (isNaN(gapDiff) || isNaN(dateDiff)) {
    // Serious problem
    console.log(gapDiff);
    console.log(dateDiff);
  } else if (gapDiff < 2 && dateDiff === 0) {
    // Normal
    if (prevDomain !== domain) {
      // Close the status
      close("status", status, "normal");
      // Do normal
      domainTimeUpdater(prevDomain, prevTime, currTime, source);
      domainVisitUpdater(currDomain, currTime, source);
    } else {
      // Do nothing
    }
  } else {
    // Close the status
    close("status", status, "other");
    // Process other cases
    if (gapDiff >= 2 && dateDiff === 0) {
      // Gap only
      // From previousTime to previousEverySecond
      domainTimeUpdater(prevDomain, prevTime, gapTime, `${source}-to-gap`);
      // Visit starting at previousEverySecond
      domainVisitUpdater(notInChrome, gapTime, `${source}-gap-notInChrome`);
      // From previousEverySecond to currentTime
      domainTimeUpdater(
        prevDomain,
        gapTime,
        currTime,
        `${source}-gap-to-currentTime`
      );
      // Visit starting at currentTime
      domainVisitUpdater(currDomain, currTime, `${source}-post-gap`);
    } else if (gapDiff < 2 && dateDiff > 0) {
      // Date diff only
      // From previousTime to endOfDay
      domainTimeUpdater(
        prevDomain,
        prevTime,
        moment(prevTime).endOf("day"),
        `${source}-to-endOfDay`
      );
      // Visit starting at startOfDay
      domainVisitUpdater(
        prevDomain,
        moment(currTime).startOf("day"),
        `${source}-startOfDay`
      );
      // From startOfDay to currentTime
      domainTimeUpdater(
        prevDomain,
        moment(currTime).startOf("day"),
        currTime,
        `${source}-startOfDay-to-currentTime-newDay`
      );
      // Visit starting at currentTime
      domainVisitUpdater(currDomain, currTime, `${source}-post-startOfDay`);
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
        );
        // Visit starting at previousEverySecond
        domainVisitUpdater(
          notInChrome,
          gapTime,
          `${source}-gap-notInChrome-COMBO1`
        );
        // From previousEverySecond to endOfDay
        domainTimeUpdater(
          notInChrome,
          gapTime,
          moment(gapTime).endOf("day"),
          `${source}-gap-to-endOfDay-COMBO1`
        );
        // Visit starting at startOfDay
        domainVisitUpdater(
          notInChrome,
          moment(currTime).startOf("day"),
          `${source}-post-gap-COMBO1`
        );
        // From startOfDay to currentTime
        domainTimeUpdater(
          notInChrome,
          moment(currTime).startOf("day"),
          currTime,
          `${source}-startOfDay-to-currentTime-COMBO1-newDay`
        );
        // Visit starting at currentTime
        domainVisitUpdater(
          currDomain,
          currTime,
          `${source}-post-startOfDay-COMBO1`
        );
      } else if (moment(gapTime).isAfter(moment(currTime).startOf("day"))) {
        // Day change then gap stuff
        // From previousTime to endOfDay
        domainTimeUpdater(
          prevDomain,
          prevTime,
          moment(prevTime).endOf("day"),
          `${source}-to-endOfDay-COMBO2`
        );
        // Visit starting at startOfDay
        domainVisitUpdater(
          prevDomain,
          moment(currTime).startOf("day"),
          `${source}-startOfDay-COMBO2`
        );
        // From startOfDay to gap
        domainTimeUpdater(
          prevDomain,
          moment(currTime).startOf("day"),
          gapTime,
          `${source}-startOfDay-to-gap-COMBO2-newDay`
        );
        // Visit starting at gap
        domainVisitUpdater(notInChrome, gapTime, `${source}-gap-COMBO2`);
        // From gap to currentTime
        domainTimeUpdater(
          notInChrome,
          gapTime,
          currTime,
          `${source}-gap-to-currentTime-COMBO2`
        );
        // Visit starting at currentTime
        domainVisitUpdater(currDomain, currTime, `${source}-post-gap-COMBO2`);
      } else {
        console.log("Serious error, must fix");
      }
    }
  }
}