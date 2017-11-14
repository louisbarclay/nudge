// Copyright 2016, Nudge, All rights reserved.

// Non-domains
var notInChrome = "$notInChrome";
var chromeOrTabIdle = "$chromeOrTabIdle";
var inChromeFalseDomain = "$inChromeFalseDomain";
var allDomains = "$allDomains";

// Check whether new version is installed
chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason == "install") {
    eventLog("install", "install"); // seems weird
  } else if (details.reason == "update") {
    var thisVersion = chrome.runtime.getManifest().version;
    eventLog(details.reason, details.reason, {
      previousVersion: details.previousVersion,
      thisVersion
    });
  }
});

eventLog("background.js loaded", "startup");

var settingsLocal = {};

// This goes into settings (sync, local)
var defaultDomainInfo = {
  nudge: true,
  off: true
};

// // This gets added to localStorage and sent to server
// history: [], // TODAY: shutdowns. nudgeShutdowns. time: 0, visits: 0,
// // visits (array. time started. time (length). number, in the day that is)
// last_shutdown: 0,
// last_compulsive: 0,
// last_nudge: 0,
// secondsIn: 0
// "outOfWindow", // don't put here? create for first time when running domain stuff?
// "idle", // don't put here? create for first time when running domain stuff?
// 'notDomain' + random hash? eventually?

var defaultDomains = [
  "messenger.com",
  "facebook.com",
  "twitter.com",
  "linkedin.com",
  "reddit.com",
  "diply.com",
  "buzzfeed.com",
  "youtube.com",
  "theladbible.com",
  "ladbible.com",
  "news.ycombinator.com",
  "instagram.com",
  "pinterest.com",
  "theguardian.com",
  "bbc.com",
  "bbc.co.uk",
  "tinder.com",
  "theguardian.co.uk",
  "dailymail.co.uk",
  "iwastesomuchtime.com",
  "mailonline.com",
  "imgur.com",
  "amazon.co.uk",
  "amazon.com",
  "netflix.com",
  "tumblr.com",
  "thesportbible.com",
  "telegraph.co.uk"
];

var defaultSettings = {
  scroll_s_setting: 5,
  scroll_b_setting: 3,
  time_s_setting: 3,
  time_b_setting: 5,
  compulsive_setting: 10,
  show_fb_unfollow: true,
  show_fb_ad: true,
  show_off_switch: true,
  reshow_time: false
};

// Init options
function initSettings() {
  // Add static stuff
  var settings = defaultSettings;
  // Add dynamic stuff
  settings.userId = getUserId();
  settings.domains = defaultDomainPopulate(defaultDomains);
  return settings;
}

function eventLogReceiver(request) {
  eventLog(
    request.domain,
    request.eventType,
    request.detailsObj,
    request.date,
    request.time
  );
}

function consoleLogger(domain, eventType, detailsObj, date, time) {
  var enabled = true;
  function logWithColor(message, color) {
    if (enabled) {
      message = `%c${message}`;
      color = `color:${color};`;
      console.log(message, color);
    }
  }
  switch (eventType) {
    case "visit":
      logWithColor(
        `${detailsObj.startTime} ${detailsObj.endTime} ${domain} ${detailsObj.duration} (${detailsObj.totalTimeToday} today)`,
        "green"
      );
      break;
    case "shutdown":
      logWithColor(`${time} ${domain} shutdown`, "red");
      break;
    case "startup":
      logWithColor(`${time} startup`, "blue");
      break;
    case "install":
      logWithColor(`${time} install`, "orange");
      break;
    case "update":
      logWithColor(
        `${time} update ${detailsObj.previousVersion} ${detailsObj.thisVersion}`,
        "yellow"
      );
      break;
    default:
  }
}

function eventLog(domain, eventType, detailsObj, date, time) {
  // Define event
  var event = {
    domain,
    eventType
  };
  if (detailsObj) {
    Object.keys(detailsObj).forEach(function(key) {
      event[key] = detailsObj[key];
    });
  }
  // Define date and time
  if (!date && !time) {
    date = todayDate();
    time = timeNow();
  }
  time = epochToDate(time);
  consoleLogger(domain, eventType, detailsObj, date, time);
  // should match up perfectly
  var dateObj = open(date);
  dateObj = dataAdder(dateObj, "events", event, time);
  close(date, dateObj);
}

function localStorageCheckSize() {}

function localStorageOpenItem(key) {
  localStorageCheckSize();
  // Check size of localStorage and send to server - everything but today - (clear from localStorage) if getting too large. at some sensible limit
  return JSON.parse(localStorage[key]);
}

