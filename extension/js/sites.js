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
  }
})

function populateDomains(domains) {
  var domainsExist = false
  Object.keys(domains).forEach(function(key) {
    if (domains[key].nudge) {
      addTag(key, el("js-domainlist"), domainTagHandler)
      if (!domainsExist) {
        domainsExist = true
      }
    }
  })
  if (!domainsExist) {
    el("js-empty-state").style.display = "flex"
    el("js-domainlist").style.display = "none"
  }
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
  domains.forEach(function(whitelistDomain) {
    addTag(whitelistDomain, el("js-whitelist"), whitelistTagHandler, domains)
  })
}

function addTag(domain, list, callback, domains) {
  var li = document.createElement("li")
  li.innerHTML = domain
  li.id = "li" + getRandomInt(1000, 10000000000000)
  li.setAttribute("domain", domain)
  list.appendChild(li)
  // Adjust the placeholder
  if (
    list.id === "js-domainlist" &&
    el("js-empty-state").style.display != "none"
  ) {
    el("js-empty-state").style.display = "none"
    el("js-domainlist").style.display = "flex"
  }
  loadFavicon(li.id, domain)
  callback(li, domain, domains)
}

// Handle domain tag if you click remove
function domainTagHandler(li) {
  li.onclick = function() {
    var domain = li.getAttribute("domain")
    deleteEl(li)
    changeSettingRequest(false, "domains", domain, "nudge")
    domainRecSelectToggle(domain)
  }
}

// Handle domain tag if you click remove
function whitelistTagHandler(li, domain) {
  li.onclick = function() {
    deleteEl(li)
    settingsLocal.whitelist = settingsLocal.whitelist.filter(function(value) {
      return value !== domain
    })
    changeSettingRequest(settingsLocal.whitelist, "whitelist")
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
    var bgStyle = `{ background-image: url("https://www.google.com/s2/favicons?domain=${domain}"); }`
    styleAdder("#" + id + ":before", bgStyle)
  }
  updateFavicon()
}

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
        var listElements = document.getElementsByTagName("li")
        for (var i = 0; i < listElements.length; i++) {
          if (listElements[i].innerHTML === newDomain) {
            toggleClass(listElements[i], "tag-flash")
            break
          }
        }
        newDomainInput.value = ""
      } else if (isInDomainList && !nudge) {
        addTag(newDomain, domainList, domainTagHandler)
        changeSettingRequest(true, "domains", newDomain, "nudge")
        domainRecSelectToggle(newDomain)
        newDomainInput.value = ""
      } else if (!isInDomainList) {
        addTag(newDomain, domainList, domainTagHandler)
        changeSettingRequest(true, "domains", newDomain, "add")
        domainRecSelectToggle(newDomain)
        newDomainInput.value = ""
      }
    }
  }
})

// Adding a new domain
el("js-whitelistadd").addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    var newDomain = el("js-whitelistadd").value
    if (whitelistTest.test(newDomain)) {
      if (settingsLocal.whitelist.includes(newDomain)) {
      } else {
        addTag(newDomain, el("js-whitelist"), whitelistTagHandler)
        settingsLocal.whitelist.push(newDomain)
        changeSettingRequest(settingsLocal.whitelist, "whitelist")
        el("js-whitelistadd").value = ""
      }
    }
  }
})

let showHiddenSections = false
el("js-whitelist-toggle").onclick = function() {
  toggleClass(el("js-whitelist-container"), "display-none")

  if (showHiddenSections) {
    showHiddenSections = false
    el("js-whitelist-toggle").innerHTML = "Choose whitelist sites"
  } else {
    showHiddenSections = true
    el("js-whitelist-toggle").innerHTML = "Hide whitelist sites"
  }
}

function domainRecSelectToggle(domain) {
  var lists = [
    "toplist",
    "sociallist",
    "newslist",
    "messaginglist",
    "shoppinglist"
  ]
  lists.forEach(function(list) {
    el(`js-${list}`).childNodes.forEach(function(node) {
      if (node.innerText === domain) {
        toggleClass(node, "selected-tag")
      }
    })
  })
}
