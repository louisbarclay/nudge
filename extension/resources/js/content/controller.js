function constantiseTitle() {
  document.getElementsByTagName("title")[0].remove();
  var title = createEl(document.head, "title");
  title.innerHTML = "Bonkers";
  Object.defineProperty(document, "title", {
    enumerable: false,
    configurable: false,
    writable: false,
    value: document.title
  });
  console.log("title constantised");
}

doAtEarliest(constantiseTitle);
docReady(constantiseTitle);

// Copyright 2016, Nudge, All rights reserved.

// This will load on every page and so should be tiny
// type: start script. contains URL of script. that way you know it gets carried out

// needs a function which listens for any option changes, and re-runs if a new domain is added?
// i.e. if domain gets added, and its window is open, it IMMEDIATELY starts being nudged

var domain = extractRootDomain(window.location.href);

// define a handler
function switchOffShortcut(e) {
  if (e.ctrlKey && e.keyCode == 48) {
    initOff();
  }
}

document.addEventListener("keyup", switchOffShortcut, false);

// Is this legit?
chrome.storage.sync.get("settings", function(items) {
  try {
    if (keyDefined(items.settings.domains, domain)) {
      if (items.settings.domains[domain].nudge) {
        // Should maybe have an option to turn this off?
        init();
        tabIdler();
      }
    }
  } catch (e) {
    console.log(e);
  }
  // execute script to stop the divs_arrays appearing. and pass info on which to stop
});

if (keyDefined(divs, domain)) {
  var divArray = divs[domain];
  var elementHideStyle =
    "{ visibility: hidden; pointer-events: none; cursor: default }";
  doAtEarliest(function() {
    elementReady("pagelet_composer", insertClose);
    addCSS("nudge-facebook", "css/pages/facebook.css");
    styleAdder("#container2", container2Style);
    styleAdder("#circle", circleStyle);
    styleAdder("@keyframes circleTransition", circleTransitionKeyframe);
    divArray.forEach(function(item) {
      styleAdder(`#${item.name}`, elementHideStyle);
      styleAdder(`#circle:hover`, circleHoverStyle);
      docReady(function() {
        addCircle(item);
      });
    });
  });
}

function insertClose(element) {
  function appendAfterHTMLRequest(response) {
    var newEl = createEl(element, "div");
    newEl.innerHTML = response;
  }
}

var objecttt = {};

sendHTMLRequest(getUrl("html/facebook/intro.html"), storeForUse);

function storeForUse(url, response) {
  url = url.split("/").pop();
  objecttt[url] = response;
}

function elementReady(id, callback) {
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (!mutation.addedNodes) return;

      for (var i = 0; i < mutation.addedNodes.length; i++) {
        var node = mutation.addedNodes[i];
        if (node.id === id) {
          callback(node);
          observer.disconnect();
        }
      }
    });
  });

  observer.observe(document, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false
  });
}

var container2Style = `{
  background-color: #00ff00;
  width: 100%;
  height: 0;
  position: static;
  text-align: center;
  top: 0;
}`;

var circleStyle = `{
  visibility: visible;
  animation: circleTransition 1s forwards;
  transition: all 1s;
  z-index: 15;
  top: 0px;
  margin: 0;
  padding: 0;
  opacity: 0;
  cursor: pointer;
  pointer-events: auto;
  width: 100%;
  height: 24px;
  background: url('${chrome.extension.getURL(
    "resources/images/circleheavy.svg"
  )}') center 0px/24px no-repeat;
}`;

var circleTransitionKeyframe = `{
  0% { opacity: 0; }
  100% { opacity: 0.5; }
}`;

var circleHoverStyle = `{
  background-color: yellow;
}`;

function addCircle(element) {
  try {
    var hiddenElement = document.getElementById(element.name);
    var container2 = document.createElement("div");
    container2.id = "container2";
    hiddenElement.insertAdjacentElement("afterbegin", container2); // is there a way of doing this shit with before pseudoelement?
    container2.innerHTML = '<div id="circle"></div>';
    var circle = document.getElementById('circle');
    var dropdown = createEl(circle, 'div');
    dropdown.id = 'nudge-dropdown';
  } catch (e) {
    console.log(e);
  }
}

if (domain === "facebook.com") {
  fbunfollow();
}

function init() {
  chrome.runtime.sendMessage({ type: "inject_switch" }, function(response) {});
}

function fbunfollow() {
  chrome.runtime.sendMessage({ type: "inject_fbunfollow" }, function(
    response
  ) {});
}

function tabIdler() {
  chrome.runtime.sendMessage({ type: "inject_tabidler" }, function(
    response
  ) {});
}

function fbhide() {
  chrome.runtime.sendMessage({ type: "inject_fbhide" }, function(response) {});
}

// for this domain
// inject this css
// for these elements
// need to be able to turn all interventions on and off easily
// and easily add that on/off to options
