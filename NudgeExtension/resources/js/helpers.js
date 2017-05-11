// Copyright 2016, Nudge, All rights reserved.

// Extract core domain from URL you want to check
function extractDomain(url) {
  var domain;
  // Find & remove protocol (http, ftp, etc.) and get domain
  if (url.indexOf("://") > -1) {
    domain = url.split('/')[2];
  } else {
    domain = url.split('/')[0];
  }
  // Find & remove port number
  domain = domain.split(':')[0];
  return domain;
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

// Helper - gets random from array
function randomGetter(init,current) {
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

function copyText() {
  var copyText = createEl(document.body, 'textArea', 'copyText');
  var selection = $('#copyText').val(nudgeLink).select();
  document.execCommand('copy');
  selection.val('');
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
  return minutes + 'm' + lastTwo(seconds) + 's';
}

// Turn time to date
function epochToDate(time) {
  if (time > 9999999999) {
    time = time/1000;  
  }
  var d = new Date(0);
  d.setUTCSeconds(time);
  var monthNames = [
    "Jan", "Feb", "Mar",
    "Apr", "May", "Jun", "Jul",
    "Aug", "Sep", "Oct",
    "Nov", "Dec"
  ];
  var day = d.getDate();
  var monthIndex = d.getMonth();
  var hours = d.getHours();
  var minutes = d.getMinutes();
  var seconds = d.getSeconds();  
  var year = d.getFullYear();
  return hours + ":" + lastTwo(minutes) + ":" + lastTwo(seconds)/* + ' ' + lastTwo(day) + '-' + monthNames[monthIndex] + '-' + lastTwo(year)*/;
}


function initOff() {
  chrome.runtime.sendMessage({
    type: "off"
  });
}