function localStorageClear() {
  localStorage.clear();
}

function defaultDomainPopulate(domainsArray) {
  var object = {};
  for (var i = 0; i < domainsArray.length; i++) {
    object[domainsArray[i]] = defaultDomainInfo;
  }
  return object;
}

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
          settings: initSettings(),
          journey: { hasSeenTour: false }
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

function storagePushToArray(item, dataToPush) {
  chrome.storage.sync.get(item, function(item) {
    if (isEmpty(item)) {
    } else {
      item.push(dataToPush);
      storageSet(item);
    }
  });
}

// receptors on each of the js files. they say 'these are options i care about'. and they say 'this is my domain. if you change it, i need to know'
// for control

// TODO: if you hit switch off: also switch off all other instances of that domain?

// init:
// check if there is a username in sync settings (user: )
// if not, clear all settings; then set defaults. one time operation here. apologise?
// if yes, update with values from sync

// set defaults:
// grab all domains. forEach domain sync.storage object (name is that domain). isOff, isNudged, etc. properties.

// change option
// always receive from somewhere
// tell chrome.sync to change
// send message out to everywhere saying it's changed
//

// chrome.runtime.onInstalled.addListener(function callback);
//if (details.reason == "install") {
// } else if (details.reason == "update") {
//       //analyticsMainEventReport("General", "update", thisVersion);
//   }

// chrome.runtime.setUninstallURL("http://userstyles.org/uninstall/chrome"); // TODO FIXME WHATEVER

// option to set all domains to off in one go
// make the switch back on thing harder?

// STUFF TO PASS INFO ON:
// number of facebook friends - each day. no. of friends and friends followed. or something.
// that stuff you know.
// you'll be able to see for existing users whether they 'probably' used the unfollow everything feature.
// you'll be able to see people's daily interactions with the app (if they even have it switched on)
// worth getting the info on how many friends people are currently following.

function sendOutSettingsLocal() {
  // chrome runtime sendmessage. to standard receiver everywhere. receiver is the one that only takes the info it cares about.
  // is that clumsy, because it takes the whole object? maybe but it's fine, can improve later
  // Send settings out
  chrome.runtime.sendMessage({
    type: "settings",
    settings: settingsLocal
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

// Need to simulate day-switching to see what happens

initialise();

// just find the domain. is there the current date there? new Date().toLocaleDateString(); if not, set it, add first value. if yes
// grab it, add onto it, set it again. straight in the stuff though eh.

// URL receiver from content script and init options giver
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === "event") {
    console.log(request);
    eventLogReceiver(request);
  }
  if (request.type === "off") {
    var domain = inDomainsSetting(sender.url);
    if (domain) {
      changeSetting("domains", domain, "off", true);
      switchOff(domain, sender.url, sender.tabId);
    }
  }
  if (request.type === "on") {
    var domain = request.domain;
    if (domain) {
      var url = request.url;
      console.log(url);
      changeSetting("domains", domain, "off", false);
      switchOn(domain, request.url, sender.tabId);
    }
  }
  if (
    request.type === "scroll" ||
    request.type === "visit" ||
    request.type === "compulsive" ||
    request.type === "time"
  ) {
    messageSender(request);
  }
  if (request.type === "player_init") {
    sendResponse({ domain: inDomainsSetting(request.url) });
  }
  if (request.type === "options") {
    chrome.runtime.openOptionsPage();
  }
  if (request.type === "domains_add") {
    changeSetting(true, "domains", request.domain, "add");
    log(request);
  }
  if (request.type === "domains_remove") {
    changeSetting(false, "domains", request.domain, "nudge");
    log(request);
  }
  if (request.type === "fun_name") {
    sendResponse({ name: randomGetter(funNames_init, funNames_current) });
  }
  var chromeTab = sender.tab.url.includes("chrome-extension:");
  if (request.type === "inject_switch" && !chromeTab) {
    chrome.tabs.executeScript(sender.tab.id, {
      file: "resources/js/switch.js"
    });
    chrome.tabs.executeScript(sender.tab.id, {
      file: "resources/js/player.js"
    });
    if (true) {
      chrome.tabs.executeScript(sender.tab.id, {
        file: "resources/js/debugger.js"
      });
    }
  }
  if (request.type === "inject_fbunfollow" && !chromeTab) {
    chrome.tabs.executeScript(sender.tab.id, {
      file: "resources/js/fbunfollow.js"
    });
  }
  if (request.type === "inject_fbhide" && !chromeTab) {
    chrome.tabs.insertCSS(sender.tab.id, {
      file: "resources/css/fbtweaks.css",
      runAt: "document_start"
    });
  }
  if (request.type === "inject_tabidler" && !chromeTab) {
    chrome.tabs.executeScript(sender.tab.id, {
      file: "resources/js/tabidler.js"
    });
  }
  if (request.type === "tabIdle") {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(
      tabs
    ) {
      if (typeof tabs[0] != "undefined" && tabs[0].id === sender.tab.id) {
        var domain = inDomainsSetting(sender.url);
        onTabIdle(request.status, domain);
      }
    });
  }
});

