// Copyright 2016, Nudge, All rights reserved.
// FIXME: Finishing touch: think about default settings and clean it up

// replace all undefined checks with proper

/*

by end of day:

nudge time out working
10% concept implemented or almost implemented
--
identify non-loaded conditions that nudge can still work under/
	earliest it can possibly work fine. but do that after?

TAB RECORDS. one property is: player.js loaded
    set to true:::: when message comes from tab. goes to tab record and sets that to true

When you want to Nudge:
	check that's true for that tab Id. 
	yes: send nudge
 	no: nudge_loaded. once tab registers as true in tab record - scans for any nudge_loaded
*/

chrome.commands.onCommand.addListener(function(command) {
	  if (command === "tester") {
	  	t1 = n1;
	  	t1.domain = currentTabDomain();
	  	messageSender(n1);
	  }
	}
);

n1 = {
	"time_loaded": timeNow(),
	"type": "visit",
	"status": "pending",
	"amount": 13,
	"send_fails": 0,
	"modal": true		
};

function currentTabDomain() {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			return tabs[0].url;
		}
	);
}

// Init options
init = {
	domains_setting: ["messenger.com", "lingumi.com", "facebook.com","twitter.com", "linkedin.com", "reddit.com", "diply.com", "buzzfeed.com", "youtube.com", "theladbible.com", "instagram.com", "pinterest.com", "theguardian.com", "bbc.com", "bbc.co.uk", "theguardian.co.uk", "dailymail.co.uk", "mailonline.com", "imgur.com", "amazon.co.uk", "amazon.com", "netflix.com", "tumblr.com", "thesportbible.com", "telegraph.co.uk"], 
	scroll_s_setting: 10,
	scroll_b_setting: 3,
	visit_s_setting: 20,
	visit_b_setting: 2,
	time_s_setting: 10,
	time_b_setting: 2,
	compulsive_setting: 10,
	maxnudge_setting: 0,
};

// Initialise current options
curr = {};

var domainsEver = init.domains_setting.slice();

// Populates current options with init or sync settings
function initOptions() {
	Object.keys(init).forEach(function(key, index) {
			if (index + 1 === Object.keys(init).length) {
				optionsUpdater(key, false, true);			
			} else {				
				optionsUpdater(key, false, false);
			}
		}
	);
}

// Should be shared function
function chk() {
	chrome.storage.sync.get(null,function(items) {
		console.log(items);
	});
}


function optionsUpdater(setting, update, defaults) {
	// Define default object
	var settingObj = {};
	settingObj[setting] = init[setting];
	// Run initial grab
	chrome.storage.sync.get(settingObj, function(items) {
			curr[setting] = items[setting];
			if (defaults) {
				setDefaults();
			}
			if (update) {
				if (setting === "compulsive_setting" || setting === "maxnudge_setting") {
					return;
				}
				if (setting === "domains_setting") {
					var domains = curr.domains_setting;
					switch (update.type) {
						case "domains_add":
							domains.push(update.domain);
							domainsEver.push(update.domain);
							break;
						case "domains_remove":
							var index = domains.indexOf(update.domain);
							if (index > -1) {
								domains.splice(index, 1);
							}
							break;
					}
					var domainsObj = {};
					domainsObj[setting] = domains;
					chrome.storage.sync.set(domainsObj);
					return;
				}
			} else {
				chrome.storage.sync.set(settingObj);
			}
		}
	);
}

// TODO: in case someone changes settings (actually don't believe this is necessary)
// 1. have a thing in each domaindata to say last visit nudged etc.
// 2. check that you're definitely > last visit nudged etc.
// 3. make sure that you're at least X where X is the interval setting from last visit nudged
// 4. think that's it!

// Constants (for now)
var minSec = 60;
var sendFailLimit = 5; // Can't be more than 5 because then round doesn't evaluate to nearest minute and you don't hit the modal
var lastSuccessfulNudgeTime = 0; // could consider doing this on a domain by domain basis

var defaultDomainData = {
	last_shutdown: 0,
	last_compulsive: 0,
	totalTimeToday: 0,
	totalVisitsToday: 0,
	secondsIn: 0
};

// Need to figure out which variables really need to be reset daily
// Need to simulate day-switching to see what happens

