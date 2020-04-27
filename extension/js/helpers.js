// Log
// Can activate this for users using a little code
if (config.dev) {
  var log = console.log.bind(window.console)
} else var log = function () {}

// Extract core domain from URL you want to check
function extractDomain(url) {
  if (url !== "") {
    var niceUrl = new URL(url)
    // log(niceUrl.hostname + '/' + niceUrl.pathname.split("/")[1]);
    return niceUrl.hostname + "/" + niceUrl.pathname.split("/")[1]
  } else {
    return "empty.url/empty"
  }
}

function getUrl(path) {
  return chrome.extension.getURL(path)
}

function checkSnoozeAndSchedule(settings) {
  if (
    settings.snooze &&
    "all" in settings.snooze &&
    settings.snooze.all > +Date.now()
  ) {
    return true
  }
  if (settings.schedule) {
    let nudgeTime = true
    let nudgeDay = true
    let nowTime = Date()
    if (!settings.schedule.includes(nowTime.substring(0, 3))) {
      nudgeDay = false
    }
    let startTime = new Date()
    startTime.setHours(
      settings.schedule.substring(0, 2),
      settings.schedule.substring(3, 5),
      0
    )
    let endTime = new Date()
    endTime.setHours(
      settings.schedule.substring(5, 7),
      settings.schedule.substring(8, 10),
      0
    )
    if (settings.schedule.substring(5, 10) === "00:00") {
      endTime.setHours(23, 59, 59)
    }
    if (startTime < endTime) {
      if (
        !(
          Date.parse(nowTime) > Date.parse(startTime) &&
          Date.parse(nowTime) < Date.parse(endTime)
        )
      ) {
        // Don't Nudge
        nudgeTime = false
      }
    } else {
      if (
        !(
          Date.parse(nowTime) > Date.parse(startTime) ||
          Date.parse(nowTime) < Date.parse(endTime)
        )
      ) {
        // Don't Nudge
        nudgeTime = false
      }
    }
    if (!(nudgeTime && nudgeDay)) {
      return true
    }
  } else {
    return false
  }
  return false
}

;(function (funcName, baseObj) {
  // The public function name defaults to window.docReady
  // but you can pass in your own object and own function name and those will be used
  // if you want to put them in a different namespace
  funcName = funcName || "docReady"
  baseObj = baseObj || window
  var readyList = []
  var readyFired = false
  var readyEventHandlersInstalled = false

  // call this when the document is ready
  // this function protects itself against being called more than once
  function ready() {
    if (!readyFired) {
      // this must be set to true before we start calling callbacks
      readyFired = true
      for (var i = 0; i < readyList.length; i++) {
        // if a callback here happens to add new ready handlers,
        // the docReady() function will see that it already fired
        // and will schedule the callback to run right after
        // this event loop finishes so all handlers will still execute
        // in order and no new ones will be added to the readyList
        // while we are processing the list
        readyList[i].fn.call(window, readyList[i].ctx)
      }
      // allow any closures held by these functions to free
      readyList = []
    }
  }

  function readyStateChange() {
    if (document.readyState === "complete") {
      ready()
    }
  }

  // This is the one public interface
  // docReady(fn, context);
  // the context argument is optional - if present, it will be passed
  // as an argument to the callback
  baseObj[funcName] = function (callback, context) {
    if (typeof callback !== "function") {
      throw new TypeError("callback for docReady(fn) must be a function")
    }
    // if ready has already fired, then just schedule the callback
    // to fire asynchronously, but right away
    if (readyFired) {
      setTimeout(function () {
        callback(context)
      }, 1)
      return
    } else {
      // add the function and context to the list
      readyList.push({ fn: callback, ctx: context })
    }
    // if document already ready to go, schedule the ready function to run
    if (document.readyState === "complete") {
      setTimeout(ready, 1)
    } else if (!readyEventHandlersInstalled) {
      // otherwise if we don't have event handlers installed, install them
      if (document.addEventListener) {
        // first choice is DOMContentLoaded event
        document.addEventListener("DOMContentLoaded", ready, false)
        // backup is window load event
        window.addEventListener("load", ready, false)
      } else {
        // must be IE
        document.attachEvent("onreadystatechange", readyStateChange)
        window.attachEvent("onload", ready)
      }
      readyEventHandlersInstalled = true
    }
  }
})("docReady", window)

