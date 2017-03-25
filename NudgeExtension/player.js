// Copyright 2016, Nudge, All rights reserved.

/*

look up exponential back off.
5 times is fine, most people just try once.
You could try once, then try again but after a longer wait.
That's back-off.
He asks what the reasons are that it fails- perhaps it means it won't work ever?
So you need to dig deeper into failure conditions

Try putting in console logs for various load points
Like if you move the order of things / delay it, does it run every time

you have reached the point where you need to start using source control

just had a few more great ideas on how to debug inspired by this convo, i think i need to basically have a 'pretend as if nudge event happened' function on keypress, which does the whole background.js to player.js message sending thing. if i keep on trying that under tons of different page loading scenarios, i'll be able to create fuck ups to solve

and at the same time, i should have a much easier way to debug the first part - the 'thing that causes nudge event to trigger'

*/

// Modal default messages
var modal_test = 'You&rsquo;ve scrolled <div id="m_message1_box">180 screens</div> down <div id="m_message1_favicon" style="background: url(https://assets.guim.co.uk/images/favicons/79d7ab5a729562cebca9c6a13c324f0e/32x32.ico) 32px/32px"></div>.<div id="m_message1_cog"></div>';
var modal_earn_nothing = '<div id="m_message2_contents">Close tab to earn 1 <a href="' + chrome.extension.getURL("whatisanothing.html") + '" target="_blank" id="m_link_nothing">Nothing</a></div></div>';
var modal_hide = 'Press &rsquo;Esc&rsquo; or click outside Nudge to hide';

var facebookBlurSetting = true;

if (document.getElementById('contentCol')) {
  var fbContentCol = document.getElementById('contentCol');
  var fbLeftCol = document.getElementById('leftCol');
  if (!facebookBlurSetting) {
    fbContentCol.style = "filter: blur(0px)";
    fbLeftCol.style = "filter: blur(0px)";
  }
}

function kickstarter() {
	chrome.runtime.sendMessage({type: "player_init", url: document.URL}, function(response) {
			if (!response.domain) {
				throw new Error("cancel_player");
			} else {
				listener();
				domain = response.domain;
				return domain;
			}
		}
	);
}

function optionsUpdater() {
	var settingObj = {};
	settingObj.scroll_s_setting = init.scroll_s_setting;
	settingObj.scroll_b_setting = init.scroll_b_setting;
	chrome.storage.sync.get(settingObj, function(items) {
			scroll_s_setting = items.scroll_s_setting;
			scroll_b_setting = items.scroll_b_setting;
		}
	);
}

init = {
	scroll_s_setting: 10,
	scroll_b_setting: 2,
};

var scroll_s_setting = 0;
var scroll_b_setting = 0;
var last_scroll_screens_hit = 0;
var domain = "";

kickstarter();
optionsUpdater();

// Scroll caller
$(window).scroll(function() {
		chrome.runtime.sendMessage({scroll: true});
		var scrollPixels = $(window).scrollTop();
		scrollScreens = Math.round(scrollPixels / screen.height);
		if ((scrollScreens % scroll_s_setting === 0) && (scrollScreens > last_scroll_screens_hit)) {
			var modal = false;
			if (scrollScreens >= (scroll_s_setting * scroll_b_setting)) {
				modal = true;
			}
			var scrollData = {
				"time_loaded": timeNow(),
				"type": "scroll",
				"domain": domain,
				"status": "pending",
				"amount": scrollScreens,
				"send_fails": 0,
				"modal": modal
			};
			nudgeSender(scrollData);
			last_scroll_screens_hit = scrollScreens;
		}
	}
);

// Nudge sender
function nudgeSender(nudge) {
	chrome.runtime.sendMessage(nudge);
}

// Testing UI elements
function uiPlayer() {
	// messageCompiler(dummyNudge);
	nudgeSender(dummyNudge);
	// modal("zoopla.co.uk", modal_test,modal_earn_nothing,modal_hide,"time");
}

// Manual UI Player function
if (window.addEventListener) {
		var letters = [], prompt = ["z","x"];
		window.addEventListener("keydown", function(e) {
				letters.push(e.key);
					if ([letters.slice(-2)[0],letters.slice(-1)[0]].toString() === prompt.toString()) {
					uiPlayer();
				} 
		}, true);
}

var defaultMessage = 'This is the <div id="d_message_box">default message</div> <div id="d_message_favicon"></div>';