// Set default settings TODO: need resolution to the domainsEver thing. basically: if domain gets dropped off, should still reset it. etc.
function setDefaults() {
	// Send scroll settings out
	chrome.runtime.sendMessage({type: "scroll_update"}); // TODO: replace with simpler scroll settings
	for (var i = 0; i < curr.domains_setting.length; i++) {
		if (typeof localStorage[curr.domains_setting[i]] === "undefined") {
			localStorage.setItem(curr.domains_setting[i], JSON.stringify(defaultDomainData));
		}
	}
	// Set events default
	if (!localStorage["events"]) {
		var events = [];
		localStorage.setItem("events", JSON.stringify(events));
	}
	// Set events default
	if (!localStorage["nudges"]) {
		var nudges = [];
		localStorage.setItem("nudges", JSON.stringify(nudges));
	}
	// Set nothings default
	if (!localStorage.nothings) {
		localStorage.nothings = 0;
	}
	// Set today's date
	if (!localStorage["date"]) {
		localStorage["date"] = new Date().toLocaleDateString();
	}
}

initOptions();

// Reset data daily
function checkDate() {
	var todayStr = new Date().toLocaleDateString();
	var saved_day = localStorage["date"];
	if (saved_day !== todayStr) {
		// Reset today's data
		for (var i = 0; i < curr.domains_setting.length; i++) { // Would be better to filter in localStorage by object as that type
			var domain = curr.domains_setting[i];
			var domainData = JSON.parse(localStorage[domain]);
			domainData.totalTimeToday = 0;
			domainData.totalVisitsToday = 0;
			localStorage[domain] = JSON.stringify(domainData);
		}
		// Update date
		localStorage["date"] = todayStr;
	}
}

// Extract core domain from URL you want to check
function extractDomain(url) {
		var domain;
		// Find & remove protocol (http, ftp, etc.) and get domain
		if (url.indexOf("://") > -1) {
				domain = url.split('/')[2];
		}
		else {
				domain = url.split('/')[0];
		}
		// Find & remove port number
		domain = domain.split(':')[0];
		return domain;
}

// Take URL, extract core domain, check against domain list, and return domain it matches if true
function inDomainsSetting(url) {
	url = extractDomain(url);
	if (url === "business.facebook.com") {
		return false;
	}
	for (var i = 0; i < curr.domains_setting.length; i++) {
		if (url.match(curr.domains_setting[i])) {
			return curr.domains_setting[i];
		}
	}
	return false;
}

// URL receiver from content script and init options giver
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.type === "scroll" || request.type === "visit" || request.type === "compulsive" || request.type === "time") {
			messageSender(request);
		}
		if (request.type === "player_init") {
			sendResponse({domain: inDomainsSetting(request.url)});
		}
		if (request.type === "update") {
			optionsUpdater(request.setting, true, false);
			// console.log(request);
		}
		if (request.type === "options") {			
			chrome.runtime.openOptionsPage();
		}
		if (request.type === "domains_add") {			
			optionsUpdater("domains_setting", request, false);
			// console.log(request);
		}
		if (request.type === "domains_remove") {			
			optionsUpdater("domains_setting", request, false);
			// console.log(request);
		}
		if (request.type === "fun_name") {			
			sendResponse({name: funNameGetter()});
		}
	}
);

function funNameGetter() {
	var index = Math.floor(Math.random() * funNames_current.length);
	if (funNames_current.length === 0) {
		funNames_current = funNames_init.slice();
	}
	var name = funNames_current[index];
	if (index > -1) {	
		funNames_current.splice(index,1);
	}
	return name;
}

// Nudge logger function
function nudgeLogger(nudgeData) {
	nudges = JSON.parse(localStorage["nudges"]);
	nudges.push(nudgeData);
	if (nudges.length > 300) {
		nudges = nudges.slice(-200); // Make sure nudges isn't too big
	}
	// console.log(nudgeData);
	localStorage["nudges"] = JSON.stringify(nudges);
}

// Collect tab info
var tabIdStorage = {};

// Initial storage of tab info
function flushToTabIdStorage() {
	chrome.tabs.query({}, function (tabs) {
			for (var i = 0; i < tabs.length; i++) {
				tabIdStorage[tabs[i].id] = {
					url: tabs[i].url,
					nudge: false
				};
			}
		console.log(tabIdStorage);
		}
	);
}

flushToTabIdStorage();

// Helper function to check if any tabs match domain
function tabsChecker(tabs, domain) {
	// console.log(tabs);
	for (var i = 0; i < tabs.length; i++) {
		if (inDomainsSetting(tabs[i].url) === domain) {
			return false;
		}
	}
	return true;
}

