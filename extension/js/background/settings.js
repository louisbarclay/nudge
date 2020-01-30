// Init options
function createSettings() {
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
    object[domainsArray[i]] = {
      nudge: true,
      off: false
    }
  }
  return object
}

function changeSetting(newVal, setting, domain, domainSetting, senderTabId) {
  log(newVal, setting, domain, domainSetting)
  // Set up Amplitude identify
  var identify = new amplitude.Identify()
  // For event logging
  var previousVal = null
  var info = null

  try {
    // If you are altering a specific domain's setting
    if (setting === "unhidden_divs_add") {
      if (domain in settingsLocal.unhidden_divs) {
        var foundDiv = false
        // If the div is already unhidden, don't do it again
        settingsLocal.unhidden_divs[domain].forEach(function(div) {
          if (isEquivalent(div, newVal)) {
            foundDiv = true
          }
        })
        if (!foundDiv) {
          settingsLocal.unhidden_divs[domain].push(newVal)
          identify.set(
            `unhidden_divs.${domain}`,
            settingsLocal.unhidden_divs[domain]
          )
          info = "domain previously unhidden, div not unhidden"
        } else {
          info = "domain previously unhidden, div already unhidden"
        }
      } else {
        settingsLocal.unhidden_divs[domain] = [newVal]
        identify.set(
          `unhidden_divs.${domain}`,
          settingsLocal.unhidden_divs[domain]
        )
        info = "domain never unhidden"
      }
      // Stuff related to tweaking a certain domain setting
    } else if (domain && domainSetting) {
      // Add
      if (domainSetting === "add") {
        settingsLocal.domains[domain] = {
          nudge: true,
          off: false
        }

        // Change domains info into an array for Amplitude
        var nudgeDomains = domainsSettingToAmplitude(settingsLocal, "nudge")
        identify.set("nudge_domains", nudgeDomains)
        // Special once off
      } else if (domainSetting === "removeFaviconUrl") {
        Object.keys(settingsLocal[setting]).forEach(function(key) {
          if ("faviconUrl" in settingsLocal[setting][key]) {
            delete settingsLocal[setting][key].faviconUrl
          }
        })
        // Toggle
      } else if (newVal === "toggle") {
        // Set previousVal for log
        previousVal = settingsLocal[setting][domain][domainSetting]
        // Set value
        settingsLocal[setting][domain][domainSetting] = !settingsLocal[setting][
          domain
        ][domainSetting]
        // Change domains info into an array for Amplitude
        var amplitudeDomains = domainsSettingToAmplitude(
          settingsLocal,
          domainSetting
        )
        if (domainSetting === "off") {
          identify.set("on_domains", onDomains)
        } else if (domainSetting === "nudge") {
          identify.set("nudge_domains", nudgeDomains)
        }
        // Off by default is a special case - we must update the settings for all domains
      } else {
        // Set previousVal for log
        previousVal = settingsLocal[setting][domain][domainSetting]
        // Set value
        settingsLocal[setting][domain][domainSetting] = newVal
        // Change domains info into an array for Amplitude
        var amplitudeDomains = domainsSettingToAmplitude(
          settingsLocal,
          domainSetting
        )
        if (domainSetting === "off") {
          identify.set("on_domains", amplitudeDomains)
        } else if (domainSetting === "nudge") {
          identify.set("nudge_domains", amplitudeDomains)
        }
      }
    } else {
      if (newVal === "toggle") {
        // Set previousVal for log
        previousVal = settingsLocal[setting]
        // Set value
        settingsLocal[setting] = !settingsLocal[setting]
        // Set current value for identify...this tripped you up before!
        identify.set(`${setting}`, settingsLocal[setting])
      } else {
        // Set previousVal for log
        previousVal = settingsLocal[setting]
        // Set value
        settingsLocal[setting] = newVal
        if (domainSetting && domainSetting === "off") {
          var onDomains = domainsSettingToAmplitude(settingsLocal, "off")
          identify.set("on_domains", amplitudeDomains)
        } else {
          identify.set(`${setting}`, newVal)
        }
      }
    }
    // Update settings in the cloud
    storageSet({ settings: settingsLocal })
    // This is not the opposite toggle value because settingsLocal has just been set
    if (setting === "off_by_default") {
      toggleOffByDefault(settingsLocal.off_by_default)
    }

    // If the setting was share_data and it's now on, run a whole identify to update settings
    if (setting === "share_data" && settingsLocal.share_data) {
      // Start Amplitude
      amplitude.getInstance().init(amplitudeCreds.apiKey)
      // Set user ID
      amplitude.getInstance().setUserId(settingsLocal.userId)
      // Always sync all settings on re-sharing data, just to make sure they're in sync
      flushSettingsToAmplitude(settingsLocal, identify)
    }

    // Sync settings with Amplitude
    if (settingsLocal.share_data) {
      amplitude.getInstance().identify(identify)
      // When share_data is off, only allow to sync share_data setting itself
    } else if (setting === "share_data" && !settingsLocal.share_data) {
      amplitude.getInstance().identify(identify)
    }

    // Send the event
    eventLog("changeSetting", {
      newVal,
      previousVal,
      setting,
      domain,
      domainSetting,
      info
    })
  } catch (e) {
    log(e)
  }
  // Instantly update the options page, and any other page that specifies its senderTabId
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
  // log(`Switched 'off' for all domains to ${newVal}`)
}

// This takes settings and an identify and flushes settings correctly
// We use this to prevent domains settings creating tons of User Properties in Amplitude
function flushSettingsToAmplitude(settings, identify) {
  Object.keys(settings).forEach(function(key) {
    if (key === "domains") {
      var nudgeDomains = []
      var onDomains = []
      Object.keys(settings.domains).forEach(function(key) {
        if (settings.domains[key].nudge) {
          nudgeDomains.push(key)
          if (!settings.domains[key].off) {
            onDomains.push(key)
          }
        }
      })
      identify.set("on_domains", onDomains)
      identify.set("nudge_domains", nudgeDomains)
    } else {
      identify.set(key, settings[key])
    }
  })
}

function domainsSettingToAmplitude(settings, setting) {
  var nudgeDomains = []
  var onDomains = []
  Object.keys(settings.domains).forEach(function(key) {
    if (settings.domains[key].nudge) {
      nudgeDomains.push(key)
      if (!settings.domains[key].off && setting === "off") {
        onDomains.push(key)
      }
    }
  })

  if (setting === "off") {
    return onDomains
  } else if (setting === "nudge") {
    return nudgeDomains
  }
}