// Safeguard: amounts should be high enough
// This whole redirection part with the switch case feels inefficient
// TODO: should always call sendMessage with SOMETHING
function listener() {
	chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			if (request.type === "ready_check") {
				sendResponse({type: true});
				return;
			}
			if (request.type === "scroll_update") {
				scrollSArray = request.scrollS;
				scrollBArray = request.scrollB;
				console.log(request);
				scrollCheckerUpdater(scrollSArray, scrollScreens);
				return;
			}
			if (document.URL.match(request.domain)) { // This is not OK - you're matching URL against domain, without having extracted core domain from URL first
				$(document).ready(function() {
						if (request.type === "title") {
							document.title = titleConstantizer(request.domain);
						} else {
							messageCompiler(request); // Wow, this is running way too often. FIXME:!!!!!!!
						}
					}
				);
			} else {
				sendResponse({"time_executed": timeNow(), "status": "url_mismatch"});
			}
			sendResponse({"time_executed": timeNow(), "status": "succeeded"});
		}
	);
	// AM READY FOR STUFF!!!!!!!!!!!!!!!!!!!! TODO: send message from here
}

// =================================================================

// Dummy nudges
var dummyNudge = {
	"time_loaded": timeNow(),
	"type": "visit",
	"domain": domain,
	"status": "executed",
	"amount": 15,
	"send_fails": 0,
	"modal": false,
	"favicon": 'https://www.facebook.com/rsrc.php/yl/r/H3nktOa7ZMg.ico'
};

console.log(faviconUrl);

// Message compiler
function messageCompiler(request) {
	// Define helper variables
	// TODO: logic for if no favicon
	box_m = '<div id="m_message1_box">';
	box_d = '<div id="d_message_box">';
	ord_amount = ordinal(request.amount);
	min_amount = minutes(request.amount);
	amount = request.amount;
	end_div = '</div>';
	if (faviconUrl === "") {
		favicon_m = 'this site';
		favicon_d = 'this site';
	} else {
		bg = 'background: url(' + faviconUrl + ') 32px/32px';
		favicon_m = '<div id="m_message1_favicon" style="' + bg + '"></div>';
		favicon_d = '<div id="d_message_favicon" style="' + bg + '"></div>';
	}
	cog_m = '<div id="m_message1_cog"></div>';
	cog_d = '<div id="d_message_cog"></div>';
	// Set up false message variable
	var message = false;
	// Define cases
	if (!request.modal) {
		switch (request.type) {
			case "visit":
				message = box_d + ord_amount + ' visit' + end_div + ' to ' + favicon_d + ' today. ' + cog_d;
				break;
			case "time":
				message = box_d + min_amount + end_div + ' on ' + favicon_d + ' today. ' + cog_d;
				break;
			case "scroll":
				message = 'Scrolled ' + box_d + amount + " screens" + end_div + ' down ' + favicon_d + '.' + cog_d;
				break;
			case "compulsive":
				message = 'Quit ' + favicon_d + ' ' + box_d + min_amount + end_div + ' ago. ' + cog_d;
				break;
			default:
				console.log("nothing matched");
		}
		if (message) {
			drawer(request.domain, message, request.type);
		}
	} else {
		switch (request.type) {
			case "visit":
				message = "This is your " + box_m + ord_amount + ' visit' + end_div + ' to ' + favicon_m + ' today.' + cog_m;
				break;
			case "time":
				message = "You&rsquo;ve been on " + favicon_m + ' for ' + box_m + min_amount + end_div + ' today.' + cog_m;
				break;
			case "scroll":
				message = "You&rsquo;ve scrolled " + box_m + amount + " screens" + end_div + ' down ' + favicon_m + '.' + cog_m;
				break;
			default:
				console.log("nothing matched");
		}
		if (message) {
			modal(request.domain, message, modal_earn_nothing, modal_hide, request.type);
		}
	}
}

// TODO: scroll needs to inform of a nudge, or rather check before it does it what the most recent nudge was. and also inform. both things
// TODO: need to inform the nudge register every time there is a scroll nudge.

function createEl(parent, type, name) {
	var element = document.createElement(type);
	if (name) {
		element.id = name;
	}
	parent.appendChild(element);
	return element;
}

function deleteEl(element) {
	element.parentNode.removeChild(element);
}

