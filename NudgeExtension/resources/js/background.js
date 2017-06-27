// Copyright 2016, Nudge, All rights reserved.

// Init options
init = {
  domains_setting: ["mail.google.com", "messenger.com", "facebook.com", "twitter.com", "linkedin.com", "reddit.com", "diply.com", "buzzfeed.com", "youtube.com", "theladbible.com", "instagram.com", "pinterest.com", "theguardian.com", "bbc.com", "bbc.co.uk", "theguardian.co.uk", "dailymail.co.uk", "mailonline.com", "imgur.com", "amazon.co.uk", "amazon.com", "netflix.com", "tumblr.com", "thesportbible.com", "telegraph.co.uk"],
  scroll_s_setting: 20,
  scroll_b_setting: 3,
  visit_s_setting: 50,
  visit_b_setting: 3,
  time_s_setting: 20,
  time_b_setting: 3,
  compulsive_setting: 10,
  maxnudge_setting: 0,
};

chrome.commands.onCommand.addListener(function(command) {
  if (command == 'offshortcut') {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
      var domain = false;
      if (typeof tabs[0] != "undefined") {
        var tabUrl = tabs[0].url;
        domain = inDomainsSetting(tabUrl);
        if (domain) {
          offDomains[domain] = true;
          url = chrome.extension.getURL("nudgeoff.html") + '?' + 'domain=' + domain + "&" + 'url=' + tabUrl;
          chrome.tabs.update(tabs[0].id, { url: url }, function() {});
        }
      }
    });
  }
});

// Initialise current options
curr = {};

// Off stuff
var offDomains = {};

// Off by default
var offByDefault = true;

var domainsEver = init.domains_setting.slice();

// Populates current options with init or sync settings
function initOptions() {
  Object.keys(init).forEach(function(key, index) {
    if (index + 1 === Object.keys(init).length) {
      optionsUpdater(key, false, true);
    } else {
      optionsUpdater(key, false, false);
    }
  });
}

// Should be shared function
function chk() {
  chrome.storage.sync.get(null, function(items) {
    log('inside chk');
    log(items);
  });
}


function optionsUpdater(setting, update, defaults) {
  // Define default object
  var settingObj = {};
  settingObj[setting] = init[setting];
  // Run initial grab
  chrome.storage.sync.get(settingObj, function(items) {
    curr[setting] = items[setting];
    if (defaults) {
      setDefaults();
    }
    if (update) {
      if (setting === "compulsive_setting" || setting === "maxnudge_setting") {
        return;
      }
      if (setting === "domains_setting") {
        var domains = curr.domains_setting;
        switch (update.type) {
          case "domains_add":
            domains.push(update.domain);
            domainsEver.push(update.domain);
            break;
          case "domains_remove":
            var index = domains.indexOf(update.domain);
            if (index > -1) {
              domains.splice(index, 1);
            }
            break;
        }
        var domainsObj = {};
        domainsObj[setting] = domains;
        chrome.storage.sync.set(domainsObj);
        return;
      }
    } else {
      chrome.storage.sync.set(settingObj);
    }
  });
}

// TODO: in case someone changes settings (actually don't believe this is necessary)
// 1. have a thing in each domaindata to say last visit nudged etc.
// 2. check that you're definitely > last visit nudged etc.
// 3. make sure that you're at least X where X is the interval setting from last visit nudged
// 4. think that's it!

// Constants (for now)
var minSec = 60;
var sendFailLimit = 10;
var lastSuccessfulNudgeTime = 0; // could consider doing this on a domain by domain basis

var defaultDomainData = {
  last_shutdown: 0,
  last_compulsive: 0,
  totalTimeToday: 0,
  totalVisitsToday: 0,
  secondsIn: 0
};

// Need to figure out which variables really need to be reset daily
// Need to simulate day-switching to see what happens

chrome.identity.getAuthToken(null, function(identity) {
  console.log(identity);
});