function open(key) {
  checkExistsInLocalStorage(key);
  return localStorageOpenItem(key);
}

function close(key, data) {
  data = JSON.stringify(data);
  localStorage.setItem(key, data);
}

function checkExistsInLocalStorage(key) {
  if (keyDefined(localStorage, key)) {
  } else {
    close(key, {});
  }
}

// Helper to add key if doesn't exist
function dataAdder(object, key, changeData, subKey, changeFunction) {
  if (subKey) {
    if (keyDefined(object, key)) {
      if (changeFunction) {
        object[key][subKey] = changeFunction(object[key][subKey], changeData);
      } else {
        object[key][subKey] = changeData;
      }
    } else {
      object[key] = {};
      object[key][subKey] = changeData;
    }
    return object;
  } else {
    if (changeFunction) {
      object[key] = changeFunction(object[key], changeData);
    } else {
      object[key] = changeData;
    }
    return object;
  }
}

// Nudge logger function
function nudgeLogger(nudgeObject) {
  var date = todayDate();
  var time = timeNow();
  var statusObj = open("status");
  var dateObj = open(date);
  dateObj = dataAdder(dateObj, "nudges", nudgeObject, time);
  statusObj = dataAdder(statusObj, nudgeObject.domain, time);
  close("status", statusObj);
  close(date, dateObj);
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

// Tab closed, and tell about shutdown
chrome.tabs.onRemoved.addListener(function(tabId) {
  if (typeof tabIdStorage[tabId] === undefined) {
    return;
  } else {
    var tabRecord = tabIdStorage[tabId];
    var domain = inDomainsSetting(tabRecord.url);
    if (domain) {
      chrome.tabs.query({}, function(tabs) {
        if (tabsChecker(tabs, domain)) {
          var statusObj = open("status");
          var time = timeNow();
          statusObj = dataAdder(statusObj, domain, time, "lastShutdown");
          var nudged = false;
          if (
            keyDefined(statusObj, domain) &&
            keyDefined(statusObj[domain], "lastNudged")
          ) {
            // untested
            var timeSinceLastNudged = time - statusObj[domain];
            if (timeSinceLastNudged < 60000) {
              nudged = true;
            }
          }
          eventLog(domain, "shutdown", { nudged });
          close("status", statusObj);
        }
      });
    }
    delete tabIdStorage[tabId];
  }
});

// Checks to see if the visit or time amount that's triggered a nudge should also trigger a modal
function modalChecker(amount, type) {
  if (type === "time") {
    if (
      amount >=
      settingsLocal.time_s_setting * minSec * settingsLocal.time_b_setting
    ) {
      return true;
    } else {
      return false;
    }
  }
  return false;
}

// Creates a timeline event (or object, same thing)
function timelineObject(domain, source) {
  return {
    time: timeNow(),
    domain: domain,
    source: source
  };
}

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
    modal: modalChecker(amount, type)
  };
}

// Set the initial currentState
var currentState = new timelineObject(false, "initial");

function onTabIdle(status, domain) {
  if (status) {
    timeline(chromeOrTabIdle, "onTabIdle");
  } else {
    timeline(domain, "onTabIdle");
  }
}

// initial timelineadder

// Lots of places will do a timelineAdder and they all come together, with extra jobs (see in function) depending on what
// change so that you ask what domain is. if false you do a domainvisitupdater for a $inChromeFalseDomain
// if true you ask if $notInChrome or $idle
// you have all the info here that you need. you even have source

// but those operate as safeguards