// change id of the element so that the popup only works on the friend one :)
// need to pass 'domain' into here
function modal(domain, message1, message2, message3, type) {
	var previous_nudge_m = document.getElementById("nudge_m");
	if (previous_nudge_m) {
		deleteEl(previous_nudge_m);
	}
	var clickNumber = 1;
	var nudge_m = createEl(document.body,"div","nudge_m");
	var m_background = createEl(nudge_m,"div","m_background");
	var m_container = createEl(nudge_m,"div","m_container");
	var m_wrapper = createEl(m_container,"div","m_wrapper");
	var m_contents = createEl(m_wrapper,"div","m_contents");
	var m_icon = createEl(m_contents,"div","m_icon");
	var m_message1 = createEl(m_contents,"div","m_message1");
	var m_message1_contents = createEl(m_message1,"div","m_message1_contents");
	var m_message2 = createEl(m_contents,"div","m_message2");
	var m_message3 = createEl(m_wrapper,"div","m_message3");
	m_message1_contents.innerHTML = message1;
	m_message2.innerHTML = message2;
	m_message2_contents = document.getElementById('m_message2_contents');
	m_message3.innerHTML = message3;
	m_icon.style.background = bgPicker(type);
	$(document).keyup(closekey);
	function closekey(e) {
		if (e.keyCode === 27) {
			deleteEl(nudge_m);
			$(document).unbind("keyup", closekey);
			$(document).off("click", handler);
		}
	}
	$(function(){
	  	$("#nudge_m").on('click', '#m_wrapper #m_contents #m_message1_cog', function(){
	   			modalMessagePlayer(m_message2_contents,clickNumber, domain);
	   			clickNumber++;
	  		}
	  	);
		}
	);
	$(document).on("click", handler);
}

var handler = function(event) {
  if($(event.target).is("#m_contents, #m_contents *")) return;
  deleteEl(nudge_m);
  $(document).off("click", handler);
};

// need to pass 'domain' in here
function drawer(domain, message, type) {
	var clickNumber = 1;
	var canDelete = true;
	// Create all divs
	var nudge_d = createEl(document.body,"div","nudge_d");
	var d_wrapper = createEl(nudge_d,"div","d_wrapper");
	var d_container = createEl(d_wrapper,"div","d_container");
	var d_close = createEl(d_container,"div","d_close");
	var d_message = createEl(d_container,"div","d_message");
	var d_icon_lhs = createEl(d_message,"div","d_icon_lhs");
	var d_message_bottom = createEl(d_message,"div","d_message_bottom");
	var d_message_rhs = createEl(d_message,"div","d_message_rhs");
	var d_message_favicon = createEl(d_message_rhs,"div","d_message_favicon");
	// Tie up loose ends
	d_message_rhs.innerHTML = message;
	d_icon_lhs.style.background = bgPicker(type);
	d_message_bottom.innerHTML = '<div id="d_message_bottom_contents">Close tab to earn your first <a href="' + chrome.extension.getURL("whatisanothing.html") + '" target="_blank" id="d_link_nothing">Nothing</a>!</div>';
	d_message_bottom_contents = document.getElementById('d_message_bottom_contents');	
	// Initialise
	d_wrapper.classList.add('d_wrapper_in');
	d_close.classList.add('d_close_fade_in');
	// Tell me if I can delete
	$(nudge_d)
		.mouseenter(function() {
				canDelete = false;
			}
		)
		.mouseleave(function() {
				canDelete = true;
			}
		);
	$(function(){
	  	$(nudge_d).on('click', '#d_message_cog', function(){
	   			drawerMessagePlayer(d_message_bottom_contents,clickNumber, domain);
	   			clickNumber++;
	  		}
	  	);
		}
	);
	// Remove function
	function remover() {
		if (!nudge_d) {
			return;
		}
		d_wrapper.classList.remove('d_wrapper_in');
		d_close.classList.remove('d_close_fade_in');
		d_wrapper.classList.add('d_wrapper_out');
		d_close.classList.add('contents_fade_out');
		d_message_rhs.classList.add('contents_fade_out');
		d_message_bottom.classList.add('contents_fade_out');		
		setTimeout(function() {
				deleteEl(nudge_d);
			}, 2000
		);
	}
	// Delete function
	function deleter() {
		if (canDelete) {
			remover();
		} else {
			setTimeout(function() {
					deleter();
				}, 3000
			);
		}
	}
	// Auto delete
	setTimeout(function() {
			deleter();
		}, 8000
	);
	// Click delete
	d_close.onclick = function() {
		remover();
	};
	// Esc delete TODO: should probably set canDelete to false
	// TODO: Not violent enough, should take shit out harder :)
	$(function(){
			$(document).keyup(function(key) {
					if (key.keyCode === 27) {
						remover();
					}
				}
			);
		}
	);
}

// Helper function class changer
function classChanger(element,classOut,classIn, message, callback) {
	element.classList.remove(classIn);
	element.classList.add(classOut);
	function messageIntroducer(message) {
		element.innerHTML = message;
		element.classList.add(classIn);
	}
	setTimeout(function() {
			messageIntroducer(message);
			if (callback) {
				callback();
			}
		}, 300
	);
}

var d_message_options = '<div id="d_link_domain">Don&rsquo;t nudge this site</div> (<div id="d_link_options">more options</div>)';
var m_message_options = '<div id="m_link_domain">Don&rsquo;t nudge this site</div> (<div id="m_link_options">more options</div>)';