// Set default settings TODO: need resolution to the domainsEver thing. basically: if domain gets dropped off, should still reset it. etc.
function setDefaults() {
  function getRandomToken() {
    // E.g. 8 * 32 = 256 bits token
    var randomPool = new Uint8Array(32);
    crypto.getRandomValues(randomPool);
    var hex = '';
    for (var i = 0; i < randomPool.length; ++i) {
      hex += randomPool[i].toString(16);
    }
    // E.g. db18458e2782b2b77e36769c569e263a53885a9944dd0a861e5064eac16f1a
    return hex;
  }


  // set id for each user
  chrome.storage.sync.get('userid', function(items) {
    console.log(items);
    var userId = items.userId;
    if (userId) {
      useToken(userId);
    } else {
      userId = getRandomToken();
      chrome.storage.sync.set({ userId: userId }, function() {
        useToken(userId);
      });
    }

    function useToken(userId) {
      var dataToBeSent = {
        'userId': userId,
        data: localStorage

      };

      $.post(config.apiEndpoint + 'user', dataToBeSent, function(data, status) {
        log(status);
      });
    }
  });

  chrome.storage.sync.get(null, function(items) {

    log('chrome storage');
    log(items);
  });

  // Send scroll settings out
  chrome.runtime.sendMessage({ type: "scroll_update" }); // TODO: replace with simpler scroll settings
  for (var i = 0; i < curr.domains_setting.length; i++) {
    if (typeof localStorage[curr.domains_setting[i]] === "undefined") {
      localStorage.setItem(curr.domains_setting[i], JSON.stringify(defaultDomainData));
    }
  }
  // Set events default
  if (!localStorage["events"]) {
    var events = [];
    localStorage.setItem("events", JSON.stringify(events));
  }
  // Set events default
  if (!localStorage["nudges"]) {
    var nudges = [];
    localStorage.setItem("nudges", JSON.stringify(nudges));
  }
  // Set nothings default
  if (!localStorage.nothings) {
    localStorage.nothings = 0;
  }
  // Set today's date
  if (!localStorage["date"]) {
    localStorage["date"] = new Date().toLocaleDateString();
  }
}

initOptions();

// Reset data daily
function checkDate(test) {
  if (test) {
    console.log(localStorage);
  }
  var todayStr = new Date().toLocaleDateString();
  var saved_day = localStorage["date"];
  if (saved_day !== todayStr || test) {
    // Reset today's data
    for (var i = 0; i < curr.domains_setting.length; i++) { // Would be better to filter in localStorage by object as that type
      var domain = curr.domains_setting[i];
      var domainData = JSON.parse(localStorage[domain]);
      domainData.totalTimeToday = 0;
      domainData.totalVisitsToday = 0;
      localStorage[domain] = JSON.stringify(domainData);
    }
    // Update date
    localStorage["date"] = todayStr;
  }
  if (test) {
    console.log(localStorage);
  }
}



