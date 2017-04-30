// Copyright 2016, Nudge, All rights reserved.

var t = document.querySelector(".custom-slider-button");
var tc = document.querySelector(".custom-slider-button-centre");

var QueryString = function () {
  // This function is anonymous, is executed immediately and 
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0; i < vars.length; i++) {
    var pair = vars[i].split("=");
        // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
        // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
      query_string[pair[0]] = arr;
        // If third or later entry with this name
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  } 
  return query_string;
}();

var url = false;

if ('url' in QueryString) {
  url = QueryString.url;
}

var domain = false;
if ('domain' in QueryString) {
  domain = QueryString.domain;
}

function initOn() {
  console.log(url, domain);
  chrome.runtime.sendMessage({
    type: "on",
    url: url,
    domain: domain
  });
}

var niceNames = {
  "messenger.com": "Messenger",
  "facebook.com": "Facebook",
  "twitter.com": "Twitter",
  "linkedin.com": "LinkedIn",
  "reddit.com": "Reddit",
  "diply.com": "Diply",
  "buzzfeed.com": "Buzzfeed",
  "youtube.com": "YouTube",
  "theladbible.com": "LADbible",
  "instagram.com": "Instagram",
  "pinterest.com": "Pinterest",
  "theguardian.com": "The Guardian",
  "bbc.com": "BBC",
  "bbc.co.uk": "BBC",
  "theguardian.co.uk": "The Guardian",
  "dailymail.co.uk": "The Daily Mail",
  "mailonline.com": "Mail Online",
  "imgur.com": "Imgur",
  "amazon.co.uk": "Amazon",
  "amazon.com": "Amazon",
  "netflix.com": "Netflix",
  "tumblr.com": "Tumblr",
  "thesportbible.com": "SPORTbible",
  "telegraph.co.uk": "The Daily Telegraph",
  "mail.google.com": "Gmail"
};


var h1 = document.querySelector(".h1");
var h2 = document.querySelector(".h2");
var slidertext = document.querySelector(".slider-text");

var simpleName = domain;
if (domain in niceNames) {
  simpleName = niceNames[domain];
}

h1.innerHTML = simpleName + " is currently switched off.";
h2.innerHTML = "Why not plan a dinner with your friends?";
slidertext.innerHTML = 'Slide right to turn ' + simpleName + ' back on';

t.addEventListener('mousedown', sliderdown, true);

function sliderdown(e) {
  t.classList.remove("returning");
  t.classList.add("active");
  tc.classList.add("active");
  // bind late
  document.addEventListener('mouseup', sliderup, true);
  document.addEventListener('mousemove', slidermove, true);
}

function sliderup(e) {
  var newpos = e.clientX - t.parentElement.offsetLeft - (t.offsetWidth/2);
  t.classList.remove("active");
  tc.classList.remove("active");
  // unbind
  document.removeEventListener('mousemove', slidermove, true);
  document.removeEventListener('mouseup', sliderup, true);
  if (newpos > (t.parentElement.offsetWidth - t.offsetWidth)) {
    t.style.left = t.parentElement.offsetWidth - t.offsetWidth +'px';
    tc.classList.add("done");
    initOn();
  } else {
    t.style.left = 0 +'px';
    t.classList.add("returning");
  }
}

function slidermove(e) {
  var newpos = e.clientX - t.parentElement.offsetLeft - (t.offsetWidth/2);
  if (newpos < 0) {
    newpos = 0; 
  } else if ( newpos >= (t.parentElement.offsetWidth - t.offsetWidth)) {
    newpos = t.parentElement.offsetWidth - t.offsetWidth;
    slidertext.classList.remove("h3");
    slidertext.classList.add("h4");
    slidertext.innerHTML = "Release mouse to turn " + simpleName + " back on";
  } else if ( newpos < (t.parentElement.offsetWidth - t.offsetWidth)) {
    slidertext.classList.remove("h4");
    slidertext.classList.add("h3");
    slidertext.innerHTML = "Slide right to turn " + simpleName + " back on";    
  }
  t.style.left = newpos +'px';
}