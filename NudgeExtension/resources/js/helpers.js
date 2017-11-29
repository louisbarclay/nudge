// Copyright 2016, Nudge, All rights reserved.

// Extract core domain from URL you want to check
function extractDomain(url) {
  var domain;
  // Find & remove protocol (http, ftp, etc.) and get domain
  if (url.indexOf("://") > -1) {
    domain = url.split("/")[2];
  } else {
    domain = url.split("/")[0];
  }
  // Find & remove port number
  domain = domain.split(":")[0];
  return domain;
}

function notUndefined(x) {
  if (typeof x === "undefined") {
    return false;
  } else {
    return true;
  }
}

function extractHostname(url) {
  var hostname;
  // Find and remove protocol (http, ftp, etc.) and get hostname
  if (url.indexOf("://") > -1) {
    hostname = url.split("/")[2];
  } else {
    hostname = url.split("/")[0];
  }
  // Find and remove port number
  hostname = hostname.split(":")[0];
  // Find and remove "?"
  hostname = hostname.split("?")[0];
  return hostname;
}

function extractRootDomain(url) {
  var domain = extractHostname(url),
    splitArr = domain.split("."),
    arrLen = splitArr.length;
  // Extracting the root domain here
  // If there is a subdomain
  if (arrLen > 2) {
    domain = splitArr[arrLen - 2] + "." + splitArr[arrLen - 1];
    // Check to see if it's using a CCTLD, i.e. ".me.uk"
    if (splitArr[arrLen - 1].length == 2 && splitArr[arrLen - 1].length == 2) {
      // This is using a CCTLD
      domain = splitArr[arrLen - 3] + "." + domain;
    }
  }
  return domain;
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

// Helper function ordinal number parser
function ordinal(i) {
  var j = i % 10,
    k = i % 100;
  if (j == 1 && k != 11) {
    return i + "st";
  }
  if (j == 2 && k != 12) {
    return i + "nd";
  }
  if (j == 3 && k != 13) {
    return i + "rd";
  }
  return i + "th";
}

// Helper second to minute parser
function minutes(i) {
  if (i >= 105) {
    return Math.round(i / 60) + " minutes";
  } else if (i === 1) {
    return "one second";
  } else if (i < 45) {
    return Math.round(i) + " seconds";
  } else if (i < 60) {
    return "a minute";
  } else if (i < 105) {
    return "2 minutes";
  } else {
    // console.log("minute function didn't work");
  }
}

// Helper time generator
function timeNow() {
  var time = new Date();
  time = time.getTime();
  return time;
}

// Take URL, extract core domain, check against array, and return domain it matches if true. Return false otherwise
function domainChecker(url, array) {
  url = extractDomain(url);
  if (url === "business.facebook.com") {
    return false;
  }
  for (var i = 0; i < array.length; i++) {
    if (url.match(array[i])) {
      return array[i];
    }
  }
  return false;
}

// Checks if object is empty
function isEmpty(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) return false;
  }
  return true;
}

// Helper - gets random from array
function randomGetter(init, current) {
  var index = Math.floor(Math.random() * current.length);
  if (current.length === 0) {
    for (var i = 0; i < init.length; i++) {
      current.push(init[i]);
    }
    console.log(current);
  }
  var name = current[index];
  if (index > -1) {
    current.splice(index, 1);
  }
  return name;
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

var nudgeLink = "http://bit.ly/2gFsVrf";

function ifDoesntExistMakeZero(a, b) {
  if (!a || a == "undefined" || a == null) {
    return b;
  } else {
    return a;
  }
}

function copyText() {
  var copyText = createEl(document.body, "textArea", "copyText");
  var selection = $("#copyText")
    .val(nudgeLink)
    .select();
  document.execCommand("copy");
  selection.val("");
  deleteEl(copyText);
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
function styleAdder(id, style, log) {
  var styleText = id + style;
  style = document.createElement("style");
  style.innerHTML = styleText;
  document.head.appendChild(style);
  if (log) {
    console.log(styleText);
  }
}

// Run when an element is ready
function whenElementReady(callback) {
  $(document).ready(function() {
    callback();
  });
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
    date: todayDate(),
    time: timeNow()
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

// Returns today's date
function todayDate(yesterday) {
  var d = new Date();
  if (yesterday) {
    d.setDate(d.getDate() - 1);
  }
  var day = d.getDate();
  var monthIndex = d.getMonth();
  var year = d.getFullYear();
  return lastTwo(day) + "-" + monthNames[monthIndex] + "-" + lastTwo(year);
}

// Turn time to date
function epochToDate(time) {
  if (time > 9999999999) {
    time = time / 1000;
  }
  var d = new Date(0);
  d.setUTCSeconds(time);
  var day = d.getDate();
  var monthIndex = d.getMonth();
  var hours = d.getHours();
  var minutes = d.getMinutes();
  var seconds = d.getSeconds();
  var year = d.getFullYear();
  return (
    hours +
    ":" +
    lastTwo(minutes) +
    ":" +
    lastTwo(
      seconds
    ) /* + ' ' + lastTwo(day) + '-' + monthNames[monthIndex] + '-' + lastTwo(year)*/
  );
}

// Turn time to minute and second past hour
function epochToMinSec(time) {
  if (time > 9999999999) {
    time = time / 1000;
  }
  var d = new Date(0);
  d.setUTCSeconds(time);
  var day = d.getDate();
  var monthIndex = d.getMonth();
  var hours = d.getHours();
  var minutes = d.getMinutes();
  var seconds = d.getSeconds();
  var year = d.getFullYear();
  return (
    lastTwo(minutes) +
    "m" +
    lastTwo(
      seconds
    ) + 
    's' /* + ' ' + lastTwo(day) + '-' + monthNames[monthIndex] + '-' + lastTwo(year)*/
  );
}

var monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];

function initOff() {
  chrome.runtime.sendMessage({
    type: "off"
  });
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