function notUndefined(x) {
  if (typeof x === "undefined") {
    return false
  } else {
    return true
  }
}

function isUndefined(x) {
  try {
    if (typeof x === "undefined") {
      return true
    } else {
      return false
    }
  } catch (e) {
    return true
  }
}

function popupCenter(url, title, w, h) {
  var dualScreenLeft =
    window.screenLeft != undefined ? window.screenLeft : screen.left
  var dualScreenTop =
    window.screenTop != undefined ? window.screenTop : screen.top

  var width = window.innerWidth
    ? window.innerWidth
    : document.documentElement.clientWidth
    ? document.documentElement.clientWidth
    : screen.width
  var height = window.innerHeight
    ? window.innerHeight
    : document.documentElement.clientHeight
    ? document.documentElement.clientHeight
    : screen.height

  var left = width / 2 - w / 2 + dualScreenLeft
  var top = height / 2 - h / 2 + dualScreenTop
  var newWindow = window.open(
    url,
    title,
    "scrollbars=no, width=" +
      w +
      ", height=" +
      h +
      ", top=" +
      top +
      ", left=" +
      left
  )

  // Puts focus on the newWindow
  if (window.focus) {
    newWindow.focus()
  }
}

function addCSS(cssId, nudgeUrl) {
  if (!document.getElementById(cssId)) {
    var head = document.getElementsByTagName("head")[0]
    var link = document.createElement("link")
    link.id = cssId
    link.rel = "stylesheet"
    link.type = "text/css"
    link.href = chrome.extension.getURL(nudgeUrl)
    link.media = "all"
    head.appendChild(link)
  }
}

// Generate userId
function getUserId() {
  // E.g. 8 * 32 = 256 bits token
  var randomPool = new Uint8Array(32)
  crypto.getRandomValues(randomPool)
  var hex = ""
  for (var i = 0; i < randomPool.length; ++i) {
    hex += randomPool[i].toString(16)
  }
  // E.g. db18458e2782b2b77e36769c569e263a53885a9944dd0a861e5064eac16f1a
  return hex
}

function createEl(parent, type, name) {
  var element = document.createElement(type)
  if (name) {
    element.id = name
  }
  parent.appendChild(element)
  return element
}

function deleteEl(element) {
  if (!element || !element.parentNode) {
    return
  }
  element.parentNode.removeChild(element)
}

// 2 digit slicer
function lastTwo(number) {
  var formattedNumber = ("0" + number).slice(-2)
  return formattedNumber
}

// Turn lots of seconds into e.g. 10m15s
function logMinutes(time) {
  var minutes = Math.floor(time / 60)
  var seconds = Math.floor(time) % 60
  return minutes + "m" + lastTwo(seconds) + "s"
}

// Turn lots of seconds into e.g. 10m
function logMinutesNoSeconds(time) {
  var minutes = Math.floor(time / 60)
  return minutes + "m"
}

// Turn lots of seconds into e.g. 10m15s
function msToDuration(ms) {
  var seconds = Math.floor(ms / 1000)
  var time = false
  if (seconds < 60) {
    time = `${seconds}s`
  } else if (seconds < 3600) {
    time = `${Math.floor(seconds / 60)}m${seconds % 60}s`
  } else {
    time = `${Math.floor(seconds / 3600)}h${Math.floor(seconds / 60) % 60}m`
  }
  return time
}

// Text for button
function badgeTime(time) {
  var minutes = Math.floor(time / 60)
  var seconds = Math.floor(time) % 60
  if (time > 59) {
    return minutes + "m"
  } else {
    return seconds + "s"
  }
}

// Gets a random integer
function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min //The maximum is exclusive and the minimum is inclusive
}

