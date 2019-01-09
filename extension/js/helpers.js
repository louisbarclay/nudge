// Extract core domain from URL you want to check
function extractDomain(url) {
  var getLocation = function(href) {
    var location = document.createElement("a");
    location.href = href;
    return location;
  };
  var location = getLocation(url);
  var path = "/" + location.pathname.split("/")[1];
  var domain = location.hostname + path;
  return domain;
}

(function(funcName, baseObj) {
  // The public function name defaults to window.docReady
  // but you can pass in your own object and own function name and those will be used
  // if you want to put them in a different namespace
  funcName = funcName || "docReady";
  baseObj = baseObj || window;
  var readyList = [];
  var readyFired = false;
  var readyEventHandlersInstalled = false;

  // call this when the document is ready
  // this function protects itself against being called more than once
  function ready() {
    if (!readyFired) {
      // this must be set to true before we start calling callbacks
      readyFired = true;
      for (var i = 0; i < readyList.length; i++) {
        // if a callback here happens to add new ready handlers,
        // the docReady() function will see that it already fired
        // and will schedule the callback to run right after
        // this event loop finishes so all handlers will still execute
        // in order and no new ones will be added to the readyList
        // while we are processing the list
        readyList[i].fn.call(window, readyList[i].ctx);
      }
      // allow any closures held by these functions to free
      readyList = [];
    }
  }

  function readyStateChange() {
    if (document.readyState === "complete") {
      ready();
    }
  }

  // This is the one public interface
  // docReady(fn, context);
  // the context argument is optional - if present, it will be passed
  // as an argument to the callback
  baseObj[funcName] = function(callback, context) {
    if (typeof callback !== "function") {
      throw new TypeError("callback for docReady(fn) must be a function");
    }
    // if ready has already fired, then just schedule the callback
    // to fire asynchronously, but right away
    if (readyFired) {
      setTimeout(function() {
        callback(context);
      }, 1);
      return;
    } else {
      // add the function and context to the list
      readyList.push({ fn: callback, ctx: context });
    }
    // if document already ready to go, schedule the ready function to run
    if (document.readyState === "complete") {
      setTimeout(ready, 1);
    } else if (!readyEventHandlersInstalled) {
      // otherwise if we don't have event handlers installed, install them
      if (document.addEventListener) {
        // first choice is DOMContentLoaded event
        document.addEventListener("DOMContentLoaded", ready, false);
        // backup is window load event
        window.addEventListener("load", ready, false);
      } else {
        // must be IE
        document.attachEvent("onreadystatechange", readyStateChange);
        window.attachEvent("onload", ready);
      }
      readyEventHandlersInstalled = true;
    }
  };
})("docReady", window);

function notUndefined(x) {
  if (typeof x === "undefined") {
    return false;
  } else {
    return true;
  }
}

function isUndefined(x) {
  try {
    if (typeof x === "undefined") {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    return true;
  }
}

function popupCenter(url, title, w, h) {
  var dualScreenLeft =
    window.screenLeft != undefined ? window.screenLeft : screen.left;
  var dualScreenTop =
    window.screenTop != undefined ? window.screenTop : screen.top;

  var width = window.innerWidth
    ? window.innerWidth
    : document.documentElement.clientWidth
      ? document.documentElement.clientWidth
      : screen.width;
  var height = window.innerHeight
    ? window.innerHeight
    : document.documentElement.clientHeight
      ? document.documentElement.clientHeight
      : screen.height;

  var left = width / 2 - w / 2 + dualScreenLeft;
  var top = height / 2 - h / 2 + dualScreenTop;
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
  );

  // Puts focus on the newWindow
  if (window.focus) {
    newWindow.focus();
  }
}

function getUrl(path) {
  return chrome.extension.getURL(path);
}

function sendHTMLRequest(url, callback, errorFunction) {
  var request = new XMLHttpRequest();
  request.open("GET", url, true);

  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      // Success!
      var response = request.responseText;
      callback(url, response);
    } else {
      // We reached our target server, but it returned an error
    }
  };

  request.onerror = function() {
    // console.log("Error in HTML request");
    if (errorFunction) {
      errorFunction;
    }
  };

  request.send();
}