// URL receiver from content script and init options giver
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.type === "off") {
      var domain = inDomainsSetting(sender.url);
      offDomains[domain] = true;
      console.log(offDomains);
      var url = chrome.extension.getURL("nudgeoff.html") + '?' + 'domain=' + domain + "&" + 'url=' + sender.url;
      if (domain) {
        chrome.tabs.update(sender.tab.id, { url: url }, function() {});
      }
    }
    if (request.type === "on") {
      var domain = request.domain;
      var url = request.url;
      offDomains[domain] = false;
      if (domain) {
        chrome.tabs.update(sender.tab.id, { url: url }, function() {});
      }
    }
    if (request.type === "scroll" || request.type === "visit" || request.type === "compulsive" || request.type === "time") {
      messageSender(request);
    }
    if (request.type === "player_init") {
      sendResponse({ domain: inDomainsSetting(request.url) });
    }
    if (request.type === "update") {
      optionsUpdater(request.setting, true, false);
      log(request);
    }
    if (request.type === "options") {
      chrome.runtime.openOptionsPage();
    }
    if (request.type === "domains_add") {
      optionsUpdater("domains_setting", request, false);
      log(request);
    }
    if (request.type === "domains_remove") {
      optionsUpdater("domains_setting", request, false);
      log(request);
    }
    if (request.type === "fun_name") {
      sendResponse({ name: randomGetter(funNames_init, funNames_current) });
    }
    if (request.type === "thing_to_do") {
      sendResponse({ name: randomGetter(thingsToDo_init, thingsToDo_current) });
    }
    if (request.type === "inject_switch") {
      chrome.tabs.executeScript(sender.tab.id, {file: "resources/js/switch.js"});
      chrome.tabs.executeScript(sender.tab.id, {file: "resources/js/player.js"});
      if (true) {
        chrome.tabs.executeScript(sender.tab.id, {file: "resources/js/debugger.js"});
      }
    }
    if (request.type === "inject_fbunfollow") {
      chrome.tabs.executeScript(sender.tab.id, {file: "resources/js/fbunfollow.js"});
    }
    if (request.type === "inject_tabidler") {
      chrome.tabs.executeScript(sender.tab.id, {file: "resources/js/tabidler.js"});
    }
    if (request.type === "tabIdle") {
      chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
        if (typeof tabs[0] != "undefined" && tabs[0].id === sender.tab.id) {
          var domain = inDomainsSetting(sender.url);
          onTabIdle(request.status, domain);
        }
      });
    }
  }
);


// Nudge logger function
function nudgeLogger(nudgeData) {
  nudges = JSON.parse(localStorage["nudges"]);
  nudges.push(nudgeData);
  if (nudges.length > 300) {
    nudges = nudges.slice(-200); // Make sure nudges isn't too big
  }
  log(nudgeData);
  localStorage["nudges"] = JSON.stringify(nudges);
}

// Collect tab info
var tabIdStorage = {};

// Initial storage of tab info
function flushToTabIdStorage() {
  chrome.tabs.query({}, function(tabs) {
    for (var i = 0; i < tabs.length; i++) {
      tabIdStorage[tabs[i].id] = {
        url: tabs[i].url,
        nudge: false
      };
    }
  });
}

flushToTabIdStorage();

// Helper function to check if any tabs match domain
function tabsChecker(tabs, domain) {
  // log(tabs);
  for (var i = 0; i < tabs.length; i++) {
    if (inDomainsSetting(tabs[i].url) === domain) {
      return false;
    }
  }
  return true;
}

// Fire when a tab is closed, and tell when there are no other tabs of that kind
chrome.tabs.onRemoved.addListener(function(tabId) {
  if (typeof tabIdStorage[tabId] === undefined) {
    return;
  } else {
    var tabRecord = tabIdStorage[tabId];
    var domain = inDomainsSetting(tabRecord.url);
    if (domain) {
      chrome.tabs.query({}, function(tabs) {
        if (tabsChecker(tabs, domain)) {
          domainData = JSON.parse(localStorage[domain]);
          domainData.last_shutdown = timeNow();
          console.log("Shutdown of " + domain);
          localStorage[domain] = JSON.stringify(domainData);
        }
      });
    }
    delete tabIdStorage[tabId];
  }
});

// Checks to see if the visit or time amount that's triggered a nudge should also trigger a modal
function modalChecker(amount, type) {
  if (type === "visit") {
    if (amount >= curr.visit_s_setting * curr.visit_b_setting) {
      return true;
    } else {
      return false;
    }
  }
  if (type === "time") {
    if (amount >= curr.time_s_setting * minSec * curr.time_b_setting) {
      return true;
    } else {
      return false;
    }
  }
  return false;
}

// Creates a timeline event (or object, same thing)
function timelineObject(domain) {
  return {
    time: timeNow(),
    domain: domain
  };
}

