var settingsLocal = {}

function runSites(settings) {
  settingsLocal = settings
  populateDomains(settings.domains)
  populateRecommendations(settings.domains)
  populateWhitelist(settings.whitelist)
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === "send_settingsLocal") {
    settingsLocal = request.settingsLocal

    console.log(settingsLocal)
  }
})

function populateDomains(domains) {
  Object.keys(domains).forEach(function(key) {
    if (domains[key].nudge) {
      addTag(key, el("js-domainlist"), domainTagHandler)
    }
  })
}

function populateRecommendations(domains) {
  topRecommendations.forEach(function(domain) {
    addTag(domain, el("js-toplist"), recommendationTagHandler, domains)
  })
  socialRecommendations.forEach(function(domain) {
    addTag(domain, el("js-sociallist"), recommendationTagHandler, domains)
  })
  newsRecommendations.forEach(function(domain) {
    addTag(domain, el("js-newslist"), recommendationTagHandler, domains)
  })
  messagingRecommendations.forEach(function(domain) {
    addTag(domain, el("js-messaginglist"), recommendationTagHandler, domains)
  })
  shoppingRecommendations.forEach(function(domain) {
    addTag(domain, el("js-shoppinglist"), recommendationTagHandler, domains)
  })
}

function populateWhitelist(domains) {
  log(domains)
  domains.forEach(function(whitelistDomain) {
    addTag(whitelistDomain, el("js-whitelist"), whitelistTagHandler, domains)
  })
}

function addTag(domain, list, callback, domains) {
  var li = document.createElement("li")
  log(domain)
  li.innerHTML = domain
  li.id = "li" + getRandomInt(1000, 10000000000000)
  li.setAttribute("domain", domain)
  list.appendChild(li)
  loadFavicon(li.id, domain)
  callback(li, domain, domains)
}

// Handle domain tag if you click remove
function domainTagHandler(li, domain) {
  li.onclick = function() {
    deleteEl(li)
    changeSettingRequest(false, "domains", domain, "nudge")
    // TODO: also remove the tick from the domain below, if it is below
  }
}

// Handle domain tag if you click remove
function whitelistTagHandler(li, domain, whitelist) {
  li.onclick = function() {
    deleteEl(li)
    whitelist = whitelist.splice(whitelist.indexOf(domain), 1)
    changeSettingRequest(whitelist, "whitelist")
    // TODO: also remove the tick from the domain below, if it is below
  }
}

// Handle domain tag if you click remove
function recommendationTagHandler(li, domain, domains) {
  var checkmark = document.createElement("div")
  toggleClass(checkmark, "checkmark")
  li.appendChild(checkmark)
  // Check if it's in the list above
  var selectedSite = false
  Object.keys(domains).forEach(function(key) {
    if (key === domain && domains[domain].nudge) {
      selectedSite = true
      log(domain, key)
    }
  })

  if (selectedSite) {
    toggleClass(li, "selected-tag")
  }

  li.onclick = function() {
    if (li.className.includes("selected-tag")) {
      el("js-domainlist").childNodes.forEach(function(li) {
        if (li.getAttribute("domain") === domain) {
          deleteEl(li)
        }
      })
      changeSettingRequest(false, "domains", domain, "nudge")
    } else {
      if (domain in domains) {
        log("has existed before")
        changeSettingRequest(true, "domains", domain, "nudge")
        addTag(domain, el("js-domainlist"), domainTagHandler)
      } else {
        // Add for the first time
        changeSettingRequest(true, "domains", domain, "add")
        addTag(domain, el("js-domainlist"), domainTagHandler)
      }
    }
    toggleClass(li, "selected-tag")
    // Find the proper tag and remove it if necessary
  }
}

function loadFavicon(id, domain) {
  function updateFavicon() {
    var bgStyle = `{ background-image: url("http://www.google.com/s2/favicons?domain=${domain}"); }`
    styleAdder("#" + id + ":before", bgStyle)
  }
  updateFavicon()
}

// FIXME: need to move towards defining sites as an array....................

// Adding a new domain
el("js-add").addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    var newDomainInput = el("js-add")
    var newDomain = el("js-add").value
    var domainList = el("js-domainlist")

    var isInDomainList = false
    var nudge = true
    // Check
    if (domainTest.test(newDomain)) {
      // Check isInDomainlist
      Object.keys(settingsLocal.domains).forEach(function(key) {
        if (newDomain == key) {
          isInDomainList = true
          nudge = settingsLocal.domains[key].nudge
          newDomain = key
        }
      })
      if (isInDomainList && nudge) {
        console.log("in domain list and is nudge")
        var listElements = document.getElementsByTagName("li")
        for (var i = 0; i < listElements.length; i++) {
          if (listElements[i].innerHTML === newDomain) {
            toggleClass(listElements[i], "tag-flash")
            break
          }
        }
        newDomainInput.value = ""
      } else if (isInDomainList && !nudge) {
        console.log("in domain list and is not nudge")
        addTag(newDomain, domainList, domainTagHandler)
        changeSettingRequest(true, "domains", newDomain, "nudge")
        newDomainInput.value = ""
      } else if (!isInDomainList) {
        console.log("not in domain list")
        addTag(newDomain, domainList, domainTagHandler)
        changeSettingRequest(true, "domains", newDomain, "add")
        newDomainInput.value = ""
      }
    }
  }
})

// Adding a new domain
el("js-whitelistadd").addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    var newDomain = el("js-whitelistadd").value

    var isInDomainList = false
    var nudge = true
    // Check
    if (domainTest.test(newDomain)) {
      // Check isInDomainlist
      Object.keys(settingsLocal.domains).forEach(function(key) {
        if (newDomain == key) {
          isInDomainList = true
          nudge = settingsLocal.domains[key].nudge
          newDomain = key
        }
      })
      if (isInDomainList && nudge) {
        console.log("in domain list and is nudge")
        var listElements = document.getElementsByTagName("li")
        for (var i = 0; i < listElements.length; i++) {
          if (listElements[i].innerHTML === newDomain) {
            toggleClass(listElements[i], "tag-flash")
            break
          }
        }
        el("js-add").value = ""
      } else if (isInDomainList && !nudge) {
        console.log("in domain list and is not nudge")
        addTag(newDomain, el("js-domainlist"), domainTagHandler)
        changeSettingRequest(true, "domains", newDomain, "nudge")
        el("js-add").value = ""
      } else if (!isInDomainList) {
        console.log("not in domain list")
        addTag(newDomain, el("js-domainlist"), domainTagHandler)
        changeSettingRequest(true, "domains", newDomain, "add")
        el("js-add").value = ""
      }
    }
  }
})

el("js-whitelist-toggle").onclick = function() {
  toggleClass(el("js-whitelist-container"), "display-none")
}