// Adds together two numbers onto the second
function addTogether(a, b) {
  if (!a || a == "undefined" || a == null) {
    a = 0
  }
  b = a + b
  return b
}

// Add style to document
function styleAdder(name, style, id) {
  var styleText = name + style
  style = document.createElement("style")
  style.innerHTML = styleText
  if (id) {
    style.id = id
  }
  document.head.appendChild(style)
}

function liveUpdate(domain, liveUpdateObj) {
  chrome.tabs.query(
    { active: true, lastFocusedWindow: true },
    function liveUpdateSender(tabs) {
      if (typeof tabs[0] != "undefined") {
        // Live updater for control center
        try {
          chrome.tabs.sendMessage(tabs[0].id, liveUpdateObj)
        } catch (e) {
          log(e)
        }
      }
    }
  )
}

// Send event from content script
function eventLogSender(eventType, detailsObj) {
  chrome.runtime.sendMessage({
    type: "event",
    eventType,
    detailsObj,
  })
}

// Helper to check if key defined
function keyDefined(object, key) {
  if (object[key] !== undefined) {
    return true
  } else {
    return false
  }
}

function toggleClass(el, className) {
  if (el.classList) {
    el.classList.toggle(className)
  } else {
    var classes = el.className.split(" ")
    var existingIndex = classes.indexOf(className)
    if (existingIndex >= 0) classes.splice(existingIndex, 1)
    else classes.push(className)
    el.className = classes.join(" ")
  }
}

function onDocHeadExists(callback) {
  document.addEventListener("DOMSubtreeModified", runCallback, false)
  function runCallback() {
    if (document.head) {
      document.removeEventListener("DOMSubtreeModified", runCallback, false)
      callback()
    }
  }
}

function sendMessage(type, object) {
  object.type = type
  chrome.runtime.sendMessage(object)
}

function el(id) {
  var element = document.getElementById(id)
  return element
}

function appendHtml(parent, childString, callback) {
  if (parent) {
    parent.insertAdjacentHTML("afterbegin", childString)
  }
  if (callback) {
    callback()
  }
}

// Create a random delay between XMLHttpRequests
function randomTime(floor, variance) {
  var ms = 1000
  return Math.floor(ms * (floor + Math.random() * variance))
}

// optimise mutationObserver https://stackoverflow.com/questions/31659567/performance-of-mutationobserver-to-detect-nodes-in-entire-dom
// especially the point about using getElementById

function fbTokenReady(name, callback) {
  var found = false

  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      for (var i = 0; i < mutation.addedNodes.length; i++) {
        var node = document.getElementsByName(name)
        node = node[0]
        if (!found && notUndefined(node)) {
          found = true
          observer.disconnect()
          if (callback) {
            callback(node)
          }
        }
      }
    })
  })

  observer.observe(document, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false,
  })
}

// Check if in domains setting
function domainCheck(url, settings) {
  var domainToCheck = extractDomain(url)
  var domain = false

  // Check if settings are undefined
  if (!settings.nudge_domains || !settings.whitelist_domains) {
    log("Settings not yet defined so no point continuing")
    return notInChrome
  }

  if (url.startsWith(getUrl("/")) && url.includes("pages/off")) {
    var offDomain = decodeURIComponent(url.split("domain=")[1].split("&")[0])
    domain = `${offPage}/${offDomain}`
    return domain
  }

  // Check against Nudge domains
  settings.nudge_domains.forEach((nudgeDomain) => {
    if (domainToCheck.includes(nudgeDomain)) {
      domain = nudgeDomain
      // Don't return here because you need to do a whitelist check
    }
  })

  // Check against the whitelist
  settings.whitelist_domains.forEach(function (whitelistDomain) {
    // log(whitelistDomain)
    if (domainToCheck.includes(whitelistDomain.split("/")[0])) {
      // log(whitelistDomain.split('/')[0]);
      var match = true
      for (var i = 0; i < whitelistDomain.split("*").length; i++) {
        // log(url, whitelistDomain.split('*')[i])
        if (!url.includes(whitelistDomain.split("*")[i])) {
          match = false
        }
      }

      if (match) {
        // Whitelisted
        domain = `${whitelistPage}/${whitelistDomain}`
        return domain
      }
    }
  })

  // If domain still hasn't been identified and URL starts with http, we have an httpPage
  if (!domain && url.startsWith("http")) {
    domain = httpPage
  }

  // If it's a Chrome page
  if (!domain && url.startsWith("chrome://")) {
    if (domainToCheck.includes("newtab/")) {
      domain = `${chromePage}/${domainToCheck.split("/")[0]}`
    } else {
      domain = `${chromePage}/other`
    }
  }

  // If it's a Nudge page
  if (!domain && url.startsWith(getUrl("/"))) {
    domain = `${nudgePage}/${url.split(getUrl("/"))[1]}`
  }

  // If it's some other random page. Could include ftp, and other protocols
  if (!domain) {
    domain = unknownPage
    // log(domainToCheck)
    // log(url)
  }

  return domain
}

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, wait, immediate) {
  var timeout
  return function () {
    var context = this,
      args = arguments
    var later = function () {
      timeout = null
      if (!immediate) func.apply(context, args)
    }
    var callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(context, args)
  }
}

