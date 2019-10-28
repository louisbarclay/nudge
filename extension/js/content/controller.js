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
    var extractedDomain = extractDomain(url)
    settings.whitelist.forEach(function(whitelistDomain) {
      // log(whitelistDomain)
      if (
        extractedDomain &&
        extractedDomain.includes(whitelistDomain.split("/")[0])
      ) {
        // log(whitelistDomain.split('/')[0]);
        var match = true
        for (var i = 0; i < whitelistDomain.split("*").length; i++) {
          // log(url, whitelistDomain.split('*')[i])
          if (!url.includes(whitelistDomain.split("*")[i])) {
            match = false
          }
        }

        if (match) {
          // Whitelisted
          extractedDomain = false
        }
      }
    })
    if (extractedDomain) {
      // If we have a domain, pass that through. If not, pass through extractedDomain
      divHider(settings, url, domain || extractedDomain)
    }
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
