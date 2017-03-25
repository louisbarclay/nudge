// Copyright 2016, Nudge, All rights reserved.

function imageLoader(imageName, url) {
	imageName = new Image();
	imageName.src = url;
}

var faviconUrl = '';

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.type === "favicon") {
			imageLoader('favicon', request.favicon);
			faviconUrl = request.favicon;
		}
	}
);

var coglarge = new Image();
coglarge.src = chrome.extension.getURL("coglarge.png");

var coglargehover = new Image();
coglargehover.src = chrome.extension.getURL("coglargehover.png");

var cogsmall = new Image();
cogsmall.src = chrome.extension.getURL("cogsmall.png");

var cogsmallhover = new Image();
cogsmallhover.src = chrome.extension.getURL("cogsmallhover.png");

var d_close = new Image();
d_close.src = chrome.extension.getURL("close.png");

var d_close_hover = new Image();
d_close_hover.src = chrome.extension.getURL("closehover.png");

var n_visit = new Image();
n_visit.src = chrome.extension.getURL("visit.png");

var n_time = new Image();
n_time.src = chrome.extension.getURL("time.png");

var n_scroll = new Image();
n_scroll.src = chrome.extension.getURL("scroll.png");

var n_compulsive = new Image();
n_compulsive.src = chrome.extension.getURL("compulsive.png");

console.log(coglarge);