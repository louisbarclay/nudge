var previousScroll = false;

var screensToReach = 10;
var scrollIncrement = 10;
var mostRecentScrollLevel = 0;

function scrollCheck() {

  // Check scroll level
  // And Convert it to number of screens
  var scrollLevel = window.scrollY / screen.height;

  // Check if this is higher than screensToReach
  if (scrollLevel > screensToReach) {
    // If it is, immediately stash that level + 5

    // Check if you are going in a positive direction of travel
    if (scrollLevel > mostRecentScrollLevel) {

      // Start a scroll listener to trigger a scroll nudge at the next scroll (not doing this yet - feels a bit pointless)

      // Do a scroll nudge cycle
      scrollCycle(screensToReach);

    }
    screensToReach = screensToReach + scrollIncrement;
  }
  // At the end, update most recent scroll level
  mostRecentScrollLevel = scrollLevel;
}

function scrollCycle(screens) {
  // Show the scroll nudge
  el('nudge-scroll-value').innerHTML = screens;
  if (el('nudge-scroll-controller').classList.toString().includes('nudge-scroll-hide')) {
    toggleClass(el('nudge-scroll-controller'), 'nudge-scroll-hide');
  }
  toggleClass(el('nudge-scroll-controller'), 'nudge-scroll-show')

  // Hide the scroll nudge after a short time
  setTimeout(function () {
    toggleClass(el('nudge-scroll-controller'), 'nudge-scroll-show')
    toggleClass(el('nudge-scroll-controller'), 'nudge-scroll-hide')
  }, 4000)
}

function insertScroll() {
  var scrollContainer = createEl(document.body, "div", "nudge-scroll");
  appendHtml(scrollContainer, localStorage["scroll.html"]);
  // Start scroll checking
  setInterval(function () {
    scrollCheck()
  }, 1000);
}