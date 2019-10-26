// Init options
function initSettings() {
  // Add static stuff
  var settings = defaultSettings
  // Add dynamic stuff
  // Add new settings areas here!
  settings.userId = getUserId()
  settings.domains = defaultDomainPopulate(defaultDomains)
  settings.divs = divs
  return settings
}

function defaultDomainPopulate(domainsArray) {
  var object = {}
  for (var i = 0; i < domainsArray.length; i++) {
    object[domainsArray[i]] = defaultDomainInfo
  }
  return object
}

function changeSetting(newVal, setting, domain, domainSetting, senderTabId) {
  eventLog(domain, "changeSetting", { newVal, setting, domain, domainSetting })
  try {
    if (domain && domainSetting) {
      if (domainSetting === "add") {
        settingsLocal[setting][domain] = defaultDomainInfo
      } else {
        if ((newVal = "toggle")) {
          settingsLocal[setting][domain][domainSetting] = !settingsLocal[
            setting
          ][domain][domainSetting]
          // Off by default is a special case - we must update the settings for all domains
        } else {
          settingsLocal[setting][domain][domainSetting] = newVal
        }
      }
    } else {
      if (newVal === "toggle") {
        settingsLocal[setting] = !settingsLocal[setting]
      } else {
        // This can also create a new setting - I think!
        settingsLocal[setting] = newVal
      }
    }
    // Whatever has happened, sync settingsLocal and show new sync settings in log
    storageSet({ settings: settingsLocal })
    // Update settings in the cloud, unless it's just a change of 'off' in which case ignore
    if (settingsLocal.share_data && domainSetting != "off") {
      // We previously sent data here, but now we aren't
    }
    // This is not the opposite toggle value because settingsLocal has just been set
    if (setting === "off_by_default") {
      toggleOffByDefault(settingsLocal.off_by_default)
    }
  } catch (e) {
    log(e)
  }
  if (senderTabId) {
    try {
      chrome.tabs.sendMessage(senderTabId, {
        type: "send_settingsLocal",
        settingsLocal
      })
    } catch (e) {
      log(e)
    }
  }
}

function toggleOffByDefault(newVal) {
  var domainsTemp = settingsLocal.domains
  Object.keys(domainsTemp).forEach(function(item) {
    domainsTemp[item].off = newVal
  })

  // Adding the false parameter here so this evaluates as a regular settings change,
  // and the 'off' so that this doesn't get sent to the cloud
  changeSetting(domainsTemp, "domains", false, "off")
  log(`Switched 'off' for all domains to ${newVal}`)
}
