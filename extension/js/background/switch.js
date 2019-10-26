function switchOff(domain, url, tabId, option) {
  if (settingsLocal.domains[domain].nudge) {
    url =
      chrome.extension.getURL(`html/pages/off_${option}.html`) +
      "?" +
      "domain=" +
      domain +
      "&" +
      "url=" +
      encodeURIComponent(url) +
      "&" +
      "option=" +
      option
    var nudged = false
    // if ( domain last nudged was within 1 minute,,, ,, , , , )
    eventLog(domain, "off", { nudged, url })
    settingsLocal.domains[domain].off = true
    chrome.tabs.update(tabId, { url }, function() {})
  }
}

function switchOn(domain, url, tabId) {
  settingsLocal.domains[domain].off = false
  // url = decodeURIComponent(url); FIXME: test this. Don't think you need it
  // missing any part about changing the settings
  try {
    chrome.tabs.update(tabId, { url }, function() {})
  } catch (e) {
    log(e)
  }
}

function closeAll(domain) {
  chrome.tabs.query({}, function(tabs) {
    for (var i = 0; i < tabs.length; i++) {
      if (domainCheck(tabs[i].url, settingsLocal) === domain) {
        try {
          chrome.tabs.remove(tabs[i].id)
        } catch (e) {
          log(e)
        }
      }
    }
  })
}