const throttle = (func, limit) => {
  let lastFunc
  let lastRan
  return function () {
    const context = this
    const args = arguments
    if (!lastRan) {
      func.apply(context, args)
      lastRan = Date.now()
    } else {
      clearTimeout(lastFunc)
      lastFunc = setTimeout(function () {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args)
          lastRan = Date.now()
        }
      }, limit - (Date.now() - lastRan))
    }
  }
}

function isNudgeDomain(domain) {
  if (!(typeof domain === "string") || domain.startsWith("$")) {
    return false
  }
  return true
}

function tabIdler() {
  chrome.runtime.sendMessage({ type: "inject_tabidler" })
}

function click(x, y) {
  var ev = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true,
    screenX: x,
    screenY: y,
  })

  var el = document.elementFromPoint(x, y)

  el.dispatchEvent(ev)
}

// Load syncStorage
const loadSyncStorage = async () => {
  return new Promise((resolve) => {
    chrome.storage.sync.get(null, function (storage) {
      resolve(storage)
    })
  })
}

function removeDomainFromOnDomains(settings, domain) {
  log(settings.on_domains)
  if (settings.on_domains) {
    settings.on_domains = settings.on_domains.filter((onDomain) => {
      return domain !== onDomain
    })
  } else {
    settings.on_domains = []
  }
  changeSetting(settings.on_domains, "on_domains")
}

function addDomainToOnDomains(settings, domain) {
  if (!settings.on_domains.includes(domain)) {
    settings.on_domains.push(domain)
  }
  changeSetting(settings.on_domains, "on_domains")
}

// New version of getSettings
async function loadSettingsRequest() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "settings" }, function (response) {
      resolve(response.settings)
    })
  })
}

// Set storage
const setSyncStorage = async (item) => {
  return new Promise((resolve) => {
    chrome.storage.sync.set(item, () => {
      resolve()
    })
  })
}

// Load syncStorage
const loadSettings = async () => {
  return new Promise((resolve) => {
    chrome.storage.sync.get(null, function (storage) {
      resolve(storage.settings)
    })
  })
}

function changeSettingRequest(newVal, setting) {
  sendMessage("change_setting", {
    newVal,
    setting,
  })
}

const objectWithoutKey = (object, key) => {
  const { [key]: deletedKey, ...otherKeys } = object
  return otherKeys
}

function imgSrcToDataURL(src, callback, outputFormat) {
  var img = new Image()
  img.crossOrigin = "Anonymous"
  img.onload = function () {
    var canvas = document.createElement("CANVAS")
    var ctx = canvas.getContext("2d")
    var dataURL
    canvas.height = this.naturalHeight
    canvas.width = this.naturalWidth
    ctx.drawImage(this, 0, 0)
    dataURL = canvas.toDataURL(outputFormat)
    callback(dataURL)
  }
  img.src = src
  if (img.complete || img.complete === undefined) {
    img.src =
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
    img.src = src
  }
}
