// Options set
getSettings(execSettings);

// Prep in case doing div hiding
sendHTMLRequest(getUrl("html/components/circle.html"), storeForUse);

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
    });
  }
  // Init div_hider
  if (settings.div_hider) {
    // Circle add function
    function addCircle(element) {
      try {
        var hiddenElement = document.querySelector(element.name);
        appendHtml(hiddenElement, tempStorage["circle.html"]);
      } catch (e) {
        console.log(e);
      }
    }

    // Find divs to hide and hide them
    if (keyDefined(divs, domain)) {
      var divArray = divs[domain];
      var elementHideStyle =
        "{ visibility: hidden; pointer-events: none; cursor: default }";
      doAtEarliest(function() {
        addCSS("nudge-circle", "css/pages/circle.css");
        divArray.forEach(function(item) {
          styleAdder(`${item.name}`, elementHideStyle);
          docReady(function() {
            addCircle(item);
          });
        });
      });
    }
  }
}

function tabIdler() {
  chrome.runtime.sendMessage({ type: "inject_tabidler" }, function(
    response
  ) {});
}
