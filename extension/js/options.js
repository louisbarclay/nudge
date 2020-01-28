var addDomain = document.getElementById("addDomain")
var addWhitelist = document.getElementById("addWhitelist")
var domainTags = document.getElementById("domainList")
var whitelistTags = document.getElementById("whiteList")
var id_button = document.getElementById("id")
var domains = {}
var facebookNotif = document.getElementById("facebookNotif")
var blankFaviconString = ""

imgSrcToDataURL(chrome.runtime.getURL("img/favicon/blankfavicon.png"), function(
  dataUrl
) {
  blankFaviconString = dataUrl
  console.log(blankFaviconString)
})

getSettings(execSettings)

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === "send_settingsLocal") {
    settingsLocal = request.settingsLocal
    console.log(settingsLocal)
  }
})

var settingsLocal = {}

function execSettings(settings) {
  settingsLocal = settings
  populateDomains(settings.domains)

  // Populate whitelist
  settings.whitelist.forEach(function(domain) {
    addLi(domain, whitelistTags, whitelistTagsHandler)
  })

  populateBooleans(settings)
  // Reset
  // changeSettingRequest(0, "show_intro");
  console.log(settingsLocal.show_intro)
  if (settingsLocal.show_intro < 2) {
    el("welcome").innerHTML = nudgeStorage["welcome.html"]
    handleWelcomeBoolean(settings)
    var increaseCounter = settingsLocal.show_intro + 1
    changeSettingRequest(increaseCounter, "show_intro")
  }
  id_button.innerHTML = settings.userId
}

function updateLocalSettings(settings) {
  settingsLocal = settings
}

function populateDomains(domains) {
  Object.keys(domains).forEach(function(key) {
    if (domains[key].nudge) {
      addLi(key, domainTags, domainTagsHandler)
    } else {
      console.log(key)
    }
  })
}

// Handle domain tag if you click remove
function domainTagsHandler(li, domain) {
  loadFavicon(li.id, domain)
  // remove
  li.onclick = function() {
    console.log(li, domain)
    deleteEl(li)
    changeSettingRequest(false, "domains", domain, "nudge")
  }
}

// Handle whitelist tag if you click remove
function whitelistTagsHandler(li, domain) {
  loadFavicon(li.id, domain)
  // remove
  li.onclick = function() {
    deleteEl(li)
    settingsLocal.whitelist.splice(settingsLocal.whitelist.indexOf(domain))
    changeSettingRequest(settingsLocal.whitelist, "whitelist")
  }
}

function populateBooleans(settings) {
  var booleans = document.getElementsByClassName("boolean")
  Array.from(booleans).forEach(function(item) {
    if (keyDefined(settings, item.id)) {
      handleBoolean(item.id)
      // If not already on the right setting, change it
      if (!settings[item.id]) {
        toggleBoolean(item.id)
      }
    }
  })
}

function handleBoolean(id) {
  var div = document.getElementById(id)
  var button = div.childNodes[1]
  button.onclick = function() {
    toggleBoolean(id)
    changeSettingRequest("toggle", id)
  }
}

function handleWelcomeBoolean(settings) {
  if (!settings["share_data"]) {
    toggleBoolean("share_data2")
  }
  var welcomeBoolean = el("share_data2")
  console.log(welcomeBoolean)
  var button = welcomeBoolean.childNodes[1]
  button.onclick = function() {
    toggleBoolean("share_data2")
    toggleBoolean("share_data")
    changeSettingRequest("toggle", "share_data")
  }
}

function toggleBoolean(id) {
  var div = document.getElementById(id)
  var button = div.childNodes[1]
  var left = button.childNodes[0]
  var right = button.childNodes[1]
  toggleClass(left, "on")
  toggleClass(right, "on")
}

// Adding a new whitelist item
addWhitelist.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    var newDomain = addWhitelist.value
    if (whitelistTest.test(newDomain)) {
      addLi(newDomain, whitelistTags, whitelistTagsHandler)
      console.log(settingsLocal.whitelist)
      console.log(newDomain)
      settingsLocal.whitelist.push(newDomain)
      changeSettingRequest(settingsLocal.whitelist, "whitelist")
      addWhitelist.value = ""
    }
  }
})

// Adding a new domain
addDomain.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    var newDomain = addDomain.value

    var isInDomainList = false
    var nudge = true
    if (domainTest.test(newDomain)) {
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
            toggleClass(listElements[i], "options-flash")
            break
          }
        }
        addDomain.value = ""
      } else if (isInDomainList && !nudge) {
        console.log("in domain list and is not nudge")
        addLi(newDomain, domainTags, domainTagsHandler)
        changeSettingRequest(true, "domains", newDomain, "nudge")
        addDomain.value = ""
      } else if (!isInDomainList) {
        console.log("not in domain list")
        addLi(newDomain, domainTags, domainTagsHandler)
        changeSettingRequest(true, "domains", newDomain, "add")
        addDomain.value = ""
      }
    }
  }
})

function addLi(domain, element, callback) {
  var li = document.createElement("li")
  li.innerHTML = domain
  li.id = "li" + getRandomInt(1000, 10000000000000)
  element.appendChild(li)
  callback(li, domain)
}

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min //The maximum is exclusive and the minimum is inclusive
}

var items = domainTags.getElementsByTagName("li")

function styleAdder(id, style) {
  var styleText = id + style
  style = document.createElement("style")
  style.innerHTML = styleText
  document.head.appendChild(style)
}

function loadFavicon(elementId, domain) {
  var faviconUrl = `http://www.google.com/s2/favicons?domain=${domain}`
  imgSrcToDataURL(faviconUrl, function(dataUrl) {
    if (dataUrl === blankFaviconString) {
      console.log(domain)
    }
  })
  function updateFavicon() {
    var bgStyle = `{ background-image: url("http://www.google.com/s2/favicons?domain=${domain}"); background-size: cover }`
    styleAdder("#" + elementId + ":before", bgStyle)
  }
  updateFavicon()
}

// Some alternatives for getting favicons:
// http://www.google.com/s2/favicons?domain=${domain}
// https://api.statvoo.com/favicon/?url=google.com
// https://api.faviconkit.com/twitter.com/144
