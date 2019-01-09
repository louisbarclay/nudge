function open(key) {
  var localStorageObject = {};
  if (keyDefined(localStorage, key)) {
    localStorageObject = JSON.parse(localStorage[key]);
  }
  return localStorageObject;
}

function close(key, object, source) {
  // console.log('Close:', source, key, object);
  object = JSON.stringify(object);
  localStorage.setItem(key, object);
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

// Show local storage
function s() {
  chrome.storage.sync.get(null, function(object) {
    console.log(object);
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

function localStorageClear() {
  localStorage.clear();
}


// Set storage
function storageSet(item, callback) {
  chrome.storage.sync.set(item, function() {
    if (callback) {
      callback();
    }
  });
}

flushToTabIdStorage();

// every day, look at old localStorage info. delete it. and send it to the server if that is allowed.

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

// send: userId, eventId (random hash?), time, details
// check that eventType exists. or rather, have central log of all eventTypes. with descriptions

// Test sending settings
// sendData('zb18458e2782b2b77e36769c569e263a53885a9944dd0a861e5064eac16f1a', settingsLocal, 'settings');

// Test sending events
// sendData('zb18458e2782b2b77e36769c569e263a53885a9944dd0a861e5064eac16f1a', , 'settings');

// settings stuff should all just go through one message thing
