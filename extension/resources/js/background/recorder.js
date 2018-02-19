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
  startTime = moment(startTime);
  endTime = moment(endTime);
  var statusObj = open("status");
  // Last shutdown if domain is true, and not an odd domain, and if there are not any tabs of that kind when visit is closed off
  if (domain && domain !== notInChrome && domain !== chromeOrTabIdle) {
    chrome.tabs.query({}, function(tabs) {
      if (tabsChecker(tabs, domain)) {
        // Check if domain is off - if it is, the visit will have ended in an 'off' redirect so let's not call that a shutdown
        // FIXME: believe that domains are getting made 'off' before this function runs. This should be the place for turning off
        if (!settingsLocal.domains[domain].off) {
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
            // TODO: untested
            // var timeSinceLastNudged = endTime - statusObj[domain].lastNudged;
            // if (timeSinceLastNudged < 60000) {
            //   nudged = true;
            // }
          }
          eventLog(domain, "shutdown", { nudged });
        }
      }
    });
  }
  // Actual time adding stuff
  // Get addTime in seconds
  var addTime = moment(endTime).diff(startTime);
  // Open date
  var date = moment(endTime).format("YYYY-MM-DD");
  var dateObj = open(date);
  // Add to existing time in date object
  dataAdder(dateObj, domain, addTime, "time", addTogether);
  dataAdder(dateObj, allDomains, addTime, "time", addTogether);
  // See what allDomains is from beginning
  var allDomainsReal = moment(endTime).diff(statusObj.startOfDay);
  // allDomains time check
  if (allDomainsReal !== dateObj.$allDomains.time) {
    console.log(allDomainsReal);
    console.log(dateObj.$allDomains.time);
    console.log(domain, startTime, endTime, source);
  }
  dataAdder(dateObj, domain, 0, "runningCounter");
  close(date, dateObj);
  // Define previous and now, in
  var totalTime = dateObj[domain].time;
  var previousTime = totalTime - addTime;
  // Need to reset the runningCounter after updating time
  // Convert time to readable format
  var duration = logMinutes(addTime);
  var totalTimeToday = logMinutes(totalTime);
  eventLog(
    domain,
    "visit",
    {
      startTime: startTime.format("HH:mm:ss"),
      endTime: endTime.format("HH:mm:ss"),
      duration,
      totalTimeToday,
      source
    },
    date,
    moment().format("HH:mm:ss")
  );
  if ((source = "dateSplit_previousDay")) {
    for (var key in localStorage) {
      var dateCheck = new RegExp("[0-9]{4}-[0-9]{2}-[0-9]{2}");
      if (dateCheck.test(key) && key !== moment().format("YYYY-MM-DD")) {
        // Closes off any previous days and sends them to cloud storage
        if (false) {
          // Turn off data sharing until more thought has gone in
          // Adds snapshot of settings and status as it stands
          updateDayToServer(key);
          // TODO: Keeps what it needs from it, e.g. last 7 days history by domain (too much?)
        }
        localStorage.removeItem(key);
      }
    }
  }
}

