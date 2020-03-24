// Add: refresh page to go snooze mode

var snoozeTime = 10
var lastRealDomain = false
var snoozeMode = false
var snoozeEnd = false

// Variable for setInterval
var timeUpdater = null

var optionsLink = document.getElementById("options")
var timeToday = document.querySelector(".time-headline")
var domainEl = document.querySelector(".domain")
var button = document.getElementById("snooze")
var dontNudge = document.getElementById("dont-nudge")

// The point is that if you have a weird situation where currentDomain is false but currentTabDomain is all good,

// // can i please undo that change? i.e. toggle?
// can i turn Nudge off on weekends or whenever?

// Set snooze time in UX
document.getElementById("snooze-time").innerHTML = snoozeTime

// Set options link
optionsLink.onclick = function() {
  chrome.runtime.sendMessage({
    type: "options"
  })
}

// You want to update certain things onload
window.onload = function() {
  log("onload")
  getSettings(execSettings)
}

// You want to update certain things onfocus
window.onfocus = function() {
  log("onfocus")
  getSettings(execSettings)
}

getSettings(execSettings)

function execSettings(settings) {
  var domain = false
  var url = false
  var whitelist = false
  // Find out what the current tab is
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    // Figure out the domain
    var currentTab = tabs[0]

    if (
      currentTab.url.startsWith("chrome-extension://") &&
      currentTab.url.includes("html/pages/off")
    ) {
      // Get stuff from the query string
      var QueryString = (function() {
        // This function is anonymous, is executed immediately and
        // the return value is assigned to QueryString!
        var query_string = {}
        var query = currentTab.url.substring(1)
        var vars = query.split("&")
        for (var i = 0; i < vars.length; i++) {
          var pair = vars[i].split("=")
          // If first entry with this name
          if (typeof query_string[pair[0]] === "undefined") {
            query_string[pair[0]] = decodeURIComponent(pair[1])
            // If second entry with this name
          } else if (typeof query_string[pair[0]] === "string") {
            var arr = [query_string[pair[0]], decodeURIComponent(pair[1])]
            query_string[pair[0]] = arr
            // If third or later entry with this name
          } else {
            query_string[pair[0]].push(decodeURIComponent(pair[1]))
          }
        }
        return query_string
      })()
      url = QueryString.url
    } else {
      url = currentTab.url
    }
    var isInDomainList = false
    var newDomain = false

    // Find domain
    try {
      domain = domainCheck(currentTab.url, settings)
      if (!isNudgeDomain(domain)) {
        domain = false
      }

      // Quite inefficient, but still need to loop here
      Object.keys(settings.domains).forEach(function(nudgeDomain) {
        if (extractDomain(url).includes(nudgeDomain)) {
          // If it's not being nudged, grab it for newDomain
          if (!settings.domains[nudgeDomain].nudge) {
            // Set newDomain here
            newDomain = nudgeDomain
            log(
              `You're on ${nudgeDomain} but you're not nudging it at the moment`
            )
          } else if (!domain) {
            // It is in there and it IS being nudge so...
            // ...this must mean it's a whitelisted site
            whitelist = true
            // Tricky. Feels like overkill to allow un-whitelisting from popup
          }
          isInDomainList = true
        }
      })
    } catch (e) {
      log(e)
    }

    // Clean up URL for use in adding a domain
    if (!isInDomainList) {
      newDomain = extractDomain(url).split("/")[0]
      newDomain.substring(0, 4) === "www." &&
        (newDomain = newDomain.substring(4))
    }

    // Get today and status
    var today = false
    var status = false
    // Get localStorage for the today stats
    chrome.runtime.sendMessage({ type: "get_localStorage" }, function(
      response
    ) {
      var localStorage = response.localStorage
      today = JSON.parse(localStorage[moment().format("YYYY-MM-DD")])
      status = JSON.parse(localStorage.status)
      // lastRealDomain = status.currentState.lastRealDomain

      if (snoozeMode) {
        //
      } else {
        // If a snooze is on, figure out when it's ending
        if (settings.snooze.all && settings.snooze.all > moment().valueOf()) {
          snoozeEnd = settings.snooze.all
          snoozeMode = true
          setToSnooze(snoozeEnd)
        }
      }

      // Snooze function
      function setToSnooze() {
        function updateButtonText() {
          button.innerHTML = `Stop snooze (${logMinutes(
            Math.round(moment.unix(snoozeEnd / 1000).diff(moment()) / 1000)
          )})`
        }
        updateButtonText()
        toggleClass(button, "popup-snooze-button")

        timeUpdater = setInterval(function() {
          if (Math.round(moment.unix(snoozeEnd).diff(moment()) / 1000)) {
            updateButtonText()
          } else {
            resetButton()
          }
        }, 1000)
      }

      // Function to reset the button
      function resetButton() {
        toggleClass(button, "popup-snooze-button")
        button.innerHTML = `Snooze for ${snoozeTime} minutes`
        clearInterval(timeUpdater)
        snoozeMode = false
      }

      // Set up the snooze button
      button.onclick = function() {
        if (snoozeMode) {
          resetButton()
          // FIXME: wrong
          if (
            !el("refresh")
              .classList.toString()
              .includes("hide")
          ) {
            toggleClass(el("refresh"), "hide")
          }
          changeSettingRequest({ all: false }, "snooze")
        } else {
          snoozeMode = true
          snoozeEnd = moment()
            .add(snoozeTime, "minutes")
            .valueOf()
          changeSettingRequest({ all: snoozeEnd }, "snooze")
          if (
            !el("refresh")
              .classList.toString()
              .includes("hide")
          ) {
            toggleClass(el("refresh"), "hide")
          }
          toggleClass(el("refresh"), "hide")
          // if on an off page, should redirect
          setToSnooze(snoozeEnd)
        }
      }

      // Set the amount of time so far
      if (domain) {
        if (domain in today) {
          timeToday.innerHTML =
            logMinutesNoSeconds(
              today[domain].runningCounter +
                ("time" in today[domain] ? today[domain].time / 1000 : 0)
            ) + " "
        } else {
          timeToday.innerHTML = "0m"
        }
        domainEl.innerHTML = domain
        el("dont-nudge").innerHTML = `Don't nudge ${domain}`
      } else {
        // Check that this is a site you could want to nudge
        if (url.startsWith("http")) {
          if (whitelist) {
            el(
              "dont-nudge"
            ).innerHTML = `Change your whitelist to nudge this site`

            el("on").innerHTML = "You're on a whitelisted site"
          } else {
            el("dont-nudge").innerHTML = `Nudge ${newDomain}`
            el("on").innerHTML = "Not on a Nudge site. Nice one!"
          }
        } else {
          el("dont-nudge").innerHTML = ``
          el("on").innerHTML = ``
        }

        // if (!timeToday.classList.toString().includes('hide')) {
        //   toggleClass(timeToday, 'hide');
        // }
        timeToday.innerHTML = ";)"
        if (!domainEl.classList.toString().includes("hide")) {
          toggleClass(domainEl, "hide")
        }
        if (
          !el("today")
            .classList.toString()
            .includes("hide")
        ) {
          toggleClass(el("today"), "hide")
        }
        // if (el('logo').classList.toString().includes('hide')) {
        //   toggleClass(el('logo'), 'hide')
        // }
      }

      // Set up 'dont Nudge'
      if (!whitelist) {
        el("dont-nudge").onclick = function() {
          log(url)
          if (domain && url.startsWith("http")) {
            el("dont-nudge").innerHTML = `Nudge ${domain}`
            changeSettingRequest(false, "domains", domain, "nudge")
            newDomain = domain
            domain = false
          } else {
            // Need to figure out if it's in the list before toggling it
            // For that, need to extract the raw domain first! Because currently you've just got 'false'
            if (isInDomainList) {
              log(newDomain)
              domain = newDomain
              changeSettingRequest(true, "domains", newDomain, "nudge")
              el("dont-nudge").innerHTML = `Don't nudge ${domain}`
            } else {
              log(newDomain)
              log("Not in domain list, adding fresh")
              domain = newDomain
              changeSettingRequest(true, "domains", newDomain, "add")
              el("dont-nudge").innerHTML = `Don't nudge ${domain}`
            }
          }
        }
      }

      el("reset-hide").onclick = function() {
        var unhiddenDivs = settings.unhidden_divs
        const newUnhiddenDivs = unhiddenDivs.filter(div => {
          return !div.includes(domain)
        })
        changeSettingRequest(newUnhiddenDivs, "unhidden_divs")
      }
    })
  })
}
