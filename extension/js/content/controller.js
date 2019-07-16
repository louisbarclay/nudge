// Variables with initial values
var divs = false;
var turnOffObserver = false;
var time = false;

// Options set
getSettings(execSettings);

// Have to load these all here to get them in early
sendHTMLRequest(getUrl("html/injected/other/circle.html"), storeForUse);
sendHTMLRequest(getUrl("html/injected/nudge/corner.html"), storeForUse);
sendHTMLRequest(getUrl("html/injected/nudge/scroll.html"), storeForUse);

function execSettings(settings) {

  // Check for snooze
  if (settings.snooze.all > (+ Date.now())) {
    console.log('Snoozed');
    return;
  }
  // Weekend mode happens here!

  // Set domain as false
  var domain = false;

  var url = window.location.href;

  // Find domain
  try {
    domain = domainCheck(url, settings);
  } catch (e) {
    console.log(e)
  }

  if (domain) {
    doAtEarliest(function () {
      addCSS("nudges", "css/injected/nudges.css");
      docReady(function () {
        if (settings.time_nudge) {
          insertCorner(domain, settings.off_by_default);
        }
        if (settings.scroll_nudge) {
          insertScroll(domain, false);
        }
      });
    });

    // Init off keyboard shortcut
    keyboardShortcut(domain);

    // Tab idler
    tabIdler();

    // Listener for corner
    chrome.runtime.onMessage.addListener(function (request) {
      // Prevent non-domains from changing this
      if (
        request.type === "live_update" &&
        extractDomain(window.location.href).includes(request.domain)
      ) {
        cornerInit(request.total, request.visits, request.domain);
      }
    });

    // Init div hider
    if (settings.div_hider) {
      divHider(settings, url, domain)
    }

    // Init constantise
    if (false) {
      // FIXME: constantiser off until it works again
      // if (settings.constantise) {
      docReady(function () {
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
  }

}

function keyboardShortcut(domain) {
  document.onkeyup = function (key) {
    if (key.altKey && key.keyCode == 40) {
      switchOffRequest(domain);
    }
  };
}

