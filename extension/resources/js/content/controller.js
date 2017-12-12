// Listen for option changes

setTimeout(doAtTime, 3000);

function doAtTime() {
  addScript("nudge-facebook-script", "resources/js/content/constantiser.js");
}

var tempStorage = {};

sendHTMLRequest(getUrl("html/facebook/intro.html"), storeForUse);
sendHTMLRequest(getUrl("html/components/circle.html"), storeForUse);

function storeForUse(url, response) {
  url = url.split("/").pop();
  tempStorage[url] = response;
}

var domain = extractRootDomain(window.location.href);

var divHider = true;

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
    elementReady("pagelet_composer", function(node) {
      appendHTML(node, tempStorage['intro.html']);
    });
    addCSS("nudge-facebook", "css/pages/facebook.css");
    addCSS("nudge-divhider", "css/pages/divhider.css");
    divArray.forEach(function(item) {
      styleAdder(`#${item.name}`, elementHideStyle);
      docReady(function() {
        addCircle(item);
      });
    });
  });
}

function appendHTML(parent, child) {
  var newEl = createEl(parent, "div");
  newEl.innerHTML = child;
  console.log(newEl);
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

function addCircle(element) {
  try {
    var hiddenElement = document.getElementById(element.name);
    console.log(tempStorage);
    hiddenElement.insertAdjacentElement("afterbegin", tempStorage['circle.html']);
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
