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

// Check if in domains
function inDomainsSetting(url) {
  var domain = extractRootDomain(url);
  if (isEmpty(settingsLocal)) {
    console.log("Too soon to know");
    return false;
  }
  if (domain in settingsLocal.domains) {
    if (settingsLocal.domains[domain].nudge) {
      return domain;
    } else {
      return false;
    }
  } else {
    return false;
  }
}
