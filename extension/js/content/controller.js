var divs = false;
var turnOffObserver = false;
var time = false;

// Check if it exists
// Check if you are over 5 mins
// If over 5 mins, create it. Fade in
// Every 5 minutes, increase it in size. With transition.
// Flash up the time in red and sync with the new slice being in red?
// User can hide it. Which will happen for ten minutes if requested.
// Leaves message 'hidden until this page is visited again or refreshed'
// User can 'Don't Nudge this site'
// 'Settings'

// Options set
getSettings(execSettings);

// Prep in case doing div hiding
sendHTMLRequest(getUrl("html/injected/other/circle.html"), storeForUse);
sendHTMLRequest(getUrl("html/injected/nudge/corner.html"), storeForUse);

// Add font to the thing. the head
// <link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet">

var increment = 60;
var pxPerIncrement = 10;
var showingContainer = false;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === "live_update") {
    // Define elements
    time = document.getElementById("js-time");
    var container = document.querySelector(".nudge-container");
    // Update time
    if (time) {
      time.innerHTML = logMinutes(request.total);
    }
    // Only show if container exists and if above increment
    if (request.total >= increment && container) {
      // Find current level
      var currentLevel = Math.round(request.total / increment);
      // Show container if not showing
      if (!showingContainer) {
        toggleClass(container, "nudge-container-reveal");
        showingContainer = true;
      }
      // Define quarter class and style
      var quarterClass = ".nudge-quarter";
      var quarterStyle = `{ height: ${currentLevel *
        pxPerIncrement}px !important; width: ${currentLevel *
        pxPerIncrement}px !important; }`;
      // Give size to quarter if none
      var quarter = document.getElementById("quarter-size");
      // If quarter doesn't exist, make it
      if (!quarter) {
        styleAdder(quarterClass, quarterStyle, "quarter-size");
        // If it does, check if it needs to be updated
      } else if (request.total % increment === 0) {
        quarter.innerHTML = quarterClass + quarterStyle;
      }
    }
  }
});

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
    // console.log(e);
  }
  // Init constantise
  if (false) {
    // FIXME: turn off constantiser until it works again
    // if (settings.constantise && domain) {
    docReady(function() {
      addScript("nudge-constantise-script", "js/content/constantiser.js", {
        domain
      });
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
  // Init switch TODO: show_switch is now setting for banner. And banner is actually not really a banner
  if (settings.show_switch && domain) {
    // Init off keyboard shortcut
    offKeyboardShortcut(domain);
    // Init switch HTML
    doAtEarliest(function() {
      addCSS("nudges", "css/injected/nudges.css");
      docReady(function() {
        insertBanner(domain);
      });
    });
  }
  // Init div_hider
  if (settings.div_hider) {
    // Add the CSS that you will need
    doAtEarliest(function() {
      addCSS("nudge-circle", "css/injected/circle.css");
    });
    // Find divs to hide and hide them
    // Doesn't matter if it's a Nudge site
    // Matters if it's in the div list
    Object.keys(settings.divs).forEach(function (key) {
      if (url.includes(key)) {
        // Do it a first time
        elHiderAndCircleAdder(settings.divs[key]);
        // Check the div is always covered
        keepAddingCircles(function() {
          elHiderAndCircleAdder(settings.divs[key]);
        });
      }
    });
    // Array circle adder - also checks if circle exists
    function elHiderAndCircleAdder(array) {
      // Hidden counter is used to turn off observer if possible
      var hiddenCounter = 0;
      array.forEach(function(item) {
        // If item is hidden
        if (item.hidden) {
          hiddenCounter++;
          try {
            document
              .querySelectorAll(`[${item.type}="${item.name}"]`)
              .forEach(element => {
                // If no id, use classes
                var selector = makeSelector(element);
                // Check that the element is hidden by seeing if the hide style ID is present
                if (!el(`${selector}-hide-style`)) {
                  styleAdder(
                    selector,
                    elementHideStyle,
                    `${selector}-hide-style`
                  );
                }
                // Try to add a circle
                addCircle(element);
              });
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
      function addCircle(element) {
        var existingCircles = document.getElementsByClassName(
          "circle-container"
        );
        if (existingCircles.length > 0) {
          for (var i = 0; i < existingCircles.length; i++) {
            if (existingCircles[i].parentNode === element) {
              // We've found that there is a circle with parent with id that matches
              // FIXME: should work for classes too?
              // console.log(`Circle already exists in ${elementId}`);
              return;
            }
          }
        }
        try {
          appendHtml(element, tempStorage["circle.html"]);
          clickHandler(element, domain);
          // console.log(`Added circle in ${elementId}`);
        } catch (e) {
          // console.log(e);
        }
      }
    }
  }
}

function clickHandler(element, domain) {
  function findElementWithParent(className, clickCallback) {
    var elements = document.getElementsByClassName(className);
    for (var i = 0; i < elements.length; i++) {
      if (
        element ===
        elements[i].parentNode.parentNode.parentNode.parentNode.parentNode
      ) {
        var container = elements[i].parentNode.parentNode.parentNode.parentNode;
        elements[i].onclick = function() {
          clickCallback(container);
        };
      }
    }
  }
  findElementWithParent("circle-show-once", function(container) {
    unHide(container, element, false);
  });
  findElementWithParent("circle-show-always", function(container) {
    unHide(container, element, true);
  });
  function unHide(container, element, showAlways) {
    deleteEl(container);
    var selector = makeSelector(element);
    var hideStyle = el(`${selector}-hide-style`);
    deleteEl(hideStyle);
    for (var j = 0; j < divs[domain].length; j++) {
      if (
        divs[domain][j].name.includes(element.id) ||
        divs[domain][j].name.includes(element.class)
      ) {
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
          // console.log("Disconnected observer");
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
  chrome.runtime.sendMessage({ type: "inject_tabidler" }, function(response) {
    if (response) {
    }
  });
}

function insertBanner(domain) {
  var cornerContainer = createEl(document.body, "div", "nudge");
  appendHtml(cornerContainer, tempStorage["corner.html"]);
  var remove = document.getElementById("js-hide");
  remove.onclick = function hideBanner() {
    deleteEl(cornerContainer);
  };
}

function offKeyboardShortcut(domain) {
  document.onkeyup = function(key) {
    if (key.altKey && key.keyCode == 40) {
      switchOffRequest(domain);
    }
  };
}