// TODO: needs getting head around and fixing for new URL rules
// Fire when a tab is closed, and tell when there are no other tabs of that kind
chrome.tabs.onRemoved.addListener(function(tabId) {
		if (tabIdStorage[tabId] === undefined) {
			return;
		} else {
			var tabRecord = tabIdStorage[tabId];
			var domain = inDomainsSetting(tabRecord.url);
			if (domain) {
				chrome.tabs.query({}, function (tabs) {
						if (tabsChecker(tabs, domain)) {
							domainData = JSON.parse(localStorage[domain]);
							domainData.last_shutdown = timeNow();
							localStorage[domain] = JSON.stringify(domainData);
						}
					}
				);
			}
			// This is the part that finds out if there are any other tabs of that kind open. But c'mon, this can be done cleaner and more accurate
			var nudges = JSON.parse(localStorage["nudges"]);
			if (nudges.length > 0) {
				var mostRecentNudge = nudges.slice(-1)[0];
				if (mostRecentNudge.tabId === tabId && (mostRecentNudge.time_executed > (timeNow() - 30 * 1000))) { // can even serve up notifs outside of chrome. maybe that should be the only one. 'quit Chrome to earn your first Nothing'
					localStorage.nothings++; // this will need to be modified, of course, for when you can earn 5 nothings. 
					chrome.notifications.create("",{ // TODO: should probably actually have mostRecentNudge.time_ended instead of mostRecentNudge time executed. can do this
						type: "basic",
						iconUrl: chrome.extension.getURL("nothinglogo.png"),
						title: nothingTitle(localStorage.nothings),
						message: nothingMessage(localStorage.nothings),
						isClickable: true,
						}, function(notificationId) {
							chrome.notifications.onClicked.addListener(function(notificationId) {
									window.open(chrome.extension.getURL("whatisanothing.html"),'_blank');
								}
							);
						}
					);
				}
			}
			delete tabIdStorage[tabId];
		}
	}
);

function nothingTitle(number) {
	if (number == 1) {
		return "You just earned your first Nothing";
	} else {
		return "You just earned one Nothing...";
	}
}

function nothingMessage(number) {
	if (number == 1) {
		return "Why? Because you closed a tab after seeing a nudge. Click for more info.";
	} else {
		return "...which means you now have " + number + " Nothings. Click for more info.";
	}
}

function modalChecker(amount, type) {
	if (type === "visit") {
		if (amount >= curr.visit_s_setting * curr.visit_b_setting) {
			return true;
		} else {
			return false;
		}
	}
	if (type === "time") {
		if (amount >= curr.time_s_setting * minSec * curr.time_b_setting) {
			return true;
		} else {
			return false;
		}
	}
	return false;
}

function timelineObject(domain) {
	return {
		time: timeNow(),
		domain: domain
	};
}

function nudgeObject(domain, amount, type, status) {
	if (!status) {
		status = "pending";
	}
	return {
		"time_loaded": timeNow(),
		"type": type,
		"domain": domain,
		"status": status,
		"amount": amount,
		"send_fails": 0,
		"modal": modalChecker(amount, type)
	};
}

var currentState = new timelineObject(false, "start"); // Why does it have to be 'new' here?

function domainDataTweaker(domain, setting, newValue) {
	var domainData = JSON.parse(localStorage[domain]);
	domainData[setting] = newValue;
	localStorage[domain] = JSON.stringify(domainData);
}

function timelineAdder(domain, onUpdated) {
	// Check for tab 'active' should have been done before calling function!
	if (currentState.domain === domain) {
		return;
	} else {
		var lastState = currentState;
		if (domain) {
			if (inWindow) {
				// Set the new currentState
				currentState = timelineObject(domain);
				// Add a visit and check compulsive
				domainVisitUpdater(domain, currentState.time, onUpdated);
				if (lastState.domain) {
					domainTimeUpdater(lastState.domain, currentState.time, lastState.time);
				}
				console.log(currentState);
			}
			return;
		} else {
			// Set the new currentState
			currentState = timelineObject(domain);
			console.log(currentState);
			if (lastState.domain) {
				domainTimeUpdater(lastState.domain, currentState.time, lastState.time);
			}
		}
	}
}

