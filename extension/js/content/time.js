// Add corner to Nudge

var increment = 300 // in seconds
var minLevelMultiple = 1
var showingContainer = false
var currentLevel = false

// For testing
if (config.fastTimer) {
  increment = 30 // in seconds
  minLevelMultiple = 1
}

// For preview mode
function manualTimeControl() {
  var totalSeconds = 0
  document.onkeyup = function(key) {
    if (key.altKey && key.keyCode == 39) {
      totalSeconds = totalSeconds + 300
      cornerInit(totalSeconds, false, "twitter.com")
    }
  }
}

if (config.previewMode) {
  manualTimeControl()
}

function cornerInit(totalSeconds, totalVisits, domain) {
  // First the container must exist. This is handled by insertCorner
  // All this does is adds class 'nudge-container-reveal' to container,
  // And adds some opacity to the quarters
  // Define elements
  var jsTime = document.getElementById("js-time")
  var visits = document.getElementById("js-visits")
  var nudgeContainer = document.getElementsByClassName("nudge-container")[0]
  // Round seconds just in case
  totalSeconds = Math.round(totalSeconds)
  var timeMins = logMinutesNoSeconds(totalSeconds)

  // Set domain in text
  Array.from(document.getElementsByClassName("js-domain")).forEach(function(
    element
  ) {
    // Don't change the domain if it's already fine!
    if (element.innerHTML !== domain) {
      element.innerHTML = domain
    }
  })

  // Update time
  if (jsTime) {
    // Don't change the time if it's already fine!
    if (jsTime.innerHTML !== timeMins) {
      jsTime.innerHTML = timeMins
    }
  }

  // Update visits
  if (visits) {
    visits.innerHTML = `${totalVisits} visits`
  }

  // Only show if container exists and if above increment
  if (totalSeconds >= increment * minLevelMultiple && nudgeContainer) {
    // Find current level
    var doNotUpdate = false
    // Use Math.floor here instead!
    if (currentLevel === Math.floor(totalSeconds / increment)) {
      doNotUpdate = true
    } else {
      currentLevel = Math.floor(totalSeconds / increment)
    }
    // Show container if not showing
    if (!showingContainer) {
      toggleClass(nudgeContainer, "nudge-container-reveal")
      showingContainer = true
    }

    // Define quarter style
    var quarterStyle = `{ opacity: 1 !important; visibility: visible !important; }`
    var quartersStyle = `{ opacity: 0.4 !important; }`
    // Define quarter class and style
    for (var i = 1; i <= currentLevel; i++) {
      // Find out if that quarter style already exists
      if (document.getElementById(`nudge-quarter-${i}-style`)) {
      } else if (!doNotUpdate) {
        styleAdder(
          `#nudge #nudge-quarter-${i}`,
          quarterStyle,
          `nudge-quarter-${i}-style`
        )
        if (i === currentLevel) {
          // This should be here to avoid sending duplicate events
          eventLogSender("nudge_time", {
            currentLevel,
            totalSeconds,
            fastTimer: config.fastTimer
          })
        }
      }
      // Run this condition at the end of the loop
      if (
        i === currentLevel &&
        !document.getElementById("nudge-quarters-style")
      ) {
        // Lastly, give overall quarters some opacity
        styleAdder(
          `#nudge .nudge-quarters`,
          quartersStyle,
          `nudge-quarters-style`
        )
      }
    }
  }
}

function insertCorner(domain, off_by_default) {
  var cornerContainer = createEl(document.body, "div", "nudge")
  appendHtml(cornerContainer, nudgeStorage["corner.html"])
  // Remove
  var remove = document.getElementById("js-hide")
  remove.onclick = function hideBanner() {
    deleteEl(cornerContainer)
  }
  // Open settings
  var settings = document.getElementById("js-settings")
  settings.onclick = function openSettings() {
    sendMessage("options", {})
  }
  if (!off_by_default) {
    document.getElementById("js-off-by-default").innerHTML =
      "Switch off and close "
  }
  // Close tab
  var closeTab = document.getElementById("js-close-tab")
  closeTab.onclick = function closeTabWithNudge() {
    sendMessage("close_all", { domain })
    if (!off_by_default) {
      switchOffRequest(domain)
    }
  }
}
