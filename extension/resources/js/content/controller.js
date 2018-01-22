// Options set
getSettings(execSettings);

// Prep in case doing div hiding
sendHTMLRequest(getUrl("html/components/circle.html"), storeForUse);

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