function timeline(domain, source) {
  console.log(domain, source);
  // check date stuff goes here!!!!!
  // If your timeline event has same domain as before, you do nothing
  if (currentState.domain === domain) {
    return;
    // If your timeline event has different domain to before... UNLESS YOU ARE ON A DIFFERENT DAY! does this mean needing to keep currentState in memory?
  } else {
    // First, create new variable lastState, which is what we had before the changes we're about to make
    var lastState = currentState;
    currentState = timelineObject(domain, source);
    // Update visit
    domainVisitUpdater(domain, currentState.time);
    // Update time (close off visit)
    domainTimeUpdater(lastState.domain, lastState.time, currentState.time);
    return;
  }
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

// timelineAdder test
function timelineAdderTest() {
  function runAfter(initial, callback) {
    initial();
    setTimeout(callback, 1000);
  }
}

function notUndefined(x) {
  if (typeof x === "undefined") {
    return false;
  } else {
    return true;
  }
}

// When Chrome window closed
chrome.windows.onRemoved.addListener(function(windowId) {
  chrome.windows.getAll(null, function(windows) {
    if (windows.length === 0) {
      timeline(notInChrome, "chrome.windows.onRemoved");
    }
  });
});

function everySecond() {
  // Run the counter on the current domain
  domainTimeNudger();
  // Don't do anything else if currently idle
  if (currentState.domain === chromeOrTabIdle) {
    return;
  }
  // Don't do anything if no windows exist
  chrome.windows.getAll(null, function(windows) {
    if (windows.length === 0) {
      if (currentState.domain !== notInChrome) {
        timeline(notInChrome, "everySecond");
        return;
      }
    } else {
      // Find out if there are any windows active, and if so grab the active tab
      chrome.windows.getLastFocused({ populate: true }, function(window) {
        // If no windows are focused, check if notInChrome, and if not, add notInChrome to timeline
        if (!window.focused) {
          if (currentState.domain !== notInChrome) {
            timeline(notInChrome, "everySecond");
            return;
          }
        } else {
          // If a window is focused, find the active tab
          var foundActiveTab = false;
          for (var i = 0; i < window.tabs.length; i++) {
            // Once found active tab, check if currentState is notInChrome, and if it is, add domain to timeline
            if (window.tabs[i].active) {
              foundActiveTab = true;
              if (currentState.domain === notInChrome) {
                var domain = false;
                domain = inDomainsSetting(window.tabs[i].url);
                timeline(domain, "everySecond");
              }
              // Check if there is a nudge waiting to go out on the active tab
              if (tabIdStorage[window.tabs[i].id].nudge) {
                if (
                  nudge.type === "compulsive" &&
                  currentState.source !== "tabs.onActivated" // fuck need to check this.
                ) {
                  messageSender(nudge);
                  console.log("stopped broken nudge"); // ask the question - did facebook already exist? or something like that
                } else {
                  messageSender(nudge);
                }
                tabIdStorage[tabs[0].id].nudge = false;
              }
            }
          }
          if (!foundActiveTab) {
            console.log("Did not find an active tab");
          }
        }
      });
    }
  });
}

// Add to timeline on window in and window out
setInterval(everySecond, 1000);

// Add to timeline onStateChanged
chrome.idle.onStateChanged.addListener(function(newState) {
  // if (newState !== "active") { // switching this part off because onTabIdle can handle it on its own
  //   timelineAdder(false, "Gone idle zZZzZzZZ");
  // }
  if (newState === "active") {
    chrome.windows.getLastFocused(function(window) {
      if (typeof window == "undefined" || window.focused === false) {
        timeline(false, "idle.onStateChanged");
      } else {
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(
          tabs
        ) {
          var domain = inDomainsSetting(tabs[0].url);
          timeline(domain, "idle.onStateChanged");
        });
      }
    });
  }
});

// Add to timeline onActivated
chrome.tabs.onActivated.addListener(function(activatedTab) {
  if (typeof activatedTab == "undefined") {
    return;
  }
  chrome.tabs.get(activatedTab.tabId, function(tabDetails) {
    // Don't need check of whether tab is active, because it is by default
    var domain = inDomainsSetting(tabDetails.url);
    timeline(domain, "tabs.onActivated");
  });
});

// Add to timeline window onFocusedChange
chrome.windows.onFocusChanged.addListener(function(windowId) {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
    var domain = false;
    if (typeof tabs[0] != "undefined") {
      domain = inDomainsSetting(tabs[0].url);
      timeline(domain, "windows.onFocusedChanged");
    }
  });
});

// Add to tabIdStorage onCreated
chrome.tabs.onCreated.addListener(function(tab) {
  // New record in tabIdStorage
  tabIdStorage[tab.id] = {
    url: tab.url,
    nudge: false
  };
});

