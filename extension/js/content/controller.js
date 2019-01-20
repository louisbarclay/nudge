var divs = false;
var turnOffObserver = false;
var time = false;
var increment = 300; // in seconds
var minLevelMultiple = 1;
var pxPerLevel = 100;

// For testing FIXME: make the labels show the correct values off a shared JSON?
// increment = 30; // in seconds
// minLevelMultiple = 1;
// pxPerLevel = 100;

var showingContainer = false;
var currentLevel = false;

// Options set
getSettings(execSettings);

sendHTMLRequest(getUrl("html/injected/other/circle.html"), storeForUse);
sendHTMLRequest(getUrl("html/injected/nudge/corner.html"), storeForUse);

// The images that need caching
var imagesToCache = [
  "icon/logo-color.svg",
  "icon/closewhite.svg",
  "icon/hidegreynew.svg",
  "icon/hidewhitenew.svg",
  "icon/newcoggrey.svg",
  "icon/newcogwhite.svg",
  "icon/closegrey.svg",
  "icon/offswitch.svg",
  "icon/newcirclewhite.svg"
];

// Cache images
imagesToCache.forEach(function(imageUrl) {
  var image = new Image();
  image.src = chrome.extension.getURL(`img/${imageUrl}`);
});

// Test stuff
if (document.getElementById("nudge-test-input")) {
  cornerInit(200, 16, "facebook.com");
  document.getElementById("nudge-test-input").oninput = function() {
    cornerInit(
      parseInt(document.getElementById("nudge-test-input").value),
      19,
      "guardian.co.uk"
    );
  };
}

// Add font that you need
// var link = document.createElement("link");
// link.href = "https://fonts.googleapis.com/css?family=Open+Sans";
// link.rel = "stylesheet";

// if (!document.head) {
//   doAtEarliest(function() {
//     document.head.appendChild(link);
//   });
// } else {
//   document.head.appendChild(link);
// }

chrome.runtime.onMessage.addListener(function(request) {
  // Prevent non-domains from changing this
  if (
    request.type === "live_update" &&
    extractDomain(window.location.href).includes(request.domain)
  ) {
    cornerInit(request.total, request.visits, request.domain);
  }
});

