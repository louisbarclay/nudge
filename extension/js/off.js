// Off elements that we care about
var off = "off-";
var js = "js-";

var slider = document.querySelector(`.${off}slider`);
var sliderText = document.querySelector(`.${off}slider-text`);
var button = document.querySelector(`.${off}button`);
var centre = document.querySelector(`.${off}button-centre`);
var domainText = document.getElementsByClassName(`${js}domain`);
var tagline = document.getElementById(`tagline`);
var switch_ons = false;
var getStickier = true;
var settings = document.getElementsByClassName(`${off}settings`);
var settings2 = document.getElementById(`js-settings2`);
var headline = document.getElementById(`js-headline`);

// Settings click handlers
Array.from(settings).forEach(function(element) {
  element.onclick = function() {
    chrome.runtime.openOptionsPage();
  };
});

// FIXME: this is a bit of a kludge
function highlightify(text) {
  return `<span class='off-highlight'>${text}</span>`;
}

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
  Array.from(domainText).forEach(function(element) {
    element.innerHTML = domain;
  });
}
if ("url" in QueryString) {
  url = QueryString.url;
}

// Only a headline. big headline
// You've gone X minutes without visiting XXXXXX
// That's a good start.
// Keep it going by just leaving!
//

function getLocalStorage() {
  chrome.runtime.sendMessage({ type: "get_localStorage" }, function(response) {
    var date = moment().format("YYYY-MM-DD");
    localStorage = response.localStorage;
    var settingsLocal = response.settingsLocal;
    getStickier = settingsLocal.get_stickier;
    // Get domain today
    // var domainToday = JSON.parse(localStorage[date])[domain];
    // Pull the status out
    var status = JSON.parse(localStorage.status);

    // Load a new image for the new day!
    if (!settingsLocal.bg_image) {
      setBackground(background, `${dir_small}${getBackgroundFile(0)}`);
      backgroundLoader(0);
      changeSettingRequest(moment(), "bg_image");
    } else {
      var diff = moment()
        .startOf("day")
        .diff(moment(settingsLocal.bg_image).startOf("day"), "days");
      var index = diff % bgImages.length;
      setBackground(background, `${dir_small}${getBackgroundFile(index)}`);
      backgroundLoader(index);
    }

    // If false, use value 0 to grab image from array and set it
    // If true, check what day you are on versus the first ever day, and use that value to get array
    // Check if domain in status
    if (!(domain in status)) {
      headline.innerHTML = `Nudge switches off${highlightify(
        domain
      )}by default`;
    }

    // Grab lastVisitEnd for updating the headline
    var lastVisitEnd = status[domain].lastVisitEnd;
    // Humanize it
    var sinceLastVisitEnd = moment
      .duration(moment().diff(moment(lastVisitEnd)))
      .humanize();
    // Update it in headline
    document.getElementById("js-lastvisit").innerHTML = sinceLastVisitEnd;

    switch_ons = JSON.parse(localStorage[date]).switch_ons;
    if (getStickier) {
      var stickyChange = (switch_ons + 2) / 2;
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
button.addEventListener("touchstart", sliderTouchdown, true);

// Vars for the slider
var buttonPosition = 0;
var mousePosition = false;
var touchPosition = false;
var stickyMultiplier = 1;

function getPageLeft(el) {
  var rect = el.getBoundingClientRect();
  var docEl = document.documentElement;
  // console.log(el.getBoundingClientRect);
  // console.log(`rect.left + ${rect.left}`);
  // console.log(`window.pageXOffset + ${window.pageXOffset}`);
  // console.log(`docEl.scrollLeft + ${docEl.scrollLeft}`);
  var rectToString = (rect.left).toString();
  rectAfterDot = rectToString.substring((rectToString).indexOf('.') + 1, rectToString.length)
  // console.log(rectAfterDot);
  return rect.left + (window.pageXOffset || docEl.scrollLeft || 0);

}

function sliderdown(e) {
  // Find where the button is
  var buttonDiff = getPageLeft(button) - getPageLeft(slider);
  // Set button position as where button is relative to slider
  // Set to zero if you have a negatcentre.classList.remove("active");ive value 0)
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

function sliderTouchdown(e) {
  // Find where the button is
  var buttonDiff = getPageLeft(button) - getPageLeft(slider);
  // Set button position as where button is relative to slider
  // Set to zero if you have a negatcentre.classList.remove("active");ive value 0)
  if (buttonDiff > 0) {
    buttonPosition = Math.round(buttonDiff);
  } else {
    buttonPosition = 0;
  }
  // Set mouse position as wherever mouse is
  touchPosition = e.changedTouches[0].clientX;
  button.classList.remove("returning");
  // bind late
  document.addEventListener("touchend", sliderupTouch, true);
  document.addEventListener("touchmove", slidermoveTouch, true);
}

function sliderup(e) {
  // Position for testing whether to initOn, or return
  // console.log(`position 1: ${position}`)
  // console.log(`getPageLeft(button) and slider: ${getPageLeft(button)} + ${getPageLeft(slider)}`);
  var position = getPageLeft(button) - getPageLeft(slider);
  // console.log(`getPageLeft(button) and slider: ${getPageLeft(button)} + ${getPageLeft(slider)}`);
  // console.log(`position 2: ${position}`)
  button.classList.remove("active");
  centre.classList.remove("active");
  // unbind
  document.removeEventListener("mousemove", slidermove, true);
  document.removeEventListener("mouseup", sliderup, true);
  // Initiate on
  // console.log('position', position);

  // console.log('sliderOffset', slider.offsetWidth);
  
  // console.log('buttonOffset', button.offsetWidth);
  
  // console.log('diff', (slider.offsetWidth - button.offsetWidth));
  
  // console.log('initOn', 'position >= slider.offsetWidth - button.offsetWidth');

  if ( Math.round(position) >= slider.offsetWidth - button.offsetWidth) {
    initOn();
  } else {
    if (stickyMultiplier === 1) {
      button.style.left = 0 + "px";
      button.classList.add("returning");
      background.style.opacity = 0;
    }
  }
}

function sliderupTouch(e) {

  // Position for testing whether to initOn, or return
  var position = getPageLeft(button) - getPageLeft(slider);
  button.classList.remove("active");
  centre.classList.remove("active");
  // unbind
  document.removeEventListener("touchmove", slidermoveTouch, true);
  document.removeEventListener("touchend", sliderupTouch, true);

  // Initiate on

  if ( Math.round(position) >= slider.offsetWidth - button.offsetWidth) {
    initOn();
  } else {
    if (stickyMultiplier === 1) {
      button.style.left = 0 + "px";
      button.classList.add("returning");
      background.style.opacity = 0;
    }
  }
}

function slidermove(e) {
  // Difference between where mouse was on click, and where mouse is now
  var difference = 0;
  // console.log(e.clientX - mousePosition);
  if (e.clientX - mousePosition > 0) {
    difference = Math.round((e.clientX - mousePosition) / stickyMultiplier);
  } else {
    difference = Math.round(e.clientX - mousePosition);
  }

  // Filter set
  var blurExtent = (difference + buttonPosition) / slider.offsetWidth;
  // FIXME: blur max size should depend on scale of background photos.
  // backgroundEnhanced.style.filter = `blur(${blurExtent}px)`;
  background.style.opacity = blurExtent.toFixed(2);
  // FIXME: maybe hide the enhanced background and then blur the other one more

  // If you go negative, set to 0px
  if (difference + buttonPosition < 0) {
    button.style.left = "0px";
    // If you go further than end of slider,
  } else if (
    difference + buttonPosition + button.offsetWidth >=
    slider.offsetWidth
  ) {
    button.style.left = slider.offsetWidth - button.offsetWidth + "px";
  } else {
    button.style.left = difference + buttonPosition + "px";
  }
}

function slidermoveTouch(e) {
  // Difference between where mouse was on click, and where mouse is now
  var difference = 0;
  // console.log(e.changedTouches[0].clientX - touchPosition);
  if (e.changedTouches[0].clientX - touchPosition > 0) {
    difference = Math.round((e.changedTouches[0].clientX - touchPosition) / stickyMultiplier);
  } else {
    difference = Math.round(e.changedTouches[0].clientX - touchPosition);
  }

  // Filter set
  var blurExtent = (difference + buttonPosition) / slider.offsetWidth;
  // FIXME: blur max size should depend on scale of background photos.
  // backgroundEnhanced.style.filter = `blur(${blurExtent}px)`;
  background.style.opacity = blurExtent.toFixed(2);
  // FIXME: maybe hide the enhanced background and then blur the other one more

  // If you go negative, set to 0px
  if (difference + buttonPosition < 0) {
    button.style.left = "0px";
    // If you go further than end of slider,
  } else if (
    difference + buttonPosition + button.offsetWidth >=
    slider.offsetWidth
  ) {
    button.style.left = slider.offsetWidth - button.offsetWidth + "px";
  } else {
    button.style.left = difference + buttonPosition + "px";
  }
}

// Off elements that we care about
var off = "off-";
var js = "js-";
var dir = "img/bg/";
var dir_small = "small/";

var background = document.querySelector(`.${off}background`);
var backgroundEnhanced = document.querySelector(`.${off}background-enhanced`);

// Get the photos if exist in sync. Set them if not
function initOn() {
  chrome.runtime.sendMessage({
    type: "on",
    url,
    domain
  });
}

function getBackgroundFile(index) {
  return bgImages[index];
}

function setBackground(element, image) {
  element.src = `${getUrl(`${dir}${image}`)}`;
}

function backgroundLoader(index) {
  // This was as follows, but changed to make it work: // window.onload = function loadStuff() {}
  img = new Image();
  // Assign an onload handler to the dummy image *before* assigning the src
  img.onload = function() {
    // console.log(getBackgroundFile(index), index);
    setBackground(backgroundEnhanced, getBackgroundFile(index));
    toggleClass(background, `${off}background_animation`);
    setTimeout(function() {
      background.style.opacity = 0;
      toggleClass(background, `${off}background_animation`);
    }, 1000);
  };

  // Finally, trigger the whole preloading chain by giving source
  img.src = getUrl(`${dir}${getBackgroundFile(index)}`);
}

var backgroundNumber = 0;

// Keyboard shortcut to cycle through background images
function cycleThroughBackgrounds() {
  document.onkeyup = function(key) {
    if (key.altKey && key.keyCode == 39) {
      backgroundLoader(backgroundNumber);
      backgroundNumber++;
    }
  };
}

// cycleThroughBackgrounds();
