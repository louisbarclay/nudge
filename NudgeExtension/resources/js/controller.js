// Copyright 2016, Nudge, All rights reserved.

var offSwitch = true;

chrome.storage.sync.get(null, function(items) {
  if (domainChecker(window.location.href, items.domains_setting)) {
    if (offSwitch) {
	  init();	
    }
    tabIdler();
  }
});

if (domainChecker(window.location.href, ["facebook.com"])) {
  fbunfollow();
} else {
  console.log("didnt eval");
}

function init() {
  chrome.runtime.sendMessage({ type: "inject_switch"}, function(response) {
  });
}

function fbunfollow() {
  chrome.runtime.sendMessage({ type: "inject_fbunfollow"}, function(response) {
  });
}

function tabIdler() {
  chrome.runtime.sendMessage({ type: "inject_tabidler"}, function(response) {
  });
}