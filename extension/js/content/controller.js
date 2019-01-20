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
        keepAddingCircles(function() {
          // FIXME: how to deactivate it once it's not needed?
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
          try {
            // If it has an ID, get it by ID
            if (item.type === "id") {
              var element = document.getElementById(item.name);
              if (element) {
                processForCircle(element);
              }
              // If it has a class name, get it by className
            } else if (item.type === "class") {
              for (element of document.getElementsByClassName(item.name)) {
                processForCircle(element);
              }
              // Else, reluctantly user querySelectorAll
            } else {
              document
                .querySelectorAll(`[${item.type}="${item.name}"]`)
                .forEach(element => {
                  processForCircle(element);
                  // Try to add a circle
                  addCircle(element);
                });
            }

            // The next step
            function processForCircle(element) {
              hiddenCounter++;
              // Check that the element is hidden by seeing if the hide style ID is present
              // This also checks for elements under the same class being hidden already
              var hiderId = false;

              if (item.type === "id") {
                hiderId = `#${item.name}-hide-style`;
                if (!el(hiderId)) {
                  styleAdder(`#${item.name}`, elementHideStyle, hiderId);
                }
              } else if (item.type === "class") {
                hiderId = `${item.name
                  .replace(/(^|\s+)/g, "$1.")
                  .replace(/\s/g, "")}-hide-style`;
                if (!el(hiderId)) {
                  styleAdder(
                    `${item.name
                      .replace(/(^|\s+)/g, "$1.")
                      .replace(/\s/g, "")}`,
                    elementHideStyle,
                    hiderId
                  );
                }
              } else if (element.id !== "") {
                hiderId = `#${element.id}-hide-style`;
                if (!el(`#${element.id}-hide-style`)) {
                  styleAdder(`#${element.id}`, elementHideStyle, hiderId);
                }
              } else {
                console.log("Can't hide this one");
              }

              // Try to add a circle
              if (hiderId) {
                addCircle(element, hiderId);
              }
            }
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
      function addCircle(element, hiderId) {
        var existingCircles = document.getElementsByClassName(
          "circle-container"
        );
        if (existingCircles.length > 0) {
          for (var i = 0; i < existingCircles.length; i++) {
            if (existingCircles[i].parentNode === element) {
              // We've found that there is a circle with parent that is our current element
              return;
            }
          }
        }
        try {
          appendHtml(element, tempStorage["circle.html"]);
          clickHandler(element, domain, hiderId);
          // console.log(`Added circle in ${elementId}`);
        } catch (e) {
          // console.log(e);
        }
      }
    }
  }
}

function makeUniqueSelector(element) {
  console.log(element);
  console.log(element.id);
  console.log(element.parentNode.id);
  console.log(element.parentNode.parentNode.id);
  var selector = false;

  if (element.id === "") {
    if (element.parentNode.id === "") {
      if (element.parentNode.parentNode.id === "") {
        selector =
          `#${element.parentNode.parentNode.id}` +
          element.className.replace(/(^|\s+)/g, "$1.").replace(/\s/g, "");
      }
    } else {
      selector =
        `#${element.parentNode.id}` +
        element.className.replace(/(^|\s+)/g, "$1.").replace(/\s/g, "");
    }
  } else {
    selector = `#${element.id}`;
  }
  return selector;
}

function clickHandler(element, domain, hiderId) {
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
  findElementWithParent("circle-reset-settings", function (container) {
    resetPage();
  });
  function resetPage() {
    for (var i = 0; i < divs[domain].length; i++) {
      if (!divs[domain][i].hidden) {
        divs[domain][i].hidden = true;
        changeSettingRequest(divs, "divs");
      }
    }
  }
  function unHide(container, element, showAlways) {
    deleteEl(container);
    var hideStyle = el(hiderId);
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
    mutations.forEach(function() {
      callback();
      // if (turnOffObserver) {
      //   // console.log("Disconnected observer");
      //   observer.disconnect();
      // }
    });
  });

  observer.observe(document, {
    childList: false,
    subtree: true,
    characterData: false,
    attributeFilter: ["class", "id", "data-module"]
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
