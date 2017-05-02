// Copyright 2016, Nudge, All rights reserved.

chrome.storage.sync.get(null, function(items) {
  if (domainChecker(window.location.href, items.domains_setting)) {
    console.log("go");
    init();
  }
});

function init() {
  chrome.runtime.sendMessage({ type: "inject_switch"}, function(response) {
  });
}