// Creates a nudge object easily
function nudgeObject(domain, amount, type, status) {
  if (!status) {
    status = "pending";
  }
  return {
    "time_loaded": timeNow(),
    "type": type,
    "domain": domain,
    "status": status,
    "amount": amount,
    "send_fails": 0,
    "modal": modalChecker(amount, type)
  };
}

// Set the initial currentState
var currentState = new timelineObject(false);

function onTabIdle(status, domain) {
  if (status) {
    timelineAdder(false, "Gone tabIdle");
    isIdle = true;
  } else {
    isIdle = false;
    timelineAdder(domain, "Back from tabIdle");
  }
}

// Lots of places will do a timelineAdder and they all come together, with extra jobs (see in function) depending on what
// TODO: but is every single possible event covered in timelineAdder? And does it matter?
// FIXME: should only be able to add an event if it's in a tab that is the active tab in the active window! right? am i wrong?
// FIXME: have (for logger) concept of the Timeline Objects That Matter
function timelineAdder(domain, source) {
  // If Chrome or tab is idle, don't do anything!
  if (isIdle) {
    return;
  }
  // Some debugging stuff
  var logDomain = domain;
  if (!domain) {
    logDomain = "*nO dOmAiN*";
  }
  console.log(epochToDate(timeNow()), logDomain, source);
  // If your timeline event has same domain as before, you do nothing
  if (currentState.domain === domain) {
    return;
  // If your timeline even has different domain as before...
  } else {
    // First, create new variable lastState, which is what we had before the changes we're about to make
    var lastState = currentState;
    // If the new timeline event we want to add has a domain we care about (this means previous domain was false or different)
    if (domain) {
      // Check if we are even inWindow, in other words is a Chrome window focused. If not, we don't care and we return (below)
      if (inWindow) {
        // Set the new currentState if previous domain was false or different. So the new currentState has a different (positive) domain, and associated time stamp
        currentState = timelineObject(domain);
        // Run a visit update (which also checks for compulsive), give the new time stamp of this event that just happened
        domainVisitUpdater(domain, currentState.time);
        // If the previous timeline event was a domain we care about, we need to do its time adding. startTime is lastState.time, endTime is currentState.time
        if (lastState.domain) {
          // TODO: this is also the point that you'll want to close off a visit
          domainTimeUpdater(lastState.domain, lastState.time, currentState.time);
        }
      }
      return;
    } else {
      // The domain of current timeline event is NOT one we care about, but the previous one was (because we passed through currentState.domain === domain)
      // So we still need to put it into currentState, and sum up the time for that previous domain if it was one we care about
      // First we set the new currentState
      currentState = timelineObject(domain);
      // Then - this is a weird double check here since we already had currentState.domain === domain above - we do the time updating for the domain in the previous state
      if (lastState.domain) {
        domainTimeUpdater(lastState.domain, lastState.time, currentState.time);
      }
    }
  }
}

function domainTimeUpdater(domain, startTime, endTime) {
  var domainData = JSON.parse(localStorage[domain]);
  // Temporary variable previousTimeToday mainly used for debugging
  var previousTimeToday = domainData.totalTimeToday;
  // Adds time onto totalTimeToday
  domainData.totalTimeToday += (endTime - startTime);
  // Clears the secondsIn since you are closing off the time from a previous visit and starting a fresh new one
  domainData.secondsIn = 0;
  localStorage[domain] = JSON.stringify(domainData);
  debugMessage = epochToDate(timeNow()) + ' ' + logMinutes((endTime - startTime)/1000) + ' added to ' + domain + ', started ' + epochToDate(startTime) + ', ended ' + epochToDate(endTime) + '. Total today was ' + logMinutes(previousTimeToday/1000) + ', now ' + logMinutes(domainData.totalTimeToday/1000) + '.';
  console.log(debugMessage);
}

