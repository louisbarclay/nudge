function open(key) {
  var localStorageObject = {};
  if (keyDefined(localStorage, key)) {
    localStorageObject = JSON.parse(localStorage[key]);
  }
  return localStorageObject;
}

function read(key) {
  return JSON.parse(localStorage[key]);
}

function close(key, object) {
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

flushToTabIdStorage();

function localStorageCheckSize() {}

function localStorageClear() {
  localStorage.clear();
}

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

function sendData(userId, data) {
  var dataToBeSent = {
    "userId": userId,
    "data": data
  };
  dataToBeSent = JSON.stringify(dataToBeSent);
  var request = new XMLHttpRequest();
  console.log(config.apiEndpoint);
  request.open("POST", config.apiEndpoint + "user", true);
  console.log(request);
  request.setRequestHeader(
    "Content-Type",
    "application/json"
  );
  request.send(dataToBeSent);
  console.log(dataToBeSent);
  request.onreadystatechange = function() {
    console.log(this.readyState, this.status);
  };
}

var obj1 = {
  this: "is",
  fucking: "sick"
};

// sendData('db18458e2782b2b77e36769c569e263a53885a9944dd0a861e5064eac16f1a', obj1);

// settings stuff should all just go through one message thing
