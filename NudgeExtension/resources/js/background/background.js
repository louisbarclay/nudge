// Copyright 2016, Nudge, All rights reserved.

// // This gets added to localStorage and sent to server
// history: [], // TODAY: shutdowns. nudgeShutdowns. time: 0, visits: 0,
// // visits (array. time started. time (length). number, in the day that is)
// last_shutdown: 0,
// last_compulsive: 0,
// last_nudge: 0,
// secondsIn: 0
// "outOfWindow", // don't put here? create for first time when running domain stuff?
// "idle", // don't put here? create for first time when running domain stuff?
// 'notDomain' + random hash? eventually?

// TODO: need security around this!
function initialise() {
  chrome.storage.sync.get(null, function(items) {
    // If items.settings doesn't exist, the user is old school style
    // This must hardly ever trigger!
    if (isEmpty(items.settings)) {
      // Clear localStorage
      localStorageClear();
      // Clear syncStorage
      syncStorageClear();
      storageSet(
        {
          settings: initSettings(),
          journey: { hasSeenTour: false }
        },
        syncSettingsLocal
      );
    } else {
      // If items.settings does exist, there is stuff there we need to grab
      syncSettingsLocal();
      // Where do you sync the domain list from? Surely you must keep in settings?
    }
  });
}

initialise();

// Add to timeline on window in and window out
setInterval(everySecond, 1000);

// receptors on each of the js files. they say 'these are options i care about'. and they say 'this is my domain. if you change it, i need to know'
// for control

// TODO: if you hit switch off: also switch off all other instances of that domain?

// init:
// check if there is a username in sync settings (user: )
// if not, clear all settings; then set defaults. one time operation here. apologise?
// if yes, update with values from sync

// set defaults:
// grab all domains. forEach domain sync.storage object (name is that domain). isOff, isNudged, etc. properties.

// change option
// always receive from somewhere
// tell chrome.sync to change
// send message out to everywhere saying it's changed
//

// option to set all domains to off in one go
// make the switch back on thing harder?

// STUFF TO PASS INFO ON:
// number of facebook friends - each day. no. of friends and friends followed. or something.
// that stuff you know.
// you'll be able to see for existing users whether they 'probably' used the unfollow everything feature.
// you'll be able to see people's daily interactions with the app (if they even have it switched on)
// worth getting the info on how many friends people are currently following.

// TODO: in case someone changes settings (actually don't believe this is necessary)
// 1. have a thing in each domaindata to say last visit nudged etc.
// 2. check that you're definitely > last visit nudged etc.
// 3. make sure that you're at least X where X is the interval setting from last visit nudged
// 4. think that's it!

// Need to simulate day-switching to see what happens

// just find the domain. is there the current date there? new Date().toLocaleDateString(); if not, set it, add first value. if yes
// grab it, add onto it, set it again. straight in the stuff though eh.

// Set the initial currentState
var currentState = new timelineObject(false, "initial");

// initial timelineadder

// Lots of places will do a timelineAdder and they all come together, with extra jobs (see in function) depending on what
// change so that you ask what domain is. if false you do a domainvisitupdater for a $inChromeFalseDomain
// if true you ask if $notInChrome or $idle
// you have all the info here that you need. you even have source

// but those operate as safeguards

function timeline(domain, source) {
  console.log(domain, source);
  // if currentState.time is not the same day as today
  // does the date now exist?
  // If your timeline event has same domain as before, you do nothing
  if (currentState.domain === domain) {
    return;
    // If your timeline event has different domain to before... UNLESS YOU ARE ON A DIFFERENT DAY! does this mean needing to keep currentState in memory?
  } else {
    // First, create new variable lastState, which is what we had before the changes we're about to make
    var lastState = currentState;
    currentState = timelineObject(domain, source);
    // Update time (close off visit)
    domainTimeUpdater(lastState.domain, lastState.time, currentState.time, source);
    // Update visit
    domainVisitUpdater(domain, currentState.time, source);
    return;
  }
}

// timelineAdder test
function timelineAdderTest() {
  function runAfter(initial, callback) {
    initial();
    setTimeout(callback, 1000);
  }
}
