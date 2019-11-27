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
    object[domainsArray[i]] = defaultDomainInfo
  }
  return object
}

function changeSetting(newVal, setting, domain, domainSetting, senderTabId) {
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
    } else if (domain && domainSetting) {
      // Add
      if (domainSetting === "add") {
        settingsLocal[setting][domain] = defaultDomainInfo
        identify.set(`${setting}.${domain}`, settingsLocal[setting][domain])

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
        identify.set(
          `${setting}.${domain}.${domainSetting}`,
          settingsLocal[setting][domain][domainSetting]
        )
        // Off by default is a special case - we must update the settings for all domains
      } else {
        // Set previousVal for log
        previousVal = settingsLocal[setting][domain][domainSetting]
        // Set value
        settingsLocal[setting][domain][domainSetting] = newVal
        identify.set(`${setting}.${domain}.${domainSetting}`, newVal)
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
        identify.set(`${setting}`, newVal)
      }
    }
    // Update settings in the cloud
    storageSet({ settings: settingsLocal })
    // This is not the opposite toggle value because settingsLocal has just been set
    if (setting === "off_by_default") {
      toggleOffByDefault(settingsLocal.off_by_default)
    }

    // If the setting was share_data and it's now on, run Amplitude
    if (setting === "share_data" && settingsLocal.share_data) {
      // Start Amplitude
      amplitude.getInstance().init(amplitudeCreds.apiKey)
      // Set user ID
      amplitude.getInstance().setUserId(settingsLocal.userId)
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
