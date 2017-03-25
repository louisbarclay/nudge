// Copyright 2016, Nudge, All rights reserved.

var facebookBlurSetting = false;

// fb object
// linkedin object
// pinterest object
// object of objects?
// forEach to unblur them?

// must delete it when you go to another page

// need Turn off this feature(not rec.)

if (document.getElementById('contentCol')) {
  var fbContentCol = document.getElementById('contentCol');
  var fbLeftCol = document.getElementById('leftCol');
  if (!facebookBlurSetting) {
  		unBlur();
  }
}

function unBlur() {
  var fbContentCol = document.getElementById('contentCol');
  var fbLeftCol = document.getElementById('leftCol');
	fbContentCol.style = "filter: blur(0px)";
	fbLeftCol.style = "filter: blur(0px)";
	console.log("tried to unblur");
}

function createButton() {
	var nudge_b = createEl(document.body,"div","nudge_b");
	var b_wrapper = createEl(nudge_b,"div","b_wrapper");
	var b_container = createEl(b_wrapper,"div","b_container");
	var b_message = createEl(b_container,"div","b_message");
	b_message.innerHTML = "Show News Feed";
	$(b_container).on("click", buttonClick);
}

function buttonClick() {
	unBlur();
	deleteEl(nudge_b);
}

$(document.body).ready(function() {
		createButton();
	}
);

window.onhashchange = function() { 
	console.log("hashcahnge");
	unBlur();
};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
			console.log(request);
			if (request.unblur) {
				buttonClick();
			}
	}
);

// work of excluding URLs has to happen here (but not ideal?)
// maybe on body load, inject CSS? i think that might be best. that should catch it in time