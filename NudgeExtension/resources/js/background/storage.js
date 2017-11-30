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
  // send out settingsLocal? yes. and every single js has a receiver waiting for it
}

function syncSettingsPeriodically(settingsLocal) {
  // just run this every whenever to make sure you're syncing up?
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

function localStorageOpenItem(key) {
  localStorageCheckSize();
  // Check size of localStorage and send to server - everything but today - (clear from localStorage) if getting too large. at some sensible limit
  return JSON.parse(localStorage[key]);
}

function localStorageClear() {
  localStorage.clear();
}
