// Log
if (config.debug) var log = console.log.bind(window.console)
else var log = function() {}

// Extract core domain from URL you want to check
function extractDomain(url) {
  var niceUrl = new URL(url)
  // log(niceUrl.hostname + '/' + niceUrl.pathname.split("/")[1]);
  return niceUrl.hostname + "/" + niceUrl.pathname.split("/")[1]
}

function getUrl(path) {
  return chrome.extension.getURL(path)
}

;(function(funcName, baseObj) {
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
  baseObj[funcName] = function(callback, context) {
    if (typeof callback !== "function") {
      throw new TypeError("callback for docReady(fn) must be a function")
    }
    // if ready has already fired, then just schedule the callback
    // to fire asynchronously, but right away
    if (readyFired) {
      setTimeout(function() {
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

function isEquivalent(a, b) {
  // Create arrays of property names
  var aProps = Object.getOwnPropertyNames(a)
  var bProps = Object.getOwnPropertyNames(b)

  // If number of properties is different,
  // objects are not equivalent
  if (aProps.length != bProps.length) {
    return false
  }

  for (var i = 0; i < aProps.length; i++) {
    var propName = aProps[i]

    // If values of same property are not equal,
    // objects are not equivalent
    if (a[propName] !== b[propName]) {
      return false
    }
  }

  // If we made it this far, objects
  // are considered equivalent
  return true
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

function sendHTMLRequest(url, callback, errorFunction) {
  var request = new XMLHttpRequest()
  request.open("GET", url, true)

  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      // Success!
      var response = request.responseText
      callback(url, response)
    } else {
      // We reached our target server, but it returned an error
    }
  }

  request.onerror = function() {
    // log("Error in HTML request");
    if (errorFunction) {
      errorFunction
    }
  }

  request.send()
}

function append(parent, newChild) {
  parent.appendChild(newChild)
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

function addScript(scriptId, nudgeUrl, dataObj) {
  if (!document.getElementById(scriptId)) {
    var head = document.getElementsByTagName("head")[0]
    var script = document.createElement("script")
    script.id = scriptId
    script.type = "text/javascript"
    script.src = chrome.extension.getURL(nudgeUrl)
    if (dataObj) {
      Object.keys(dataObj).forEach(function(key) {
        script.dataset[key] = dataObj[key]
      })
    }
    head.appendChild(script)
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

// Checks if object is empty
function isEmpty(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) return false
  }
  return true
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

// Turn lots of seconds into e.g. 10m15s
function logMinutesNoSeconds(time) {
  var minutes = Math.floor(time / 60)
  return minutes + "m"
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
function eventLogSender(eventType, detailsObj, time) {
  chrome.runtime.sendMessage({
    type: "event",
    eventType,
    detailsObj,
    time: time ? time : moment()
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

// Fade out
function fadeOut(el) {
  el.style.opacity = 1
  ;(function fade() {
    if ((el.style.opacity -= 0.1) < 0) {
      el.style.display = "none"
    } else {
      requestAnimationFrame(fade)
    }
  })()
}

// Fade in

function fadeIn(el, display) {
  el.style.opacity = 0
  el.style.display = display || "block"
  ;(function fade() {
    var val = parseFloat(el.style.opacity)
    if (!((val += 0.1) > 1)) {
      el.style.opacity = val
      requestAnimationFrame(fade)
    }
  })()
}

function doAtEarliest(callback) {
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

function switchOffRequest(domain) {
  sendMessage("off", { domain })
}

function el(id) {
  var element = document.getElementById(id)
  return element
}

// Helper function for chaining
function classList(element) {
  var list = element.classList
  return {
    toggle: function(c) {
      list.toggle(c)
      return this
    },
    add: function(c) {
      list.add(c)
      return this
    },
    remove: function(c) {
      list.remove(c)
      return this
    }
  }
}

function storeForUse(url, response) {
  url = url.split("/").pop()
  if (typeof localStorage === "undefined") {
    // log(`Can't find localStorage`);
  } else {
    localStorage[url] = response
  }
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

  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
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
    characterData: false
  })
}

// Amplitude
;(function(e, t) {
  var n = e.amplitude || { _q: [], _iq: {} }
  var r = t.createElement("script")
  r.type = "text/javascript"
  r.integrity = amplitudeCreds.integrity
  r.crossOrigin = "anonymous"
  r.async = true
  r.src = getUrl("js/vendor/amplitude-5.2.2-min.gz.js")
  r.onload = function() {
    if (!e.amplitude.runQueuedFunctions) {
      console.log("[Amplitude] Error: could not load SDK")
    }
  }
  var i = t.getElementsByTagName("script")[0]
  i.parentNode.insertBefore(r, i)
  function s(e, t) {
    e.prototype[t] = function() {
      this._q.push([t].concat(Array.prototype.slice.call(arguments, 0)))
      return this
    }
  }
  var o = function() {
    this._q = []
    return this
  }
  var a = ["add", "append", "clearAll", "prepend", "set", "setOnce", "unset"]
  for (var u = 0; u < a.length; u++) {
    s(o, a[u])
  }
  n.Identify = o
  var c = function() {
    this._q = []
    return this
  }
  var l = [
    "setProductId",
    "setQuantity",
    "setPrice",
    "setRevenueType",
    "setEventProperties"
  ]
  for (var p = 0; p < l.length; p++) {
    s(c, l[p])
  }
  n.Revenue = c
  var d = [
    "init",
    "logEvent",
    "logRevenue",
    "setUserId",
    "setUserProperties",
    "setOptOut",
    "setVersionName",
    "setDomain",
    "setDeviceId",
    "setGlobalUserProperties",
    "identify",
    "clearUserProperties",
    "setGroup",
    "logRevenueV2",
    "regenerateDeviceId",
    "groupIdentify",
    "onInit",
    "logEventWithTimestamp",
    "logEventWithGroups",
    "setSessionId",
    "resetSessionId"
  ]
  function v(e) {
    function t(t) {
      e[t] = function() {
        e._q.push([t].concat(Array.prototype.slice.call(arguments, 0)))
      }
    }
    for (var n = 0; n < d.length; n++) {
      t(d[n])
    }
  }
  v(n)
  n.getInstance = function(e) {
    e = (!e || e.length === 0 ? "$default_instance" : e).toLowerCase()
    if (!n._iq.hasOwnProperty(e)) {
      n._iq[e] = { _q: [] }
      v(n._iq[e])
    }
    return n._iq[e]
  }
  e.amplitude = n
})(window, document)

// Check if in domains setting
function domainCheck(url, settings) {
  var domainToCheck = extractDomain(url)
  var domain = false

  // Check if settings are undefined
  if (typeof settings.domains == "undefined") {
    log("Settings not yet defined so no point continuing")
    return notInChrome
  }

  if (url.startsWith(getUrl("/")) && url.includes("pages/off")) {
    var offDomain = decodeURIComponent(url.split("domain=")[1].split("&")[0])
    domain = `${offPage}/${offDomain}`
    return domain
  }

  // Check against Nudge domains
  Object.keys(settings.domains).forEach(function(nudgeDomain) {
    if (
      domainToCheck.includes(nudgeDomain) &&
      settings.domains[nudgeDomain].nudge
      // Worth noting this means that previously nudged but now nudge = off sites will be httpPages
    ) {
      domain = nudgeDomain
      // Don't return here because you need to do a whitelist check
    }
  })

  // Check against the whitelist
  settings.whitelist.forEach(function(whitelistDomain) {
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

  // If it's a Chrome page
  if (!domain && url.startsWith(getUrl("/"))) {
    domain = `${nudgePage}/${url.split(getUrl("/"))[1]}`
  }

  // If it's some other random page. Could include ftp, and other protocols
  if (!domain) {
    domain = unknownPage
    log(domainToCheck)
    log(url)
  }

  return domain
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
    screenY: y
  })

  var el = document.elementFromPoint(x, y)

  el.dispatchEvent(ev)
}

function getSettings(callback) {
  chrome.runtime.sendMessage({ type: "settings" }, function(response) {
    callback(response.settings)
  })
}

function changeSettingRequest(newVal, setting, domain, domainSetting) {
  if (!domain) {
    domain = false
  }
  if (!domainSetting) {
    domainSetting = false
  }
  sendMessage("change_setting", {
    newVal,
    setting,
    domain,
    domainSetting
  })
}

function imgSrcToDataURL(src, callback, outputFormat) {
  var img = new Image()
  img.crossOrigin = "Anonymous"
  img.onload = function() {
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

function printAllTabs() {
  chrome.tabs.query({}, function(tabs) {
    for (var i = 0; i < tabs.length; i++) {
      log(tabs[i])
    }
  })
}
