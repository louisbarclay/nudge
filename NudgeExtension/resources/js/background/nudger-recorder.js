// Creates a nudge object easily
function nudgeObject(domain, amount, type, status) {
  if (!status) {
    status = "pending";
  }
  return {
    time_loaded: timeNow(),
    type: type,
    domain: domain,
    status: status,
    amount: amount,
    send_fails: 0,
    modal: false
  };
}

function domainTimeUpdater(domain, startTime, endTime) {
  var addTime = endTime - startTime;
  var date = todayDate();
  var dateObj = open(date);
  dataAdder(dateObj, domain, addTime, "time", addTogether);
  dataAdder(dateObj, allDomains, addTime, "time", addTogether);
  var totalTime = dateObj[domain].time;
  var previousTime = totalTime - addTime;
  // Need to reset the runningCounter after updating time
  dataAdder(dateObj, domain, 0, "runningCounter");
  close(date, dateObj);
  // Convert time to readable format
  var duration = logMinutes(addTime / 1000);
  var totalTimeToday = logMinutes(totalTime / 1000);
  startTime = epochToDate(startTime);
  endTime = epochToDate(endTime);
  eventLog(domain, "visit", { startTime, endTime, duration, totalTimeToday });
}

// Runs within timeline adder if the new timeline event does not match the old one
function domainVisitUpdater(domain, time) {
  var date = todayDate();
  var dateObj = open(date);
  dataAdder(dateObj, domain, 1, "visits", addTogether);
  var totalVisits = dateObj[domain].visits;
  var totalTime = dateObj[domain].time;
  close(date, dateObj);
  // Set until which point back in time to look for a shutdown FIXME: shouldn't get a compulsive or a visit in certain situations...pointless
  var compulsiveSearch =
    time - settingsLocal.compulsive_setting * minSec * 1000;
  // Compulsive is true if there has ever been a shutdown, if the last shutdown was after the point back in time we're looking,
  // and if the last shutdown was after the last compulsive (important because if not, we could do a compulsive when one has already been done)
  var statusObj = open("status");
  dataAdder(statusObj, domain, 0, "lastShutdown", ifDoesntExistMakeZero);
  dataAdder(statusObj, domain, 0, "lastCompulsive", ifDoesntExistMakeZero);
  var domainStatusObj = statusObj[domain];
  var compulsive =
    domainStatusObj.lastShutdown !== 0 &&
    domainStatusObj.lastShutdown > compulsiveSearch &&
    domainStatusObj.lastCompulsive < domainStatusObj.lastShutdown;
  if (compulsive) {
    dataAdder(statusObj, domain, time, "lastCompulsive");
    messageSender(
      nudgeObject(
        domain,
        Math.round((timeNow() - domainStatusObj.lastShutdown) / 1000),
        "compulsive"
      )
    );
  }
  close("status", statusObj);
}

// Runs every second and sends a time nudge if you hit a time nudge level
function domainTimeNudger() {
  // Check if currentState is for a domain we care about
  var domain = currentState.domain;
  if (domain) {
    var nonDomain =
      domain === notInChrome ||
      domain === chromeOrTabIdle ||
      domain === inChromeFalseDomain;
    var date = todayDate();
    var dateObj = open(date);
    dataAdder(dateObj, domain, 1, "runningCounter", addTogether);
    // Close it off already
    close(date, dateObj);
    var runningCounter = dateObj[domain].runningCounter;
    var time = dateObj[domain].time;
    // Set a temporary 0 value on time if undefined
    if (!notUndefined(time)) {
      time = 0;
    }
    // Sets a temporary total time value and evaluates it against our time nudge levels
    var totalTimeTemp = runningCounter + Math.round(time / 1000);
    if (
      totalTimeTemp % (settingsLocal.time_s_setting * minSec) === 0 &&
      !nonDomain
    ) {
      messageSender(nudgeObject(domain, totalTimeTemp, "time"));
    }
    // Sends that second by second data to the debug updater, a UI element that helps me figure out where problems are
    if (config.debug) {
      chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(
        tabs
      ) {
        if (typeof tabs[0] != "undefined") {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: "debug_updater",
            domain: domain,
            before: time,
            runningCounter: runningCounter,
            total: totalTimeTemp,
            visits: dateObj[domain].visits
          });
        }
      });
    }
  }
}