function append(parent, newChild) {
  parent.appendChild(newChild);
}

function addCSS(cssId, nudgeUrl) {
  if (!document.getElementById(cssId)) {
    var head = document.getElementsByTagName("head")[0];
    var link = document.createElement("link");
    link.id = cssId;
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = chrome.extension.getURL(nudgeUrl);
    link.media = "all";
    head.appendChild(link);
  }
}

function addScript(scriptId, nudgeUrl, dataObj) {
  if (!document.getElementById(scriptId)) {
    var head = document.getElementsByTagName("head")[0];
    var script = document.createElement("script");
    script.id = scriptId;
    script.type = "text/javascript";
    script.src = chrome.extension.getURL(nudgeUrl);
    if (dataObj) {
      Object.keys(dataObj).forEach(function(key) {
        script.dataset[key] = dataObj[key];
      });
    }
    head.appendChild(script);
  }
}

// Generate userId
function getUserId() {
  // E.g. 8 * 32 = 256 bits token
  var randomPool = new Uint8Array(32);
  crypto.getRandomValues(randomPool);
  var hex = "";
  for (var i = 0; i < randomPool.length; ++i) {
    hex += randomPool[i].toString(16);
  }
  // E.g. db18458e2782b2b77e36769c569e263a53885a9944dd0a861e5064eac16f1a
  return hex;
}

// Checks if object is empty
function isEmpty(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) return false;
  }
  return true;
}

function createEl(parent, type, name) {
  var element = document.createElement(type);
  if (name) {
    element.id = name;
  }
  parent.appendChild(element);
  return element;
}

function deleteEl(element) {
  if (!element || !element.parentNode) {
    return;
  }
  element.parentNode.removeChild(element);
}

// 2 digit slicer
function lastTwo(number) {
  var formattedNumber = ("0" + number).slice(-2);
  return formattedNumber;
}

// Turn lots of seconds into e.g. 10m15s
function logMinutes(time) {
  var minutes = Math.floor(time / 60);
  var seconds = Math.floor(time) % 60;
  return minutes + "m" + lastTwo(seconds) + "s";
}

// Turn lots of seconds into e.g. 10m15s
function logMinutesNoSeconds(time) {
  var minutes = Math.floor(time / 60);
  return minutes + "m";
}

// Text for button
function badgeTime(time) {
  var minutes = Math.floor(time / 60);
  var seconds = Math.floor(time) % 60;
  if (time > 59) {
    return minutes + "m";
  } else {
    return seconds + "s";
  }
}

// Adds together two numbers onto the second
function addTogether(a, b) {
  if (!a || a == "undefined" || a == null) {
    a = 0;
  }
  b = a + b;
  return b;
}

// Add style to document
function styleAdder(name, style, id) {
  var styleText = name + style;
  style = document.createElement("style");
  style.innerHTML = styleText;
  if (id) {
    style.id = id;
  }
  document.head.appendChild(style);
}

function liveUpdate(domain, liveUpdateObj) {
  if (notNonDomain(domain)) {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(
      tabs
    ) {
      if (typeof tabs[0] != "undefined") {
        // Live updater for control center
        chrome.tabs.sendMessage(tabs[0].id, liveUpdateObj);
      }
    });
  }
}

// Send event from content script
function eventLogSender(domain, eventType, detailsObj) {
  if (!detailsObj) {
    detailsObj = false;
  }
  // should be a SENDMESSAGE so it can happen from anywhere in the app
  chrome.runtime.sendMessage({
    type: "event",
    domain,
    eventType,
    detailsObj,
    date: moment().format("YYYY-MM-DD"),
    time: moment()
  }); // needs receiver
}

// Helper to check if key defined
function keyDefined(object, key) {
  if (object[key] !== undefined) {
    return true;
  } else {
    return false;
  }
}

function toggleClass(el, className) {
  if (el.classList) {
    el.classList.toggle(className);
  } else {
    var classes = el.className.split(" ");
    var existingIndex = classes.indexOf(className);
    if (existingIndex >= 0) classes.splice(existingIndex, 1);
    else classes.push(className);
    el.className = classes.join(" ");
  }
}

// Fade out

