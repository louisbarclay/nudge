function divHider(settings, url, domain) {
  // Add the CSS that you will need
  doAtEarliest(function () {
    addCSS("nudge-circle", "css/injected/circle.css");
  });
  // Find divs to hide and hide them
  divs = settings.divs;
  // Doesn't matter if it's a Nudge site
  // Matters if it's in the div list
  Object.keys(settings.divs).forEach(function (key) {
    if (url.includes(key)) {
      // Do it a first time
      elHiderAndCircleAdder(settings.divs[key]);
      // Check the div is always covered
      keepAddingCircles(function () {
        // FIXME: how to deactivate it once it's not needed?
        elHiderAndCircleAdder(settings.divs[key]);
      });
    }
  });
  // Array circle adder - also checks if circle exists
  function elHiderAndCircleAdder(array) {
    // Hidden counter is used to turn off observer if possible
    var hiddenCounter = 0;
    array.forEach(function (item) {
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
        appendHtml(element, localStorage["circle.html"]);
        clickHandler(element, domain, hiderId);
        // console.log(`Added circle in ${elementId}`);
      } catch (e) {
        // console.log(e);
      }
    }
  }
}


function makeUniqueSelector(element) {
  // console.log(element);
  // console.log(element.id);
  // console.log(element.parentNode.id);
  // console.log(element.parentNode.parentNode.id);
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
        elements[i].onclick = function () {
          clickCallback(container);
        };
      }
    }
  }
  findElementWithParent("circle-show-once", function (container) {
    unHide(container, element, false);
  });
  findElementWithParent("circle-show-always", function (container) {
    unHide(container, element, true);
  });
  findElementWithParent("circle-share", function (container) {
    // resetPage();
  });

  function unHide(container, element, showAlways) {
    deleteEl(container);
    var hideStyle = el(hiderId);
    deleteEl(hideStyle);
    for (var j = 0; j < divs[domain].length; j++) {
      var found = false;
      var item = divs[domain][j];
      document
        .querySelectorAll(`[${item.type}="${item.name}"]`)
        .forEach(function (hideElement) {
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
  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function () {
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