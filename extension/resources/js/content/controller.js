var divs = false;
var turnOffObserver = false;

// Options set
getSettings(execSettings);

// Prep in case doing div hiding
sendHTMLRequest(getUrl("html/components/circle.html"), storeForUse);
sendHTMLRequest(getUrl("html/components/switch.html"), storeForUse);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === "favicon") {
    imageLoader("favicon", request.favicon);
    updateFavicon(request.favicon, request.domain);
  }
});

function updateFavicon(favicon, domain) {
  if (!keyDefined(tempStorage, "faviconUrl")) {
    tempStorage.faviconUrl = favicon;
    imageLoader("favicon", favicon);
  } else if (
    tempStorage.faviconUrl.includes(`${domain}/favicon`) &&
    favicon.includes(".ico")
  ) {
    // Always upgrade to a non-'domain.com/favicon' string if possible, since likely to be better quality
    // Also only if the file is .ico
    tempStorage.faviconUrl = favicon;
    imageLoader("favicon", favicon);
  }
}

function imageLoader(imageName, url) {
  imageName = new Image();
  imageName.src = url;
}

function execSettings(settings) {
  var domain = false;
  var url = extractDomain(window.location.href);
  // Find domain
  try {
    Object.keys(settings.domains).forEach(function(key) {
      if (url.includes(key)) {
        // If we care about domain, start tabIdler
        tabIdler();
        // And set domain to key
        domain = key;
      }
    });
  } catch (e) {
    console.log(e);
  }
  // Init constantise
  if (settings.constantise && domain) {
    docReady(function() {
      addScript(
        "nudge-constantise-script",
        "resources/js/content/constantiser.js",
        {
          domain
        }
      );
      var iconArray = ["link[rel*='shortcut icon']", "link[rel*='icon']"];
      for (var i = 0; i < iconArray.length; i++) {
        var element = document.querySelector(iconArray[i]);
        if (element) {
          updateFavicon(element.href, domain);
          element.remove();
        }
      }
    });
  }
  // Init switch
  if (settings.show_switch && domain) {
    // Init off keyboard shortcut
    offKeyboardShortcut(domain);
    // Init switch HTML
    doAtEarliest(function() {
      addCSS("nudge-circle", "css/pages/switch.css");
      docReady(function() {
        insertSwitch(domain);
      });
    });
  }
  // Init div_hider
  if (settings.div_hider) {
    // Find out if any divs to hide
    divs = settings.divs;
    // Add the CSS that you will need
    doAtEarliest(function() {
      addCSS("nudge-circle", "css/pages/circle.css");
    });
    // Find divs to hide and hide them
    if (keyDefined(divs, domain)) {
      // Do it a first time
      elHiderAndCircleAdder(divs[domain]);
      // Check the div is always covered
      keepAddingCircles(function() {
        elHiderAndCircleAdder(divs[domain]);
      });
    }
    // Array circle adder - also checks if circle exists
    function elHiderAndCircleAdder(array) {
      // if array length = number of 'falses', observer.disconnect
      var hiddenCounter = 0;
      array.forEach(function(item) {
        // If item is hidden
        if (item.hidden) {
          hiddenCounter++;
          try {
            var cleanId = item.name.substring(1);
            // Check that the element is hidden by seeing if the hide style ID is present
            if (!el(`${cleanId}-hide-style`)) {
              styleAdder(
                `${item.name}`,
                elementHideStyle,
                `${cleanId}-hide-style`
              );
            }
            // Try to add a circle
            addCircle(cleanId);
          } catch (e) {
            console.log(e);
          }
        }
      });
      // If nothing is hidden, turn off the observer
      if (hiddenCounter === 0) {
        turnOffObserver = true;
      }
      // Circle add function
      function addCircle(elementId) {
        // Define the element
        var hiddenEl = el(elementId);
        if (hiddenEl) {
          var existingCircles = document.getElementsByClassName(
            "circle-container"
          );
          if (existingCircles.length > 0) {
            for (var i = 0; i < existingCircles.length; i++) {
              var parentId = existingCircles[i].parentNode.id;
              if (parentId == elementId) {
                // We've found that there is a circle with parent with id that matches
                // FIXME: should work for classes too?
                // console.log(`Circle already exists in ${elementId}`);
                return;
              }
            }
          }
          try {
            appendHtml(hiddenEl, tempStorage["circle.html"]);
            clickHandler(hiddenEl.id, domain);
            // console.log(`Added circle in ${elementId}`);
          } catch (e) {
            console.log(e);
          }
        } else {
          // console.log("El doesn't exist");
        }
      }
    }
  }
}

function clickHandler(hiddenElId, domain) {
  function findElementWithParent(className, clickCallback) {
    var elements = document.getElementsByClassName(className);
    for (var i = 0; i < elements.length; i++) {
      if (
        hiddenElId ===
        elements[i].parentNode.parentNode.parentNode.parentNode.parentNode.id
      ) {
        var container = elements[i].parentNode.parentNode.parentNode.parentNode;
        // console.log(`found ${className} in ${hiddenElId}`);
        elements[i].onclick = function() {
          clickCallback(container);
        };
      }
    }
  }
  findElementWithParent("circle-show-once", function(container) {
    unHide(container, hiddenElId, false);
  });
  findElementWithParent("circle-show-always", function(container) {
    unHide(container, hiddenElId, true);
  });
  function unHide(container, hiddenElId, showAlways) {
    deleteEl(container);
    var hideStyle = el(`${hiddenElId}-hide-style`);
    deleteEl(hideStyle);
    for (var j = 0; j < divs[domain].length; j++) {
      if (divs[domain][j].name.includes(hiddenElId)) {
        divs[domain][j].hidden = false;
        if (showAlways) {
          changeSettingRequest(divs, "divs");
        }
        break;
      }
    }
  }
}

function keepAddingCircles(callback) {
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      for (var i = 0; i < mutation.addedNodes.length; i++) {
        callback();
        if (turnOffObserver) {
          console.log("Disconnected observer");
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

function tabIdler() {
  chrome.runtime.sendMessage({ type: "inject_tabidler" }, function(
    response
  ) {});
}

function insertSwitch(domain) {
  var nudgeSwitch = createEl(document.body, "div", "nudge-switch");
  console.log(nudgeSwitch);
  appendHtml(nudgeSwitch, tempStorage["switch.html"]);
  el("nudge-switch").onclick = function() {
    console.log("received clickclickckckc");
    // Needs work here
    console.log(domain);
    switchOffRequest(domain);
  };
}

function offKeyboardShortcut(domain) {
  var keyArray = [];
  document.onkeyup = function(key) {
    keyArray.push(key.keyCode);
    if (keyArray[0] == 40 && keyArray[1] == 18) {
      switchOffRequest(domain);
    }
    if (keyArray.length > 1) {
      keyArray = keyArray.slice(-1);
    }
  };
}
