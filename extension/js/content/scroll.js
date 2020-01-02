var previousScroll = false

var screensToReach = 10
var scrollIncrement = 10
var mostRecentScrollLevel = 0

function scrollCheck(domain) {
  // Check scroll level
  // And Convert it to number of screens
  var scrollLevel = window.scrollY / screen.height

  // log(Math.round(scrollLevel), screensToReach)
  // Check if this is higher than screensToReach
  if (scrollLevel > screensToReach) {
    // If it is, immediately stash that level + 5

    // Check if you are going in a positive direction of travel
    if (scrollLevel > mostRecentScrollLevel) {
      // Start a scroll listener to trigger a scroll nudge at the next scroll (not doing this yet - feels a bit pointless)

      // Do a scroll nudge cycle
      scrollNudge(screensToReach, domain)
    }
    screensToReach = screensToReach + scrollIncrement
  }
  // At the end, update most recent scroll level
  mostRecentScrollLevel = scrollLevel
}

function scrollNudge(screens, domain) {
  // Show the scroll nudge
  el("nudge-scroll-value").innerHTML = screens
  if (
    el("nudge-scroll-controller")
      .classList.toString()
      .includes("nudge-scroll-hide")
  ) {
    toggleClass(el("nudge-scroll-controller"), "nudge-scroll-hide")
  }
  toggleClass(el("nudge-scroll-controller"), "nudge-scroll-show")
  eventLogSender("nudge_scroll", { screens, domain })

  // Hide the scroll nudge after a short time
  setTimeout(function() {
    toggleClass(el("nudge-scroll-controller"), "nudge-scroll-show")
    toggleClass(el("nudge-scroll-controller"), "nudge-scroll-hide")
  }, 4000)
}

function insertScroll(domain) {
  var scrollContainer = createEl(document.body, "div", "nudge-scroll")
  appendHtml(scrollContainer, localStorage["scroll.html"])
  // Start scroll checking
  setInterval(function() {
    scrollCheck(domain)
  }, 1000)
}
