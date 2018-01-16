// Creates a nudge object
function nudgeObject(domain, amount, type, status) {
  if (!status) {
    status = "pending";
  }
  return {
    time_loaded: moment(),
    type: type,
    domain: domain,
    status: status,
    amount: amount,
    send_fails: 0,
    modal: false
  };
}

function domainTimeUpdater(domain, startTime, endTime, source) {
  // Last shutdown if domain is true, and not an odd domain, and if there are not any tabs of that kind when visit is closed off
  if (domain && domain !== notInChrome && domain !== chromeOrTabIdle) {
    chrome.tabs.query({}, function(tabs) {
      if (tabsChecker(tabs, domain)) {
        // Check if domain is off - if it is, the visit will have ended in an 'off' redirect so let's not call that a shutdown
        if (!settingsLocal.domains[domain].off) {
          var statusObj = open("status");
          console.log(endTime);
          dataAdder(statusObj, domain, endTime, "lastShutdown");
          close("status", statusObj);
          if (settingsLocal.domains[domain].offByDefault) {
            changeSetting(true, "domains", domain, "off");
          }
          // Find out whether the domain has been nudged recently
          // Because we are going to log the shutdown and ask if there's been a recent nudge
          var nudged = false;
          if (
            keyDefined(statusObj, domain) &&
            keyDefined(statusObj[domain], "lastNudged")
          ) {
            // untested
            var timeSinceLastNudged = endTime - statusObj[domain].lastNudged;
            if (timeSinceLastNudged < 60000) {
              nudged = true;
            }
          }
          eventLog(domain, "shutdown", { nudged });
        }
      }
    });
  }
  var addTime = endTime.diff(startTime);
  var date = moment().format("YYYY-MM-DD");
  var dateObj = open(date);
  dataAdder(dateObj, domain, addTime, "time", addTogether);
  dataAdder(dateObj, allDomains, addTime, "time", addTogether);
  dataAdder(dateObj, domain, 0, "runningCounter");
  close(date, dateObj);
  var totalTime = dateObj[domain].time;
  var previousTime = totalTime - addTime;
  // Need to reset the runningCounter after updating time
  // Convert time to readable format
  var duration = logMinutes(addTime / 1000);
  var totalTimeToday = logMinutes(totalTime / 1000);
  eventLog(domain, "visit", {
    startTime: startTime.format("HH:mm:ss"),
    endTime: endTime.format("HH:mm:ss"),
    duration,
    totalTimeToday,
    source
  });
  if ((source = "dateSplit_previousDay")) {
    // Closes off the previous day and sends it to cloud storage
    // Keeps what it needs from it
  }
}

// Runs within timeline adder if the new timeline event does not match the old one
function domainVisitUpdater(domain, time, source) {
  var date = moment().format("YYYY-MM-DD");
  var dateObj = open(date);
  dataAdder(dateObj, domain, 1, "visits", addTogether);
  close(date, dateObj);
  var totalVisits = dateObj[domain].visits;
  var totalTime = dateObj[domain].time;
  // Set until which point back in time to look for a shutdown FIXME: shouldn't get a compulsive or a visit in certain situations...pointless
  var compulsiveSearch = time - settingsLocal.compulsive * minSec * 1000;
  // Compulsive is true if there has ever been a shutdown, if the last shutdown was after the point back in time we're looking,
  // and if the last shutdown was after the last compulsive (important because if not, we could do a compulsive when one has already been done)
  var statusObj = open("status");
  if (!keyDefined(statusObj, domain)) {
    statusObj[domain] = {};
  }
  // Initialise domain statusObj keys if don't exist
  var domainStatusObj = statusObj[domain];
  var compulsive =
    keyDefined(domainStatusObj, "lastShutdown") &&
    domainStatusObj.lastShutdown > compulsiveSearch &&
    (!keyDefined(domainStatusObj, "lastCompulsive") ||
      domainStatusObj.lastCompulsive < domainStatusObj.lastShutdown);
  if (compulsive) {
    dataAdder(dateObj, domain, 1, "compulsives", addTogether);
    console.log("tried to send compulsive");
    dataAdder(statusObj, domain, time, "lastCompulsive");
    messageSender(
      nudgeObject(domain, domainStatusObj.lastShutdown, "compulsive")
    );
  }
  close("status", statusObj);
  eventLog(domain, "visitStart", { totalVisits, source });
}

// Runs every second and sends a time nudge if you hit a time nudge level
function domainTimeNudger() {
  return;
  var statusObj = open("status");
  var currentState = checkCurrentState();
  // Check if currentState is for a domain we care about
  var domain = currentState.domain;
  if (domain) {
    var nonDomain = domain === notInChrome || domain === chromeOrTabIdle;
    var date = moment().format("YYYY-MM-DD");
    var dateObj = open(date);
    dataAdder(dateObj, domain, 1, "runningCounter", addTogether);
    close(date, dateObj);
    var runningCounter = dateObj[domain].runningCounter;
    var time = dateObj[domain].time;
    // Set a temporary 0 value on time if undefined
    if (!notUndefined(time)) {
      time = 0;
    }
    // Sets a temporary total time value and evaluates it against our time nudge levels
    var totalTimeTemp = runningCounter + Math.round(time / 1000);
    if (totalTimeTemp % (settingsLocal.time * minSec) === 0 && !nonDomain) {
      messageSender(nudgeObject(domain, totalTimeTemp, "time"));
    }
    // Live updater
    chrome.runtime.sendMessage({
      type: "live_update",
      domain,
      before: time,
      runningCounter: runningCounter,
      total: totalTimeTemp,
      visits: dateObj[domain].visits
    });
  }
}