// Runs within timeline adder if the new timeline event does not match the old one
function domainVisitUpdater(domain, time) {
  var domainData = JSON.parse(localStorage[domain]);
  // Add a new visit
  domainData.totalVisitsToday++;
  // Debugging stuff
  var debugMessage = epochToDate(timeNow()) + ' ' + ordinal(domainData.totalVisitsToday) + ' ' + domain + ' visit, ' + logMinutes(domainData.totalTimeToday/1000) + ' so far today.';
  console.log(debugMessage);
  // Set until which point back in time to look for a shutdown FIXME: shouldn't get a compulsive or a visit in certain situations...pointless
  var compulsiveSearch = (time - curr.compulsive_setting * minSec * 1000);
  // Compulsive is true if there has ever been a shutdown, if the last shutdown was after the point back in time we're looking,
  // and if the last shutdown was after the last compulsive (important because if not, we could do a compulsive when one has already been done)
  var compulsive = (domainData.last_shutdown !== 0 && domainData.last_shutdown > compulsiveSearch && domainData.last_compulsive < domainData.last_shutdown);
  // Visits is true if the total visits today matches our visits level
  var visits = (domainData.totalVisitsToday % curr.visit_s_setting === 0);
  // We set visitsStatus as pending, assuming that we will do the visits nudge
  var visitsStatus = "pending";
  // But if compulsive is true, we will actually prefail the visits nudge and run our compulsive instead. Sorry, visits nudge
  if (compulsive) {
    domainData.last_compulsive = time;
    visitsStatus = "prefailed";
    messageSender(nudgeObject(domain, (Math.round((timeNow() - domainData.last_shutdown) / 1000)), "compulsive"));
  }
  // Here is where we do actually send the visits nudge. Woo! It sends prefailed if we just prioritised a compulsive over it
  if (visits) {
    // messageSender(nudgeObject(domain, domainData.totalVisitsToday, "visit", visitsStatus)); // TURNED OFF VISITS NUDGES
  }
  // Obligatory storage of data
  localStorage[domain] = JSON.stringify(domainData);
}

// Set initial inWindow and idle values as false
var inWindow = false;
var isIdle = false;

// Runs every second and sends a time nudge if you hit a time nudge level
function domainTimeNudger() {
  // Check if the last timeline object (currentState) is for a domain we care about
  if (currentState.domain) {
    var domainData = JSON.parse(localStorage[currentState.domain]);
    domainData.secondsIn++;
    // Sets a temporary total time value and evaluates it against our time nudge levels
    var totalTimeTodayTemp = domainData.secondsIn + Math.round(domainData.totalTimeToday / 1000);
    if (totalTimeTodayTemp % (curr.time_s_setting * minSec) === 0) {
      messageSender(nudgeObject(currentState.domain, totalTimeTodayTemp, "time"));
    }
    // Sends that second by second data to the debug updater, a UI element that helps me figure out where problems are
    if (config.debug) {
      chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
        if (typeof tabs[0] != "undefined") {
          chrome.tabs.sendMessage(tabs[0].id, { type: "debug_updater", domain: currentState.domain, before: domainData.totalTimeToday, secondsIn: domainData.secondsIn,  total: totalTimeTodayTemp, visits: domainData.totalVisitsToday}, function(response) {
          });
        }
      });
    }
    // Updates domainData with the secondsIn every second
    localStorage[currentState.domain] = JSON.stringify(domainData);
  }
}

