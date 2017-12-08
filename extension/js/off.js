var button = document.querySelector(".button");
var centre = document.querySelector(".button-centre");
var domainText = document.querySelector("#domain-text");
var domainLastVisited = document.querySelector("#domain-last-visited");
var domainTimeToday = document.querySelector("#domain-time-today");

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

var url = false;

if ("url" in QueryString) {
  url = QueryString.url;
}

console.log(document.body);

var domain = false;
if ("domain" in QueryString) {
  domain = QueryString.domain;
  console.log(domain);
  domainText.innerHTML = domain;
}

if ("lastShutdown" in QueryString) {
  lastShutdown = QueryString.lastShutdown;
  if (lastShutdown === 0) {
    // cancel everything. not quite everything but you get the point
  }
  function updateLastVisited() {
    var lastVisited = logMinutes(timeNow() / 1000 - lastShutdown / 1000);
    domainLastVisited.innerHTML = lastVisited;
  }
  updateLastVisited();
  setInterval(updateLastVisited, 1000);
}

if ("timeToday" in QueryString) {
  timeToday = QueryString.timeToday / 1000;
  domainTimeToday.innerHTML = logMinutes(timeToday);
}

function initOn() {
  chrome.runtime.sendMessage({
    type: "on",
    url: url,
    domain: domain
  });
}

button.addEventListener("mousedown", sliderdown, true);

function sliderdown(e) {
  button.classList.remove("returning");
  // bind late
  document.addEventListener("mouseup", sliderup, true);
  document.addEventListener("mousemove", slidermove, true);
}

function getPageLeft(el) {
  var rect = el.getBoundingClientRect();
  var docEl = document.documentElement;
  return rect.left + (window.pageXOffset || docEl.scrollLeft || 0);
}

function sliderup(e) {
  initPosition = false;
  var position =
    e.clientX - getPageLeft(button.parentElement) - button.offsetWidth / 2;
  button.classList.remove("active");
  centre.classList.remove("active");
  // unbind
  document.removeEventListener("mousemove", slidermove, true);
  document.removeEventListener("mouseup", sliderup, true);
  if (position > button.parentElement.offsetWidth - button.offsetWidth) {
    button.style.left =
      button.parentElement.offsetWidth - button.offsetWidth + "px";
    initOn();
  } else {
    button.style.left = 0 + "px";
    button.classList.add("returning");
  }
}

var initPosition = false;

function slidermove(e) {
  if (!initPosition) {
    initPosition = e.clientX;
  }
  var position = e.clientX - initPosition;
  if (position < 0) {
    position = 0;
  } else if (
    position >=
    button.parentElement.offsetWidth - button.offsetWidth
  ) {
    position = button.parentElement.offsetWidth - button.offsetWidth;
  } else if (position < button.parentElement.offsetWidth - button.offsetWidth) {
    // Limits movement to the end
  }
  button.style.left = position + "px";
}