var nudgeLink = "http://bit.ly/2gFsVrf";

function copyText() {
	var copyText = createEl(document.body,"textArea","copyText");
  var selection = $('#copyText').val(nudgeLink).select();
  document.execCommand('copy');
  selection.val('');
  deleteEl(copyText);
}

function shareClick(element, toolTip, link) {
	$(function(){
	  	$(element).on('click', link, function(){
					copyText();
					toolTip.innerHTML = "Link copied to clipboard! Go share.";
	  		}
	  	);
		}
	);
}

function optionsClick(element, link) {
	$(function(){
	  	$(element).on('click', link, function(){
	  			console.log("click");
					chrome.runtime.sendMessage({
							type: "options"
						}
					);
	  		}
	  	);
		}
	);
}

function domainClick(element, link, domain) {
	var domainClickNumber = 0;
	$(function(){
	  	$(element).on('click', '#' + link, function(){
	  			linkDiv = document.getElementById(link);
	  			domainChange("domains_remove", domain);
	  			linkDiv.innerHTML = 'Won&rsquo;t nudge this site';
	  		}
	  	);
		}
	);
}

function drawerMessagePlayer(element, clickNumber, domain) {
  if (clickNumber % 2 === 1) {
  	classChanger(element, 'd_fade_out_down', 'd_fade_in_down', d_message_options);
  	optionsClick(element,'#d_link_options');
  	domainClick(element,'d_link_domain', domain);
  	return;
  } else {
  	funName('d_link_share', function(message) {
				classChanger(element, 'd_fade_out_down', 'd_fade_in_down', message + '<div id="d_hover_window">Click to copy Nudge link to clipboard</div>', function() {
					var toolTip = document.getElementById("d_hover_window");
					shareClick(element, toolTip, '#d_link_share');
				});
			}
		);
  	return;
  }
}

function modalMessagePlayer(element, clickNumber, domain) {
	m_message_options = '<div id="m_link_domain">Don&rsquo;t nudge this site</div> (<div id="m_link_options">more options</div>)';
	if (clickNumber % 2 === 1) {
		if (clickNumber > 2) {
			deleteEl(toolTip);
		}
		classChanger(element, 'fade_out_down', 'fade_in_down', m_message_options);
		optionsClick(element,'#m_link_options', m_message_options);
		domainClick(element,'m_link_domain', domain);
		return;
	} else {
		if (clickNumber > 1) {
			toolTip = createEl(element.parentNode.parentNode,"div","m_hover_window");
			toolTip.innerHTML = "Click to copy Nudge link to clipboard";
			shareClick(element, toolTip, '#m_link_share');
		}
		funName('m_link_share', function(message) {
			classChanger(element, 'fade_out_down', 'fade_in_down', message);
		});
		return;
	}
}

function funName(divId, callback) {
		chrome.runtime.sendMessage({type: "fun_name"}, function(response) {
			a = '<div id="';
			b = divId;
			c = '">Share Nudge with ';
			d = response.name;
			e = '</div>';
			var message = a + b + c + d + e;
			callback(message);
		}
	);
}

function bgPicker(type) {
	switch(type) {
		case "visit":
			return bgImageVisit;
		case "time":
			return bgImageTime;
		case "compulsive":
			return bgImageCompulsive;
		case "scroll":
			return bgImageScroll; 
		default:
			return;
	}
}

// Background image variables
var bgImageVisit = "url(" + chrome.extension.getURL("visit.png") + ") center center no-repeat";
var bgImageTime = "url(" + chrome.extension.getURL("time.png") + ") center center no-repeat";
var bgImageScroll = "url(" + chrome.extension.getURL("scroll.png") + ") center center no-repeat";
var bgImageCompulsive = "url(" + chrome.extension.getURL("compulsive.png") + ") center center no-repeat";

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
	} else if (i < 45) {
		return Math.round(i) + " seconds";
	} else if (i < 60) {
		return "a minute";
	} else if (i < 105) {
		return "2 minutes";
	} else {
		console.log("minute function didn't work"); // FIXME: WHY ALWAYS FLAGGING?
	}
}

// Helper time generator
function timeNow() {
	var time = new Date();
	time = time.getTime();
	return time;
}

// Set titles constant on case by case basis (should be done with object really)
function titleConstantizer(domain) {
	switch(domain) {
		case "facebook.com":
			return "Facebook";
		case "twitter.com":
			return "Twitter";
		case "pinterest.com":
			return "Pinterest";
		case "mail.google.com":
			return "Gmail";
		default:
			return document.title;
	}
}

function domainChange(type, domain) {
	chrome.runtime.sendMessage({type: type, domain: domain}, function(response) {
		console.log(response);
		}
	);
}