// Do the sum FIXME FIXME FIXME of whether everything from the day adds to 24 hrs
// Should be able to create a fair visualisation of every block of time. //not in chrome etc.
function windowChecker() {
  // Make sure 'today' is up-to-date
  if (curr.domains_setting) {
    checkDate(false);
  }
  // Run the counter on the current site
  domainTimeNudger();
  // Have to factor in when you are scrolling on window despite window not being selected...............ask content script
  chrome.windows.getAll(null, function(windows) {
    if(windows.length === 0) {
      return;
    } else {
      chrome.windows.getLastFocused(function(window) {
        if (typeof window == 'undefined' || window.focused === false) {
          if (inWindow) {
            inWindow = false;
            timelineAdder(false, "Left window [§] ->");
          }
          return;
        }
        // if the tab is one that's loaded with a delayed nudge, run that delayed nudge.
        // in this space here
        // if you check the tab register and the tab ID has a nudge waiting to go out.
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
          if (typeof tabs == 'undefined') {
            return;
          }
          var nudge = false;
          if (tabIdStorage && tabIdStorage[tabs[0].id] && tabIdStorage[tabs[0].id].nudge) {
            nudge = tabIdStorage[tabs[0].id].nudge;
          }
          if (nudge) {
            messageSender(nudge);
            tabIdStorage[tabs[0].id].nudge = false;
          }
          if (!inWindow) {
            inWindow = true;
            var domain = false;
            if (typeof tabs[0] != 'undefined') {
              domain = inDomainsSetting(tabs[0].url);
            }
            timelineAdder(domain, "Back in window [§] <-");
          }
        });
        return;
      });
    }
  });
}

// Add to timeline on window in and window out
setInterval(windowChecker, 1000);

// Add to timeline onStateChanged
chrome.idle.onStateChanged.addListener(function(newState) {
  if (newState !== "active") {
    isWindow = false;
    timelineAdder(false, "Gone idle zZZzZzZZ");
    isIdle = true;
  }
  if (newState === "active") {
    isWindow = true;
    chrome.windows.getLastFocused(function(window) {
      if (typeof window == 'undefined' || window.focused === false) {
        isIdle = false;
        timelineAdder(false, "Back from idle, undefined window");
      } else {
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
          var domain = inDomainsSetting(tabs[0].url);
          isIdle = false;
          timelineAdder(domain, "Back from idle, defined window");
        });
      }
    });
  }
});

// Add to timeline onActivated
chrome.tabs.onActivated.addListener(function(activatedTab) {
  chrome.tabs.get(activatedTab.tabId, function(tabDetails) {
    // Don't need check of whether tab is active, because it is by default
    var domain = inDomainsSetting(tabDetails.url);
    timelineAdder(domain, "onActivated");
  });
});

// Add to timeline window onFocusedChange
chrome.windows.onFocusChanged.addListener(function(windowId) {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
    var domain = false;
    if (typeof tabs[0] != 'undefined') {
      domain = inDomainsSetting(tabs[0].url);
    }
    timelineAdder(domain, "Window changed");
  });
});

// Add to tabIdStorage onCreated
chrome.tabs.onCreated.addListener(function(tab) {
  // New record in tabIdStorage
  tabIdStorage[tab.id] = {
    url: tab.url,
    nudge: false,
  };
});

// Add to timeline onUpdated
// Update URL in tabIdStorage
// URL constantiser
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  var domain = inDomainsSetting(tab.url);
  if (domain in offDomains && offDomains[domain] && domain) {
    var url = chrome.extension.getURL("nudgeoff.html") + '?' + 'domain=' + domain + "&" + 'url=' + tab.url;
    chrome.tabs.update(tabId, { url: url }, function() {});
  }
  // Update record in tabIdStorage
  if (typeof tabIdStorage[tabId] === "undefined") {
    tabIdStorage[tabId] = {
      url: tab.url,
      nudge: false,
    };
  } else {
    tabIdStorage[tabId].url = tab.url;
  }
  if (tab.active === true) {
    chrome.windows.get(tab.windowId, function(Window) {
      if (Window.focused) {
        timelineAdder(domain, "onUpdated, with tab active & window focused");
      }
    });
  }
  // For constantising titles
  /*
  if (domain && changeInfo.title) {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
        if (typeof tabs[0] !== undefined) {
          chrome.tabs.sendMessage(tabs[0].id, {
            "type": "title",
            "title": changeInfo.title,
            "domain": domain
          }, function(response) {
            }
          );
        }
      }
    );
  }
  */
  // For sending favicon URL
  if (domain && typeof changeInfo.favIconUrl !== "undefined" && changeInfo.favIconUrl !== "") {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
      if (typeof tabs[0] !== undefined) {
        chrome.tabs.sendMessage(tabId, {
          "type": "favicon",
          "favicon": tab.favIconUrl,
          "domain": domain
        }, function(response) {});
      }
    });
  }
});