// Runs within timeline adder if the new timeline event does not match the old one
function domainVisitUpdater(domain, time, source) {
  time = moment(time);
  var date = moment().format("YYYY-MM-DD");
  if (domain === notInChrome) {
    eventLog(
      notInChrome,
      "leftChrome",
      { source },
      date,
      time.format("HH:mm:ss")
    );
  }
  var dateObj = open(date);
  dataAdder(dateObj, domain, 1, "visits", addTogether);
  close(date, dateObj);
  var totalVisits = dateObj[domain].visits;
  var totalTime = dateObj[domain].time;
  // Set until which point back in time to look for a shutdown FIXME: shouldn't get a compulsive or a visit in certain situations...pointless
  var compulsiveSearch = time.clone().add(-settingsLocal.compulsive, "minutes");
  // Compulsive is true if there has ever been a shutdown, if the last shutdown was after the point back in time we're looking,
  // and if the last shutdown was after the last compulsive (important because if not, we could do a compulsive when one has already been done)
  var statusObj = open("status");
  if (!keyDefined(statusObj, domain)) {
    statusObj[domain] = {};
  }
  // Initialise domain statusObj keys if don't exist
  var domainStatusObj = statusObj[domain];
  // Assume no last compulsive
  var lastCompulsive = false;
  if (keyDefined(domainStatusObj, "lastCompulsive")) {
    // Unless there has been one
    lastCompulsive = moment(domainStatusObj.lastCompulsive);
  }
  // Assume no last shutdown
  var lastShutdown = false;
  if (keyDefined(domainStatusObj, "lastShutdown")) {
    // Unless there has been one
    lastShutdown = moment(domainStatusObj.lastShutdown);
  }
  // Find out if we should trigger a shutdown
  // console.log(lastShutdown);
  // if (lastShutdown) {
  //   console.log(lastShutdown.isAfter(compulsiveSearch));
  // }
  // console.log(compulsiveSearch);
  // console.log(lastCompulsive); // FIXME: STILL a fucking problem for fuck's sake
  // if (lastCompulsive) {
  //   console.log(lastCompulsive.isBefore(lastShutdown));
  // }
  var compulsive =
    // Has there ever been a shutdown? If no, don't evaluate true
    lastShutdown &&
    // If there has been, is it in
    lastShutdown.isAfter(compulsiveSearch) &&
    // Has there not been a compulsive?
    (!lastCompulsive ||
      // Is last compulsive before last shutdown? Avoiding repetition
      lastCompulsive.isBefore(lastShutdown));
  if (compulsive) {
    if (settingsLocal.compulsive) {
      // console.log("run switch off here");
      // switchOff(domain, url, tabId);
    }
    dataAdder(dateObj, domain, 1, "compulsives", addTogether);
    console.log("Sent compulsive nudge to", domain);
    dataAdder(statusObj, domain, moment(), "lastCompulsive");
    close("status", statusObj);
    nudgeSender(
      nudgeObject(domain, domainStatusObj.lastShutdown, "compulsive")
    );
  } else {
    // Only close status off
    close("status", statusObj);
  }
  eventLog(domain, "visitStart", { totalVisits, source });
}

// Runs every second and sends a time nudge if you hit a time nudge level
function domainTimeNudger() {
  var statusObj = open("status");
  var currentState = checkCurrentState();
  // Check if currentState is for a domain we care about
  var domain = currentState.domain;
  if (domain) {
    var nonDomain = domain === notInChrome || domain === chromeOrTabIdle;
    var date = moment().format("YYYY-MM-DD");
    var dateObj = open(date);
    // Increments running counter by 1 second, since this function runs every second
    dataAdder(dateObj, domain, 1, "runningCounter", addTogether);
    close(date, dateObj);
    // Brings out these items as variables in the function for easier manipulation
    var runningCounter = dateObj[domain].runningCounter;
    var time = Math.round(dateObj[domain].time / 1000); // Adjustment back to seconds
    // Set a temporary 0 value on time if undefined
    if (!notUndefined(time)) {
      time = 0;
    }
    // Sets a temporary total time value and evaluates it against our time nudge levels
    var totalTimeTemp = runningCounter + time;
    // Sends a Nudge if you hit a time that matters
    // Arrive early by X seconds
    var arriveEarly = 0;
    if (
      (totalTimeTemp + arriveEarly) % (settingsLocal.time * minSec) === 0 &&
      !nonDomain
    ) {
      console.log(
        `Sent time nudge to ${domain} with value ${logMinutes(totalTimeTemp)}`
      );
      nudgeSender(nudgeObject(domain, totalTimeTemp, "time"));
    }
    if (!nonDomain) {
      chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(
        tabs
      ) {
        if (typeof tabs[0] != "undefined") {
          chrome.browserAction.setBadgeBackgroundColor({
            color: "#6d6d6d",
            tabId: tabs[0].id
          });
          chrome.browserAction.setBadgeText({
            text: badgeTime(totalTimeTemp),
            tabId: tabs[0].id
          });
        }
      });
    }
    // Live updater for popup
    // chrome.runtime.sendMessage({
    //   type: "live_update",
    //   domain,
    //   before: time,
    //   runningCounter: runningCounter,
    //   total: totalTimeTemp,
    //   visits: dateObj[domain].visits
    // });
  }
}