function domainTimeUpdater(domain, startTime, endTime) {
	var domainData = JSON.parse(localStorage[domain]);
	domainData.totalTimeToday += (startTime - endTime);
	domainData.secondsIn = 0;
	localStorage[domain] = JSON.stringify(domainData);
}


// ths is for any time that the domain visit is updated! doesn't care if it's a tab update or whatever!
function domainVisitUpdater(domain, time, onUpdated) {
	var domainData = JSON.parse(localStorage[domain]);
	domainData.totalVisitsToday++;
	console.log(domain, domainData.totalVisitsToday);
	var compulsiveSearch = (time - curr.compulsive_setting * minSec * 1000);
	// Set the two conditions for nudging 
	var compulsive = (domainData.last_shutdown !== 0 && domainData.last_shutdown > compulsiveSearch && domainData.last_compulsive < domainData.last_shutdown);
	var visits = (domainData.totalVisitsToday % curr.visit_s_setting === 0);
	// Set the visits status
	var visitsStatus = "pending";
	if (compulsive && onUpdated) {
		domainData.last_compulsive = time;
		console.log(domainData.last_compulsive);
		visitsStatus = "prefailed";
		messageSender(nudgeObject(domain, (Math.round((timeNow() - domainData.last_shutdown) / 1000)), "compulsive"));
	}
	if (visits) {
		messageSender(nudgeObject(domain, domainData.totalVisitsToday, "visit", visitsStatus));	
	}
	localStorage[domain] = JSON.stringify(domainData);
}

var inWindow = false;

function domainTimeNudger() {
	if (currentState.domain) {
		var domainData = JSON.parse(localStorage[currentState.domain]);
		domainData.secondsIn++;
		var totalTimeTodayTemp = domainData.secondsIn + Math.round(domainData.totalTimeToday/1000);
		if (totalTimeTodayTemp % (curr.time_s_setting * minSec) === 0) {
			messageSender(nudgeObject(currentState.domain, totalTimeTodayTemp, "time"));
		}
		localStorage[currentState.domain] = JSON.stringify(domainData);
	}
}

function windowChecker() {
	// Make sure 'today' is up-to-date
	checkDate(); // FIXME: has to be a better way to do this
	// Run the counter on the current site
	domainTimeNudger();
	// Check - is TabId of a background extension thing? TODO: THIS to get rid of annoying error
	// Have to factor in when you are scrolling on window despite window not being selected...............ask content script
	chrome.windows.getLastFocused(function (window) {
			if (typeof window == 'undefined' || window.focused === false) {
				if (inWindow) {
					inWindow = false;
					timelineAdder(false);
				}
				return;
			}
			// if the tab is one that's loaded with a delayed nudge, run that fuckin' delayed nudge.
			// in this space here
			// if you check the tab register and the tab ID has a nudge waiting to go out.
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
					var nudge = tabIdStorage[tabs[0].id[nudge]];
					if (nudge) {
						messageSender(nudge);
					}
					if (!inWindow) {
						inWindow = true;
						if (typeof tabs[0] != 'undefined') {
							var domain = inDomainsSetting(tabs[0].url);
						} else {
							var domain = false;
						}
						timelineAdder(domain);
					}
				}
			);
			return;
		}
	);
}

// Add to timeline on window in and window out
setInterval(windowChecker, 1000);

// Add to timeline onStateChanged
chrome.idle.onStateChanged.addListener(function(newState) { // TODO: needs checking
		if (newState !== "active") {
			isWindow = false;
			timelineAdder(false);
		}
	}
);

// Add to timeline onActivated
chrome.tabs.onActivated.addListener(function(activatedTab) {
		chrome.tabs.get(activatedTab.tabId, function(tabDetails) {
				// Don't need check of whether tab is active, because it is by default
				var domain = inDomainsSetting(tabDetails.url);
				timelineAdder(domain);
			}
		);
	}
);

// Add to timeline onUpdated
// Update URL in tabIdStorage
// URL constantiser
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
		// New record in tabIdStorage
		tabIdStorage[tabId] = {
			url: tab.url,
			nudge: false
		};
		var domain = inDomainsSetting(tab.url);
		if (tab.status === "active") {
			timelineAdder(domain, true);
		}
		// For constantising titles
		if (domain && changeInfo.title) {
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
					if (tabs[0] !== undefined) {
						chrome.tabs.sendMessage(tabs[0].id, {
							"type": "title",
							"title": changeInfo.title,
							"domain": domain
						}, function(response) {
							}
						);
					}
				}
			);
		}
		// For sending favicon URL
		if (domain && tab.favIconUrl) {
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
					if (tabs[0] !== undefined) {
						chrome.tabs.sendMessage(tabs[0].id, {
							"type": "favicon",
							"favicon": tab.favIconUrl,
						}, function(response) {
							}
						);
					}
				}
			);
		}
	}
);

