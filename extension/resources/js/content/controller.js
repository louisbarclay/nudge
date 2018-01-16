// Listen for option changes
var domain = extractDomain(window.location.href);

// Options
var constantise = false;

// Options set
getSettings(execSettings);

// Prep in case doing div hiding
sendHTMLRequest(getUrl("html/components/circle.html"), storeForUse);

function execSettings(settings) {
  constantise = settings.constantise;
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
  try {
    Object.keys(settings.domains).forEach(function(key) {
      if (domain.includes(key)) {
        console.log('injected tabidler');
        tabIdler();
      }
    });
  } catch (e) {
    console.log(e);
  }
}

// Is this legit?
chrome.storage.sync.get("settings", function(items) {
  // execute script to stop the divs_arrays appearing. and pass info on which to stop
});

docReady(function() {
  if (constantise) {
    addScript("nudge-facebook-script", "resources/js/content/constantiser.js", {
      domain
    });
  }
});

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
