// Copyright 2016, Nudge, All rights reserved.

// if you get an action surely you can just not look for actions for like 1 min and then start looking again after 1 min

// TODO: gotta do the thing. https://stackoverflow.com/questions/41649874/detect-if-chrome-tab-is-playing-audio
// don't send message if tab is playin audio

function checkVideo() {
  return !!Array.prototype.find.call(document.querySelectorAll('video'),function(elem) {
    return elem.duration > 0 && !elem.paused;
  });
}

setInterval(thing,5000);

function thing() {
  console.log('here' + timeNow())
}

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
    if (checkVideo()) {
      resetTimer();
    } else {
      idle = true;
      chrome.runtime.sendMessage({ type: "tabIdle", status: true }, function(response) {
      });      
      console.log('gone tab idle');
    }
  }

  function resetTimer() {
      if (idle) {
        idle = false;
        chrome.runtime.sendMessage({ type: "tabIdle", status: false }, function(response) {
        });
        console.log('back from tab idle');
      }
      clearTimeout(t);
      t = setTimeout(idleStart, 60000);
  }
}

inactivityTime();


// chrome.tabs.query({ active: true, lastFocusedWindow: true }.
// cancel running it when you move to another tab. maybe have a concept of which the previous tab running it was

// this script will be loaded. so you just have to maybe unhandle all the listeners or something?