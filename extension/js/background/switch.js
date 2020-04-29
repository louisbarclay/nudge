function switchOff(domain, url, tabId, option) {
  // log(tabId)
  if (settingsLocal.nudge_domains.includes(domain)) {
    url =
      chrome.extension.getURL(`html/pages/off_${option}.html`) +
      "?" +
      "domain=" +
      encodeURIComponent(domain) +
      "&" +
      "url=" +
      encodeURIComponent(url) +
      "&" +
      "option=" +
      option
    eventLog("nudge_off", { domain })
    try {
      chrome.tabs.update(tabId, { url }, function () {})
    } catch (e) {
      // log(e)
    }
  }
}

function switchOn(url, tabId) {
  try {
    chrome.tabs.update(tabId, { url }, function () {})
  } catch (e) {
    log(e)
  }
}
