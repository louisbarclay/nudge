function messageReceiver(request, sender, sendResponse) {
  // Avoid sending a message to a tab that is part of the extension
  var chromeTab = !sender.tab || sender.tab.url.includes("chrome-extension:")
  // Get settings
  if (request.type === "settings") {
    sendResponse({ settings: settingsLocal })
  }
  if (request.type === "hidees") {
    sendResponse({ hidees: hideesSync })
  }
  if (request.type === "get_localStorage") {
    sendResponse({ localStorage, settingsLocal })
  }
  if (request.type === "change_setting") {
    changeSetting(request.newVal, request.setting)
  }
  if (request.type === "event") {
    eventLogReceiver(request)
  }
  if (request.type === "on") {
    if (request.domain) {
      if (!settingsLocal.on_domains.includes(request.domain)) {
        settingsLocal.on_domains.push(request.domain)
      }
      changeSettingRequest(settingsLocal.on_domains, "on_domains")
      switchOn(request.url, sender.tabId)
    }
    // Register a new switch on
    var date = moment().format("YYYY-MM-DD")
    var dateObj = open(date)
    if (isUndefined(dateObj.switch_ons)) {
      dateObj.switch_ons = 1
    } else {
      dateObj.switch_ons++
    }
    close(date, dateObj, "close date in messager")
  }
  if (request.type === "options") {
    chrome.runtime.openOptionsPage()
  }
  if (request.type === "unfollow_everything") {
    chrome.tabs.create({
      url:
        "https://chrome.google.com/webstore/detail/unfollow-everything-for-f/ohceakcebcalehmaliegoenkliddajoo/",
    })
  }
  if (request.type === "inject_tabidler" && !chromeTab) {
    try {
      chrome.tabs.get(sender.tab.id, checkIfExists)
    } catch (e) {
      log(e)
    }
    function checkIfExists() {
      try {
        if (chrome.runtime.lastError) {
          // Tab doesn't exist
          log(chrome.runtime.lastError.message)
        } else {
          // Tab exists
          try {
            chrome.tabs.executeScript(sender.tab.id, {
              file: "js/tabidler.js",
            })
            sendResponse({ message: "tab idler injected" })
          } catch (e) {
            log(e)
          }
        }
      } catch (e) {
        log(e)
      }
    }
  }
  if (request.type === "tabIdle") {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (
      tabs
    ) {
      if (typeof tabs[0] != "undefined" && tabs[0].id === sender.tab.id) {
        var domain = domainCheck(sender.url, settingsLocal)
        onTabIdle(request.status, domain)
      }
    })
  }

  // Utils
  // Listener for tab idle
  function onTabIdle(status, domain) {
    if (status) {
      timeline(tabIdle, "onTabIdle")
    } else {
      timeline(domain, "onTabIdle")
    }
  }
}
