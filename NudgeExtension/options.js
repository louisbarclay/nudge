// Copyright 2016, Nudge, All rights reserved.

// FIXME: looks like on reload, it's trying to re-add all sites

scroll_s = {
	setting: "scroll_s_setting",
	options: [5,10,15,20,25],
	options_text: ["5 screens","10 screens","15 screens","20 screens","25 screens"],
	button: $('#scroll_s_button'),
	list: $('#scroll_s_list'),
};

clickHandler(scroll_s);

scroll_b = {
	setting: "scroll_b_setting",
	options: [0,1,2,3,4,10000000],
	options_text: ["always","after the 1st nudge","after the 2nd nudge","after the 3rd nudge","after the 4th nudge", "never"],
	button: $('#scroll_b_button'),
	list: $('#scroll_b_list'),
};

clickHandler(scroll_b);

visit_s = {
	setting: "visit_s_setting",
	options: [5,10,15,20,25],
	options_text: ["5 visits","10 visits","15 visits","20 visits","25 visits"],
	button: $('#visit_s_button'),
	list: $('#visit_s_list'),
};

clickHandler(visit_s);

visit_b = {
	setting: "visit_b_setting",	
	options: [0,1,2,3,4,10000000],
	options_text: ["always","after the 1st nudge","after the 2nd nudge","after the 3rd nudge","after the 4th nudge", "never"],
	button: $('#visit_b_button'),
	list: $('#visit_b_list'),
};

clickHandler(visit_b);

time_s = {
	setting: "time_s_setting",	
	options: [1,5,10,15,20,25],
	options_text: ["minute","5 minutes","10 minutes","15 minutes","20 minutes","25 minutes"],
	button: $('#time_s_button'),
	list: $('#time_s_list'),
};

clickHandler(time_s);

time_b = {
	setting: "time_b_setting",	
	options: [0,1,2,3,4,10000000],
	options_text: ["always","after the 1st nudge","after the 2nd nudge","after the 3rd nudge","after the 4th nudge", "never"],
	button: $('#time_b_button'),
	list: $('#time_b_list'),
};

clickHandler(time_b);

compulsive = {
	setting: "compulsive_setting",	
	options: [10,5,3,2,1],
	options_text: ["ten minutes","five minutes","three minutes","two minutes","a minute"],
	button: $('#compulsive_button'),
	list: $('#compulsive_list'),
};

clickHandler(compulsive);

maxnudge = {
	setting: "maxnudge_setting",	
	options: [60,15,5,2,1,0],
	options_text: ["hour","quarter of an hour","five minutes","two minutes","minute","whenever"],
	button: $('#maxnudge_button'),
	list: $('#maxnudge_list'),
};

clickHandler(maxnudge);

// Click handler
function clickHandler(object) {
	$(function(){
		$(object.list).on('click', 'li a', function(){
			var selection = $(this).val();
			replacer(object, selection, true);
		});
	});
}

function replacer(object, selection, isClick) {
	$(object.list).empty();
	$.each(object.options, function(i) {
			if ((object.options[i]) == selection) { // FIXME: weak equality here, should be more watertight
				$(object.button).text(object.options_text[i]);
				$(object.button).val(object.options[i]);
				storageSetter(object.setting,object.options[i],isClick);
			} else {
				var li = $('<li/>')
					.appendTo(object.list);
				var aaa = $('<a href="#" />')
					.text(object.options_text[i])
					.val(object.options[i])
					.appendTo(li);
			}
		}
	);
}

function storageSetter(setting,value,isClick) {
	settingObj = {};
	settingObj[setting] = value;
	chrome.storage.sync.set(settingObj);
	if (isClick) {
		var saved_div = document.getElementById('saved_div');
		$(saved_div).fadeIn();
		$(saved_div).fadeOut();
		updateObj = {};
		updateObj.type = "update";
		updateObj.setting = setting;
		optionUpdater(updateObj);
	}
}

// Update that single setting in background script
function optionUpdater(object) {
	chrome.runtime.sendMessage(object, function(response) {
		}
	);
}

// Restores options, and sets initial options if none already
function restore_options() {
	chrome.storage.sync.get(null, function(items) {
			domain_init(items.domains_setting);
			replacer(scroll_s, items.scroll_s_setting, false);
			replacer(scroll_b, items.scroll_b_setting, false);
			replacer(visit_s, items.visit_s_setting, false);			
			replacer(visit_b, items.visit_b_setting, false);
			replacer(time_s, items.time_s_setting, false);
			replacer(time_b, items.time_b_setting, false);
			replacer(compulsive, items.compulsive_setting, false);
			replacer(maxnudge, items.maxnudge_setting, false);
		}
	);
}

function chk() {
	chrome.storage.sync.get(null,function(items) {
		console.log(items);
	});
}

function domain_init(domains) {
	for (var i = 0; i < domains.length; i++) {
		$('#input').tagsinput('add', domains[i]);		
	}
	// Adding a domain
	$('#inputdiv').on('itemAdded', 'input', function(event) {
			domainChange("domains_add", event.item);
		}
	);
	// Removing a domain
	$('#inputdiv').on('itemRemoved', 'input', function(event) {
			domainChange("domains_remove", event.item);
		}
	);
}

function domainChange(type, domain) {
	chrome.runtime.sendMessage({type: type, domain: domain},function(response) {
		console.log(response);
		}
	);
}

$(document).ready(function() {
		restore_options();
});