// Sending to player.js but how does it know it's dealing with the right tab? Tab id should come from nudge.
// and there should be check onactive and currentwindow just to be 100% sure. those two should be baked in to the nudge

/*
tab that is ACTIVE does something noteworthy. HAS to be active.
sendsMessage. with tab ID of course
messageSender checks if that tab is still active
checks if TAB IS READY= ======= so, has the tab sent the thing to say it's ready?
		------ or rather, sends message once tab is ready. puts a listener on it
		------ (tab gets set to NOT READY if tabUpdate and the JS goes... how do we know that?!)
*/

// FIXME: should be checking if tab complete, if tab active, etc. etc.

// FIXME: whole favicon area still not good enough! solve this with a 'image caching' script that has nothing to dooooo with the player.js
// this script would ask bg.js what the favicon is. if it shows blank, it would .
// CANCEL: Or rather, bg.js would pass the favicon url for caching as SOON as it gets it. from onUpdated. and STILL NEED 'this site' fallback eh. so...TODO: make the modal nudge bigger
// also: should only SHOW nudge AFTER all the elements are loaded. obviously. in other words, only PLAY once everything loaded. ideally as callback

// Send message to player.js
function messageSender(object) {
	if (object.status === "prefailed" || object.status === "timeout") {
		object.time_executed = timeNow();
		nudgeLogger(object);
	} else if (tooSoonChecker()) {
		object.time_executed = timeNow();
		object.status = "too_soon";
		nudgeLogger(object);
	} else {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				// Send message to the tab here
				chrome.tabs.sendMessage(tabs[0].id, {type: "ready_check"}, function(response) {
						if (response.type) {
							// object.favicon = tabs[0].favIconUrl;
							chrome.tabs.sendMessage(tabs[0].id, object, function(response) {
									// console.log("sentobject", object);
									if (response) {
										object.time_executed = response.time_executed;
										object.status = response.status;
										object.tabId = tabs[0].id;
										lastSuccessfulNudgeTime = response.time_executed;
										nudgeLogger(object);
									} else if (object.send_fails < sendFailLimit) {
										object.send_fails++;
										messageSender(object);
										// console.log("SEND_FAIL" + object.send_fails);
										// console.log(tabs[0].id);
									} else {
										object.status = "failed";
										// console.log("MAJOR_FAIL");
										nudgeLogger(object);
										// console.log(tabs[0].id);
									}
								}
							);
						} else {
							var tabRecord = tabIdStorage[tabs[0].id];
							tabRecord.nudge = object;
							console.log(tabIdStorage[tabs[0].id]);
							// delay to the next second, provided that in the next second,
							// you're still on the same tab. if not, just cancel it?
							// so...... load the tab ID with the nudge to come (the whole object!)
							// then the every-seconder asks the current selected tab if there is a nudge waiting, in which case it messageSends
						}
					}
				);
			}
		);
	}
}

// Is it too soon to nudge?
function tooSoonChecker() {
	nudges = JSON.parse(localStorage["nudges"]);
	if (nudges.length === 0) {
		return false;
	}
	if (lastSuccessfulNudgeTime > (timeNow() - curr.maxnudge_setting)) {
		return true;
	} else {
		return false;
	}
}

// Time generator
function timeNow() {
	var time = new Date();
	time = time.getTime();
	return time;
}

// Let's have some fun with some FUN NAMES
var funNames_init = [
	"Barack Obama",
	"Kim Kardashian",
	"Kanye West",
	"Justin Bieber",
	"Mark Zuckerberg",
	"George Clooney",
	"Amal Clooney",
	"Brad Pitt",
	"Angelina Jolie",
	"Leonardo DiCaprio",
	"Chris Pratt",
	"Amy Schumer",
	"Adele",
	"Vladimir Putin",
	"Lindsay Lohan",
	"Sandra Bullock",
	"Taylor Swift",
	"Beyonc&eacute;",
	"Jay Z",
	"Harrison Ford",
	"Tim Cook",
	"Peter Thiel",
	"J.K. Rowling",
];

var funNames_current = funNames_init.slice();