function switchOff(domain, url, tabId) {
  url =
    chrome.extension.getURL("nudgeoff.html") +
    "?" +
    "domain=" +
    domain +
    "&" +
    "url=" +
    encodeURIComponent(url);
  var nudged = false;
  // if ( domain last nudged was within 1 minute,,, ,, , , , )
  eventLog(domain, "off", { nudged, url });
  settingsLocal.domains[domain].off = true;
  chrome.tabs.update(tabId, { url }, function() {});
}

function switchOn(domain, url, tabId) {
  settingsLocal.domains[domain].off = false;
  url = decodeURIComponent(url);
  // missing any part about changing the settings
  chrome.tabs.update(tabId, { url }, function() {});
}

// Add to timeline onUpdated
// Update URL in tabIdStorage
// URL constantiser
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  var domain = inDomainsSetting(tab.url);
  if (domain in settingsLocal.domains && settingsLocal.domains[domain]["off"]) {
    switchOff(domain, tab.url, tabId);
  }
  // Update record in tabIdStorage
  if (typeof tabIdStorage[tabId] === "undefined") {
    tabIdStorage[tabId] = {
      url: tab.url,
      nudge: false
    };
  } else {
    tabIdStorage[tabId].url = tab.url;
  }
  if (tab.active === true) {
    chrome.windows.get(tab.windowId, function(Window) {
      if (Window.focused) {
        timeline(domain, "tabs.onUpdated");
      }
    });
  }
  // For constantising titles
  if (domain && changeInfo.title) {
    chrome.tabs.sendMessage(
      tabId,
      {
        type: "title",
        title: changeInfo.title,
        domain: domain
      },
      function(response) {}
    );
  }
  // For sending favicon URL
  if (
    domain &&
    typeof changeInfo.favIconUrl !== "undefined" &&
    changeInfo.favIconUrl !== ""
  ) {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(
      tabs
    ) {
      if (typeof tabs[0] !== undefined) {
        chrome.tabs.sendMessage(
          tabId,
          {
            type: "favicon",
            favicon: tab.favIconUrl,
            domain: domain
          },
          function(response) {}
        );
      }
    });
  }
});

// Send message to player.js
function messageSender(object) {
  if (
    currentState.domain === notInChrome ||
    currentState.domain === chromeOrTabIdle ||
    currentState.domain === inChromeFalseDomain
  ) {
    console.log("never sent");
    return;
  } else {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(
      tabs
    ) {
      // Send message to the tab here
      if (tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "ready_check" }, function(
          response
        ) {
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

// Let's have some fun with some FUN NAMES
var funNames_init = ["Barack Obama"];

var funNames_current = funNames_init.slice();

// Check if in domains
function inDomainsSetting(url) {
  var domain = extractRootDomain(url);
  if (isEmpty(settingsLocal)) {
    console.log("Too soon to know");
    return false;
  }
  if (domain in settingsLocal.domains) {
    if (settingsLocal.domains[domain].nudge) {
      return domain;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

// Show local storage
function s() {
  chrome.storage.sync.get(null, function(object) {
    log(object);
  });
}

// Reset local storage
function r() {
  localStorageClear();
  syncStorageClear();
}

// Clear storage
function syncStorageClear() {
  chrome.storage.sync.clear();
}

// Check storage bytes used
function storageUsed() {
  chrome.storage.sync.getBytesInUse(null, function(bytesInUse) {
    log(bytesInUse);
  });
}

// Should be shared function
function syncSettingsLocal() {
  chrome.storage.sync.get("settings", function(item) {
    settingsLocal = item.settings;
  });
}

// Set storage
function storageSet(item, callback) {
  chrome.storage.sync.set(item, function() {
    callback();
  });
}

// Download storage item
function syncSettingsGet(callback) {
  chrome.storage.sync.get("settings", function(item) {
    callback(item);
  });
}

function changeSetting(newSetting, setting, domain, domainSetting) {
  try {
    if (domain && domainSetting) {
      if (domainSetting === "add") {
        settingsLocal[setting][domain] = defaultDomainInfo;
      } else {
        settingsLocal[setting][domain][domainSetting] = newSetting;
      }
    } else if (domain) {
      log("Error which should never happen");
    } else {
      settingsLocal[setting] = newSetting;
    }
    // Whatever has happened, sync settingsLocal and show new sync settings in log
    storageSet({ settings: settingsLocal }, s);
  } catch (e) {
    console.log(e);
  }
  // send out settingsLocal?
}

function syncSettingsPeriodically(settingsLocal) {
  // just run this every whenever to make sure you're syncing up?
}
