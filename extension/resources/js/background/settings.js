function sendOutSettingsLocal() {
  // chrome runtime sendmessage. to standard receiver everywhere. receiver is the one that only takes the info it cares about.
  // is that clumsy, because it takes the whole object? maybe but it's fine, can improve later
  // Send settings out
  chrome.runtime.sendMessage({
    type: "settings",
    settings: settingsLocal
  });
}

// Init options
function initSettings() {
  // Add static stuff
  var settings = defaultSettings;
  // Add dynamic stuff
  settings.userId = getUserId();
  settings.domains = defaultDomainPopulate(defaultDomains);
  return settings;
}

function defaultDomainPopulate(domainsArray) {
  var object = {};
  for (var i = 0; i < domainsArray.length; i++) {
    object[domainsArray[i]] = defaultDomainInfo;
  }
  return object;
}

// Check if in domains setting
function inDomainsSetting(url) {
  url = extractDomain(url);
  var domain = false;
  Object.keys(settingsLocal.domains).forEach(function(key) {
    if (url.includes(key)) {
      domain = key;
    }
  });
  return domain;
}

// Download storage item
function syncSettingsGet(callback) {
  chrome.storage.sync.get("settings", function(item) {
    callback(item);
  });
}

function changeSetting(newVal, setting, domain, domainSetting) {
  console.log(newVal, setting, domain, domainSetting);
  try {
    if (domain && domainSetting) {
      if (domainSetting === "add") {
        settingsLocal[setting][domain] = defaultDomainInfo;
      } else {
        if ((newVal = "toggle")) {
          settingsLocal[setting][domain][domainSetting] = !settingsLocal[
            setting
          ][domain][domainSetting];
        } else {
          settingsLocal[setting][domain][domainSetting] = newVal;
        }
      }
    } else {
      if (newVal === "toggle") {
        settingsLocal[setting] = !settingsLocal[setting];
      } else {
        settingsLocal[setting] = newVal;
      }
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