// Send message to player.js
function messageSender(object) {
  if (object.status === "prefailed" || object.status === "timeout") {
    object.time_executed = timeNow();
  } else if (tooSoonChecker()) {
    object.time_executed = timeNow();
    object.status = "too_soon";
  } else {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
      // Send message to the tab here
      if (tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "ready_check" }, function(response) {
          if (response && response.type) {
            chrome.tabs.sendMessage(tabs[0].id, object, function(response) {
              if (response) {
                object.time_executed = response.time_executed;
                object.status = response.status;
                object.tabId = tabs[0].id;
                lastSuccessfulNudgeTime = response.time_executed; // TODO: this stuff is all too heavy. The handler below should cover it
                nudgeLogger(object);
              } else if (object.send_fails < sendFailLimit) {
                object.send_fails++;
                messageSender(object);
              } else {
                object.status = "failed";
                nudgeLogger(object);
              }
            });
          } else {
            // If tab record is undefined, create it
            tabIdStorage[tabs[0].id].nudge = object;
            object.send_fails++;
            // so...... load the tab ID with the nudge to come (the whole object!)
            // then the every-seconder asks the current selected tab if there is a nudge waiting, in which case it messageSends
          }
        });
      }
    });
  }
}

// Is it too soon to nudge?
function tooSoonChecker() {
  nudges = JSON.parse(localStorage["nudges"]);
  if (nudges.length === 0) {
    return false;
  }
  if (lastSuccessfulNudgeTime > (timeNow() - curr.maxnudge_setting)) {
    return true;
  } else {
    return false;
  }
}

// Let's have some fun with some FUN NAMES
var funNames_init = [
  "Barack Obama",
  "Kim Kardashian",
  "Kanye West",
  "Justin Bieber",
  "Mark Zuckerberg",
  "George Clooney",
  "Amal Clooney",
  "Brad Pitt",
  "Angelina Jolie",
  "Leonardo DiCaprio",
  "Chris Pratt",
  "Amy Schumer",
  "Adele",
  "Vladimir Putin",
  "Lindsay Lohan",
  "Sandra Bullock",
  "Taylor Swift",
  "Beyonc&eacute;",
  "Jay Z",
  "Harrison Ford",
  "Tim Cook",
  "Peter Thiel",
  "J.K. Rowling",
];

var funNames_current = funNames_init.slice();

// Things to do
var thingsToDo_init = [
  "plan dinner with friends",
  "go for a walk outside",
  "plan your next holiday",
  "read about your favourite hobby",
  "call your best friend",
  "write a diary",
  "go to the park",
  "buy some tickets to a show",
  "figure out the thing that'll make you happiest",
  "spend time thinking about people you love",
  "take up a new hobby",
  "plan a trip to the movies",
  "find a good book to read",
  "call someone you haven't spoken to in a while",
  "find a different job (if you hate your job)",
  "get involved in your community",
  "take a dance class",
  "take a class to learn something new",
  "make a plan to watch the sunset",
  "have a spontaneous drink with someone tonight",
  "go to the gym (if you like the gym) or go buy some chocolate (if you don't)",
  "go for a swim",
  "try out meditation", // should have link attached. this could be done for lots of them
  // "save yourself tons of hours and unfollow all your friends on Facebook",
  // "delete Instagram from your phone",
  // "delete Facebook from your phone",
  // "more real Nudge tips here"
];

var thingsToDo_current = thingsToDo_init.slice();

// Helper that simplifies domainChecker for use here
function inDomainsSetting(url) {
  return (domainChecker(url, curr.domains_setting));
}