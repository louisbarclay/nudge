// Options set
getSettings(execSettings)

// Have to load these all here to get them in early
sendHTMLRequest(getUrl("html/injected/other/circle.html"), storeForUse)
sendHTMLRequest(getUrl("html/injected/nudge/corner.html"), storeForUse)
sendHTMLRequest(getUrl("html/injected/nudge/scroll.html"), storeForUse)

function execSettings(settings) {
  // Check for snooze
  if (settings.snooze.all > +Date.now()) {
    log("Snoozed")
    return
  }

  // Set domain as false
  var domain = false

  var url = window.location.href

  // Find domain
  try {
    domain = domainCheck(url, settings)
  } catch (e) {
    log(e)
  }

  // Init div hider
  if (settings.div_hider) {
    divHider(settings, url, domain)
  }

  if (domain) {
    doAtEarliest(function() {
      addCSS("nudges", "css/injected/nudges.css")
      docReady(function() {
        if (settings.time_nudge) {
          insertCorner(domain, settings.off_by_default)
        }
        if (settings.scroll_nudge) {
          insertScroll(domain, false)
        }
      })
    })

    // Init off keyboard shortcut
    keyboardShortcut(domain)

    // Tab idler
    tabIdler()

    // Listener for corner
    chrome.runtime.onMessage.addListener(function(request) {
      // Prevent non-domains from changing this
      if (
        request.type === "live_update" &&
        extractDomain(window.location.href).includes(request.domain)
      ) {
        cornerInit(request.total, request.visits, request.domain)
      }
    })
  }
}

function keyboardShortcut(domain) {
  document.onkeyup = function(key) {
    if (key.altKey && key.keyCode == 40) {
      switchOffRequest(domain)
    }
  }
}