function cornerInit(totalSeconds, totalVisits, domain) {
  // First the container must exist. This is handled by insertCorner
  // All this does is adds class 'nudge-container-reveal' to container,
  // And adds some opacity to the quarters

  // console.log(totalSeconds, domain);
  // Define elements
  var jsTime = document.getElementById("js-time");
  var visits = document.getElementById("js-visits");
  var nudgeContainer = document.getElementsByClassName("nudge-container")[0];
  // Round seconds just in case
  totalSeconds = Math.round(totalSeconds);
  var timeMins = logMinutesNoSeconds(totalSeconds);

  // Set domain in text
  Array.from(document.getElementsByClassName("js-domain")).forEach(function(
    element
  ) {
    element.innerHTML = domain;
  });

  // Update time
  if (jsTime) {
    jsTime.innerHTML = timeMins;
  }

  // Update visits
  if (visits) {
    visits.innerHTML = `${totalVisits} visits`;
  }

  // Only show if container exists and if above increment
  if (totalSeconds >= increment * minLevelMultiple && nudgeContainer) {
    // Find current level
    var doNotUpdate = false;
    // Use Math.floor here instead!
    if (currentLevel === Math.floor(totalSeconds / increment)) {
      doNotUpdate = true;
    } else {
      currentLevel = Math.floor(totalSeconds / increment);
    }
    // Show container if not showing
    if (!showingContainer) {
      toggleClass(nudgeContainer, "nudge-container-reveal");
      showingContainer = true;
    }

    // Define quarter style
    var quarterStyle = `{ opacity: 1 !important; visibility: visible !important; }`;
    var quartersStyle = `{ opacity: 0.4 !important; }`;
    // Define quarter class and style
    // console.log(currentLevel);
    for (var i = 1; i <= currentLevel; i++) {
      // Find out if that quarter style already exists
      if (document.getElementById(`nudge-quarter-${i}-style`)) {
      } else if (!doNotUpdate) {
        styleAdder(
          `#nudge #nudge-quarter-${i}`,
          quarterStyle,
          `nudge-quarter-${i}-style`
        );
      }
      if (
        i === currentLevel &&
        !document.getElementById("nudge-quarters-style")
      ) {
        // Lastly, give overall quarters some opacity
        styleAdder(
          `#nudge .nudge-quarters`,
          quartersStyle,
          `nudge-quarters-style`
        );
      }
    }
  }
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
  // Init Nudge
  // Note: time_nudge is now setting for corner
  if (settings.time_nudge && domain) {
    // Init off keyboard shortcut
    cycleThroughBackgrounds(domain);
    // Init switch HTML
    doAtEarliest(function() {
      addCSS("nudges", "css/injected/nudges.css");
      docReady(function() {
        insertCorner(domain, settings.off_by_default);
      });
    });
  }
  // Init div_hider
  if (settings.div_hider) {
    
    // Ignore Twitter while broken
    if (domain === 'twitter.com') {
      return;
    }
    
    // Add the CSS that you will need
    doAtEarliest(function() {
      addCSS("nudge-circle", "css/injected/circle.css");
    });
    // Find divs to hide and hide them
    divs = settings.divs;
    // Doesn't matter if it's a Nudge site
    // Matters if it's in the div list
    Object.keys(settings.divs).forEach(function(key) {
      if (url.includes(key)) {
        // Do it a first time
        elHiderAndCircleAdder(settings.divs[key]);
        // Check the div is always covered
        // setInterval(function () { 
        //   elHiderAndCircleAdder(settings.divs[key]) 
        // }, 1000);
        keepAddingCircles(function() {
          // Deactivate it once every  element is hidden basically
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
                var selector = makeUniqueSelector(element);
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

function makeUniqueSelector(element) {
  var selector = false;
  if (element.id === "") {
    if (element.parentNode.id === "") {
      if (element.parentNode.parentNode.id === "") {
        selector = `#${element.parentNode.parentNode.id}` + element.className.replace(/(^|\s+)/g, "$1.").replace(/\s/g, "");
      }
    } else {
      selector = `#${element.parentNode.id}` + element.className.replace(/(^|\s+)/g, "$1.").replace(/\s/g, "");
    }
  } else {
    selector = `#${element.id}`;
  }
  return selector;
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
    console.log(container, element);
    deleteEl(container);
    var selector = makeUniqueSelector(element);
    console.log(element);
    console.log(selector);
    var hideStyle = el(`${selector}-hide-style`);
    console.log(hideStyle);
    deleteEl(hideStyle);
    for (var j = 0; j < divs[domain].length; j++) {
      var found = false;
      var item = divs[domain][j];
      document
        .querySelectorAll(`[${item.type}="${item.name}"]`)
        .forEach(function(hideElement) {
          if (hideElement === element) {
            divs[domain][j].hidden = false;
            if (showAlways) {
              changeSettingRequest(divs, "divs");
            }
            found = true;
          }
        });
      if (found) {
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

function insertCorner(domain, off_by_default) {
  var cornerContainer = createEl(document.body, "div", "nudge");
  appendHtml(cornerContainer, tempStorage["corner.html"]);
  // Remove
  var remove = document.getElementById("js-hide");
  remove.onclick = function hideBanner() {
    deleteEl(cornerContainer);
  };
  // Open settings
  var settings = document.getElementById("js-settings");
  settings.onclick = function openSettings() {
    sendMessage("options", {});
  };
  if (!off_by_default) {
    document.getElementById("js-off-by-default").innerHTML =
      "Switch off and close ";
  }
  // Close tab
  var closeTab = document.getElementById("js-close-tab");
  closeTab.onclick = function closeTabWithNudge() {
    sendMessage("close_all", { domain });
    if (!off_by_default) {
      switchOffRequest(domain);
    }
  };
}

function cycleThroughBackgrounds(domain) {
  document.onkeyup = function(key) {
    if (key.altKey && key.keyCode == 40) {
      switchOffRequest(domain);
    }
  };
}
