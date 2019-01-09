// Init options
function initSettings() {
  // Add static stuff
  var settings = defaultSettings;
  // Add dynamic stuff
  settings.userId = getUserId();
  settings.domains = defaultDomainPopulate(defaultDomains);
  settings.divs = divs;
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
  if (typeof settingsLocal.domains == "undefined") {
    console.log("Settings not yet defined so no point continuing");
    return false;
  }
  Object.keys(settingsLocal.domains).forEach(function(key) {
    if (url.includes(key)) {
      domain = key;
    }
  });
  return domain;
}

function changeSetting(newVal, setting, domain, domainSetting, senderTabId) {
  eventLog(domain, "changeSetting", { newVal, setting, domain, domainSetting });
  try {
    if (domain && domainSetting) {
      if (domainSetting === "add") {
        settingsLocal[setting][domain] = defaultDomainInfo;
      } else {
        if ((newVal = "toggle")) {
          settingsLocal[setting][domain][domainSetting] = !settingsLocal[
            setting
          ][domain][domainSetting];
          // Off by default is a special case - we must update the settings for all domains
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
    storageSet({ settings: settingsLocal });
    // Update settings in the cloud
    if (settingsLocal.share_data) {
      sendData(settingsLocal.userId, settingsLocal, false, "settings");
    }
    // This is not the opposite toggle value because settingsLocal has just been set
    if (setting === "off_by_default") {
      toggleOffByDefault(settingsLocal.off_by_default);
    }
  } catch (e) {
    console.log(e);
  }
  if (senderTabId) {
    chrome.tabs.sendMessage(senderTabId, {
      type: "send_settingsLocal",
      settingsLocal
    });
  }
}

function toggleOffByDefault(newVal) {
  var domainsTemp = settingsLocal.domains;
  Object.keys(domainsTemp).forEach(function(item) {
    domainsTemp[item].off = newVal;
  });
  changeSetting(domainsTemp, "domains");
  console.log(`Switched 'off' for all domains to ${newVal}`);
}
