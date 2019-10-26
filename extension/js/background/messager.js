// URL receiver from content script and init options giver
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // Avoid sending a message to a tab that is part of the extension
  var chromeTab = !sender.tab || sender.tab.url.includes("chrome-extension:")
  // Get settings
  if (request.type === "settings") {
    sendResponse({ settings: settingsLocal })
  }
  if (request.type === "get_localStorage") {
    sendResponse({ localStorage, settingsLocal })
  }
  if (request.type === "change_setting") {
    changeSetting(
      request.newVal,
      request.setting,
      request.domain,
      request.domainSetting,
      // If sender.tab doesn't make sense, don't pass tab.id! e.g. popup.js message
      !sender.tab ? null : sender.tab.id
    )
  }
  if (request.type === "event") {
    eventLogReceiver(request)
  }
  if (request.type === "off") {
    if ((domainCheck(sender.url), settingsLocal)) {
      changeSetting(true, "domains", request.domain, "off")
      switchOff(request.domain, sender.url, sender.tabId, "normal")
    }
  }
  if (request.type === "on") {
    if (request.domain) {
      var url = request.url
      changeSetting(false, "domains", request.domain, "off")
      switchOn(request.domain, request.url, sender.tabId)
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
  if (
    request.type === "scroll" ||
    request.type === "visit" ||
    request.type === "compulsive" ||
    request.type === "time"
  ) {
    // nudgeSender(request);
  }
  if (request.type === "options") {
    chrome.runtime.openOptionsPage()
  }
  if (request.type === "close_one") {
    try {
      chrome.tabs.remove(sender.tab.id)
    } catch (e) {
      log(e)
    }
  }
  if (request.type === "close_all") {
    closeAll(request.domain)
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
              file: "js/tabidler.js"
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
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(
      tabs
    ) {
      if (typeof tabs[0] != "undefined" && tabs[0].id === sender.tab.id) {
        var domain = domainCheck(sender.url, settingsLocal)
        onTabIdle(request.status, domain)
      }
    })
  }
})
