// Listen for option changes

setTimeout(doAtTime, 3000);

var domain = extractRootDomain(window.location.href);

function doAtTime() {}

var tempStorage = {};

// For Facebook UX
sendHTMLRequest(getUrl("html/facebook/intro.html"), storeForUse);
sendHTMLRequest(getUrl("html/facebook/confirm_content.html"), storeForUse);
sendHTMLRequest(getUrl("html/facebook/run_content.html"), storeForUse);
sendHTMLRequest(getUrl("html/facebook/share_content.html"), storeForUse);

// For general div hiding
sendHTMLRequest(getUrl("html/components/circle.html"), storeForUse);

function storeForUse(url, response) {
  url = url.split("/").pop();
  tempStorage[url] = response;
}

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
    addCSS("nudge-facebook", "css/pages/facebook.css");
    addCSS("nudge-circle", "css/pages/circle.css");
    docReady(function() {
      addScript(
        "nudge-facebook-script",
        "resources/js/content/constantiser.js",
        { domain }
      );
    });
    divArray.forEach(function(item) {
      styleAdder(`${item.name}`, elementHideStyle);
      docReady(function() {
        addCircle(item);
      });
    });
  });
}

docReady(function() {
  var el = document.getElementById("pagelet_composer");
  appendHtml(el, tempStorage["intro.html"], introUx);
  elementReady(nodeIsPagelet, false, function() {
    console.log("we should run it here!");
    if (!document.querySelector(".facebook-container")) {
      console.log("doesnt exist so create it");
      console.log(el);
      appendHtml(el, tempStorage["intro.html"], introUx);
      console.log(document.getElementById("pagelet_composer"));
    }
  });
});

function nodeIsPagelet(node) {
  if (node.id === "pagelet_composer") {
    return true;
  } else {
    return false;
  }
}

function introUx(element) {
  var button = document.querySelector(".facebook-button");
  var container = document.querySelector(".facebook-container");
  button.onclick = function() {
    container.innerHTML = tempStorage["confirm_content.html"];
    confirmUx();
  };
  var close = document.querySelector(".facebook-close");
  close.onclick = function() {
    deleteEl(container);
    deleteEl(close);
    styleAdder("#pagelet_composer::before", "{ content: none; }");
  };
}

function confirmUx() {
  var button = document.querySelector(".facebook-button");
  var container = document.querySelector(".facebook-container");
  button.onclick = function() {
    container.innerHTML = tempStorage["run_content.html"];
    runUx();
  };
}

function runUx() {
  var button = document.querySelector(".facebook-button");
  var container = document.querySelector(".facebook-container");
  button.onclick = function() {
    container.innerHTML = tempStorage["share_content.html"];
    shareUx();
  };
}

function shareUx() {
  var button = document.querySelector(".facebook-button");
  var container = document.querySelector(".facebook-container");
  button.onclick = function() {};
}

function appendHtml(parent, childString, callback) {
  console.log(parent);
  console.log(childString);
  parent.insertAdjacentHTML("afterbegin", childString);
  if (callback) {
    callback();
  }
}

function elementReady(condition, endAfterFirstMatch, callback) {
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (!mutation.addedNodes) return;

      for (var i = 0; i < mutation.addedNodes.length; i++) {
        var node = mutation.addedNodes[i];
        if (notUndefined(node) && condition(node)) {
          callback(node);
          if (endAfterFirstMatch) {
            observer.disconnect();
          }
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
    var hiddenElement = document.querySelector(element.name);
    console.log(hiddenElement, element);
    appendHtml(hiddenElement, tempStorage["circle.html"]);
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
