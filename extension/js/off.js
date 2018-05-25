// Off elements that we care about
var off = "off-";
var js = "js-";

var slider = document.querySelector(`.${off}slider`);
var sliderText = document.querySelector(`.${off}slider-text`);
var button = document.querySelector(`.${off}button`);
var centre = document.querySelector(`.${off}button-centre`);
var domainText = document.querySelector(`.${js}domain`);
var tagline = document.getElementById(`tagline`);
var switch_ons = false;
var getStickier = true;

// Three possible off sites. Determine which one like this:

// Move to pug
var QueryString = (function() {
  // This function is anonymous, is executed immediately and
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
      // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
      query_string[pair[0]] = arr;
      // If third or later entry with this name
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  }
  return query_string;
})();

// Set domain, url
var domain = false;
var url = false;
if ("domain" in QueryString) {
  domain = QueryString.domain;
  domainText.innerHTML = domain;
}
if ("url" in QueryString) {
  url = QueryString.url;
}

function getLocalStorage() {
  chrome.runtime.sendMessage({ type: "get_localStorage" }, function(response) {
    var date = moment().format("YYYY-MM-DD");
    localStorage = response.localStorage;
    var domainToday = JSON.parse(localStorage[date])[domain];
    var status = JSON.parse(localStorage.status);
    var lastShutdown = status[domain].lastShutdown;
    var timeToday = domainToday.time / 60;
    switch_ons = JSON.parse(localStorage[date]).switch_ons;
    console.log(switch_ons);
    if (getStickier) {
      var stickyChange = (switch_ons + 2) / 2;
      console.log(stickyChange);
      if (isNaN(stickyChange) || stickyChange < 1) {
        stickyMultiplier = 1;
      } else if (stickyChange > 16) {
        stickyMultiplier = 16;
      } else {
        stickyMultiplier = stickyChange;
      }
    }
    if (stickyMultiplier > 1) {
      sliderText.innerHTML =
        "Slider gets harder to drag across after each switch on";
    }

    // tagline.innerHTML = `You last visited ${domain} less than ${lastVisited} minutes ago, are you sure you want to go back?`;
  });
}

getLocalStorage();

function initOn() {
  chrome.runtime.sendMessage({
    type: "on",
    url,
    domain
  });
}

button.addEventListener("mousedown", sliderdown, true);

// Vars for the slider
var buttonPosition = 0;
var mousePosition = false;
var stickyMultiplier = 1;

function getPageLeft(el) {
  var rect = el.getBoundingClientRect();
  var docEl = document.documentElement;
  return rect.left + (window.pageXOffset || docEl.scrollLeft || 0);
}

function sliderdown(e) {
  // Find where the button is
  var buttonDiff = getPageLeft(button) - getPageLeft(slider);
  // Set button position as where button is relative to slider
  // Set to zero if you have a negative value (should never happen)
  if (buttonDiff > 0) {
    buttonPosition = Math.round(buttonDiff);
  } else {
    buttonPosition = 0;
  }
  // Set mouse position as wherever mouse is
  mousePosition = e.clientX;
  button.classList.remove("returning");
  // bind late
  document.addEventListener("mouseup", sliderup, true);
  document.addEventListener("mousemove", slidermove, true);
}

function sliderup(e) {
  // Position for testing whether to initOn, or return
  var position = getPageLeft(button) - getPageLeft(slider);
  button.classList.remove("active");
  centre.classList.remove("active");
  // unbind
  document.removeEventListener("mousemove", slidermove, true);
  document.removeEventListener("mouseup", sliderup, true);
  // Initiate on
  if (position >= slider.offsetWidth - button.offsetWidth) {
    initOn();
  } else {
    if (stickyMultiplier === 1) {
      button.style.left = 0 + "px";
      button.classList.add("returning");
    }
  }
}

function slidermove(e) {
  // Difference between where mouse was on click, and where mouse is now
  var difference = 0;
  if (e.clientX - mousePosition > 0) {
    difference = Math.round((e.clientX - mousePosition) / stickyMultiplier);
  } else {
    difference = Math.round(e.clientX - mousePosition);
  }

  // If you go negative, set to 0px
  if (difference + buttonPosition < 0) {
    button.style.left = "0px";
    // If you go further than end of slider,
  } else if (
    difference + buttonPosition + button.offsetWidth >=
    slider.offsetWidth
  ) {
    button.style.left = slider.offsetWidth - button.offsetWidth;
  } else {
    button.style.left = difference + buttonPosition + "px";
  }
}
