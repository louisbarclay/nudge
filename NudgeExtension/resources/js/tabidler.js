// Copyright 2016, Nudge, All rights reserved.

// Not using this - for detecting tab focus

// var focused = true;

// window.onfocus = function() {
//     focused = true;
//     console.log("focused");
// };

// window.onblur = function() {
//     focused = false;
//     console.log("not focused");
// };

// if you get an action surely you can just not look for actions for like 1 min and then start looking again after 1 min

function inactivityTime() {
  var idle = false;
  var t;
  window.onload = resetTimer;
  // DOM Events
  document.onmousemove = resetTimer;
  document.onkeypress = resetTimer;
  document.onmousedown = resetTimer; // touchscreen presses
  document.ontouchstart = resetTimer;
  document.onclick = resetTimer; // touchpad clicks
  document.onscroll = resetTimer; // scrolling with arrow keys
  document.onkeypress = resetTimer;
  function idleStart() {
    idle = true;
    chrome.runtime.sendMessage({ type: "tabIdle", status: true }, function(response) {
    }); 
  }

  function resetTimer() {
      if (idle) {
        idle = false;
        chrome.runtime.sendMessage({ type: "tabIdle", status: false }, function(response) {
        });
      }
      clearTimeout(t);
      t = setTimeout(idleStart, 60000);
  }
}

inactivityTime();


// only run this if the tab is 
// chrome.tabs.query({ active: true, lastFocusedWindow: true }.
// cancel running it when you move to another tab. maybe have a concept of which the previous tab running it was

// this script will be loaded. so you just have to maybe unhandle all the listeners or something?