function fadeOut(el) {
  el.style.opacity = 1;

  (function fade() {
    if ((el.style.opacity -= 0.1) < 0) {
      el.style.display = "none";
    } else {
      requestAnimationFrame(fade);
    }
  })();
}

// Fade in

function fadeIn(el, display) {
  el.style.opacity = 0;
  el.style.display = display || "block";

  (function fade() {
    var val = parseFloat(el.style.opacity);
    if (!((val += 0.1) > 1)) {
      el.style.opacity = val;
      requestAnimationFrame(fade);
    }
  })();
}

function doAtEarliest(callback) {
  document.addEventListener("DOMSubtreeModified", runCallback, false);
  function runCallback() {
    if (document.head) {
      document.removeEventListener("DOMSubtreeModified", runCallback, false);
      callback();
    }
  }
}

function sendMessage(type, object) {
  object.type = type;
  chrome.runtime.sendMessage(object);
}

function switchOffRequest(domain) {
  sendMessage("off", { domain });
}

function el(id) {
  var element = document.getElementById(id);
  return element;
}

// Helper function for chaining
function classList(element) {
  var list = element.classList;
  return {
    toggle: function(c) {
      list.toggle(c);
      return this;
    },
    add: function(c) {
      list.add(c);
      return this;
    },
    remove: function(c) {
      list.remove(c);
      return this;
    }
  };
}

function storeForUse(url, response) {
  url = url.split("/").pop();
  if (typeof tempStorage === 'undefined') {
    // console.log(`Can't find tempStorage`);
  } else {
    tempStorage[url] = response;
  }
}

function appendHtml(parent, childString, callback) {
  if (parent) {
    parent.insertAdjacentHTML("afterbegin", childString);
  }
  if (callback) {
    callback();
  }
}

// Create a random delay between XMLHttpRequests
function randomTime(floor, variance) {
  var ms = 1000;
  return Math.floor(ms * (floor + Math.random() * variance));
}

// optimise mutationObserver https://stackoverflow.com/questions/31659567/performance-of-mutationobserver-to-detect-nodes-in-entire-dom
// especially the point about using getElementById

function fbTokenReady(name, callback) {
  var found = false;

  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      for (var i = 0; i < mutation.addedNodes.length; i++) {
        var node = document.getElementsByName(name);
        node = node[0];
        if (!found && notUndefined(node)) {
          found = true;
          observer.disconnect();
          if (callback) {
            callback(node);
          }
        }
      }
    });
  });

  observer.observe(document, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false
  });
}

function click(x, y) {
  var ev = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true,
    screenX: x,
    screenY: y
  });

  var el = document.elementFromPoint(x, y);

  el.dispatchEvent(ev);
}

function getSettings(callback) {
  chrome.runtime.sendMessage({ type: "settings" }, function(response) {
    callback(response.settings);
  });
}

function changeSettingRequest(newVal, setting, domain, domainSetting) {
  if (!domain) {
    domain = false;
  }
  if (!domainSetting) {
    domainSetting = false;
  }
  sendMessage("change_setting", {
    newVal,
    setting,
    domain,
    domainSetting
  });
}

function imgSrcToDataURL(src, callback, outputFormat) {
  var img = new Image();
  img.crossOrigin = "Anonymous";
  img.onload = function() {
    var canvas = document.createElement("CANVAS");
    var ctx = canvas.getContext("2d");
    var dataURL;
    canvas.height = this.naturalHeight;
    canvas.width = this.naturalWidth;
    ctx.drawImage(this, 0, 0);
    dataURL = canvas.toDataURL(outputFormat);
    callback(dataURL);
  };
  img.src = src;
  if (img.complete || img.complete === undefined) {
    img.src =
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
    img.src = src;
  }
}

function sendData(userId, data, date, url) {
  var sendData = {
    userId,
    date,
    data
  };
  sendData = JSON.stringify(sendData);
  var request = new XMLHttpRequest();
  request.open("POST", config.apiEndpoint + url, true);
  request.setRequestHeader("Content-Type", "application/json");
  request.send(sendData);
}

function printAllTabs() {
  chrome.tabs.query({}, function(tabs) {
    for (var i = 0; i < tabs.length; i++) {
      console.log(tabs[i]);
    }
  });
}
