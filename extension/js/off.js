// Off elements that we care about
var off = "off-"
var js = "js-"

var slider = document.querySelector(`.${off}slider`)
var sliderText = document.querySelector(`.${off}slider-text`)
var button = document.querySelector(`.${off}button`)
var centre = document.querySelector(`.${off}button-centre`)
var domainText = document.getElementsByClassName(`${js}domain`)
var tagline = document.getElementById(`tagline`)
var switch_ons = false
var getStickier = true
var settings = document.getElementsByClassName(`${off}settings`)
var settings2 = document.getElementById(`js-settings2`)
var headline = document.getElementById(`js-headline`)

// Signup mode
var signupMode = true
var surveyMode = false

// Settings click handlers
Array.from(settings).forEach(function(element) {
  element.onclick = function() {
    chrome.runtime.openOptionsPage()
  }
})

el("js-time").innerHTML = moment().format("h:mma")

setInterval(updateTimer, 1000)

function updateTimer() {
  if (el("js-time").innerHTML !== moment().format("h:mma")) {
    el("js-time").innerHTML = moment().format("h:mma")
  }
}

function goalInit(dailyGoal) {
  var goal = el("js-goal")
  var hasSaved = false
  var today = moment().format("YYYY-MM-DD")
  var goalCheck = el("goal-check")

  docReady(function() {
    goal.style.opacity = 1
  })

  if (dailyGoal && dailyGoal.substring(0, 10) === today) {
    hasSaved === true
    goal.value = dailyGoal.substring(11)
    if (dailyGoal[10] === "T") {
      goalCheck.checked = true
      goal.style.textDecoration = "line-through"
    }
    goal.style.transition = "width 0s"
    goalActive(dailyGoal.substring(11))
  }

  goal.oninput = function() {
    if (hasSaved) {
      var goalShadow = el("js-width-test")
      goalShadow.innerHTML = goal.value
      goal.style.transition = "width 0s"
      goal.style.width = goalShadow.clientWidth + 21 + "px"
      changeSettingRequest(
        `${today}${goalCheck.checked ? "T" : "F"}${goal.value}`,
        "daily_goal"
      )
    }
  }

  var escBlur = false

  goal.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
      if (goal.value === "") {
        goalReset()
        goal.blur()
      } else {
        // Cancel the default action, if needed
        goalActive(goal.value)
        changeSettingRequest(
          `${today}${goalCheck.checked ? "T" : "F"}${goal.value}`,
          "daily_goal"
        )
      }
    }
    if (event.keyCode === 27) {
      goalReset()
      goal.value = ""
      goal.blur()
      escBlur = true
    }
  })

  function goalActive(dailyGoal) {
    var goalShadow = el("js-width-test")
    goalShadow.innerHTML = dailyGoal
    docReady(function() {
      goal.style.width = goalShadow.clientWidth + 21 + "px"
    })
    hasSaved = true
    el("js-today-label").style.opacity = 1
    setTimeout(showCheckbox, 200)
    function showCheckbox() {
      el("js-checkbox").style.display = "block"
    }
  }

  goal.onblur = function() {
    if (escBlur) {
      escBlur = false
    } else {
      if (goal.value === "") {
        goalReset()
      } else {
        goalActive(goal.value)
        changeSettingRequest(
          `${today}${goalCheck.checked ? "T" : "F"}${goal.value}`,
          "daily_goal"
        )
      }
    }
  }

  function goalReset() {
    goal.style.width = "15.5em"
    hasSaved = false
    el("js-checkbox").style.display = "none"
    el("js-today-label").style.opacity = 0
    goal.style.transition = "width 0.2s"
    goalCheck.checked = false
    goal.style.textDecoration = "none"
    changeSettingRequest(false, "daily_goal")
  }

  goalCheck.onclick = function() {
    if (goalCheck.checked) {
      goal.style.textDecoration = "line-through"
    } else {
      goal.style.textDecoration = "none"
    }
    if (goal.value !== "") {
      changeSettingRequest(
        `${today}${goalCheck.checked ? "T" : "F"}${goal.value}`,
        "daily_goal"
      )
    }
  }
}

// FIXME: this is a bit of a kludge
function highlightify(text) {
  return `<span class='off-highlight'>${text}</span>`
}

if (surveyMode) {
  el("js-survey").onclick = function() {
    eventLogSender("survey", { source: "off_page" }, moment())
  }
}

// Get stuff from the query string
var QueryString = (function() {
  // This function is anonymous, is executed immediately and
  // the return value is assigned to QueryString!
  var query_string = {}
  var query = window.location.search.substring(1)
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

// Set domain, url
var domain = false
var url = false
if ("domain" in QueryString) {
  domain = QueryString.domain
  Array.from(domainText).forEach(function(element) {
    element.innerHTML = domain
  })
}
if ("url" in QueryString) {
  url = QueryString.url
}

// Only a headline. big headline
// You've gone X minutes without visiting XXXXXX
// That's a good start.
// Keep it going by just leaving!
//

function getLocalStorage() {
  chrome.runtime.sendMessage({ type: "get_localStorage" }, function(response) {
    var date = moment().format("YYYY-MM-DD")
    localStorage = response.localStorage
    var settingsLocal = response.settingsLocal
    goalInit(settingsLocal.daily_goal)

    // If not paid, show the ad
    if (
      !settingsLocal.paid &&
      moment().diff(moment(settingsLocal.install_date), "days") > 7
    ) {
      el("js-payment").style.display = "flex"
    }

    getStickier = settingsLocal.get_stickier
    // Get domain today
    var domainToday = JSON.parse(localStorage[date])[domain]
    // Pull the status out
    var status = JSON.parse(localStorage.status)

    // Load a new image for the new day!
    var diff = moment()
      .startOf("day")
      .diff(moment("2018-01-01T19:05:57.810Z").startOf("day"), "days")
    var index = diff % bgImages.length
    setBackground(background, `${dir_small}${getBackgroundFile(index)}`)
    backgroundLoader(index)

    // If false, use value 0 to grab image from array and set it
    // If true, check what day you are on versus the first ever day, and use that value to get array
    // Check if domain in status
    // if (!(domain in status)) {
    //   headline.innerHTML = `Nudge switches off${highlightify(domain)}by default`
    // }

    // Grab lastVisitEnd for updating the headline
    var lastVisitEnd = status[domain] ? status[domain].lastVisitEnd : false
    // Humanize it
    var sinceLastVisitEnd = moment
      .duration(moment().diff(moment(lastVisitEnd)))
      .humanize()
    // Update it in headline

    try {
      //   moment.locale("en", {
      //     calendar: {
      //       lastDay: "[yesterday at] h:mma",
      //       sameDay: "[today at] h:mma",
      //       nextDay: "[tomorrow at] h:mma",
      //       lastWeek: "[last] dddd [at] h:mma",
      //       nextWeek: "dddd [at] h:mma",
      //       sameElse: "LL"
      //     }
      //   })

      //   if (!(domain in status)) {
      //     if (lastVisitEnd) {
      //       log("a")
      //       el(
      //         "js-stats"
      //       ).innerHTML = `Your last visit to ${domain} ended ${moment(
      //         lastVisitEnd
      //       ).calendar()}.`
      //     } else {
      //       log("b")
      //       el(
      //         "js-stats"
      //       ).innerHTML = `You haven't been on this site recently, as far as Nudge can tell. Nice one!`
      //     }
      //   } else {
      //     if (domainToday) {
      //       el(
      //         "js-stats"
      //       ).innerHTML = `Your last visit to ${domain} ended ${moment(
      //         lastVisitEnd
      //       ).calendar()}.`
      //     } else {
      //       el(
      //         "js-stats"
      //       ).innerHTML = `Your last visit to ${domain} ended ${moment(
      //         lastVisitEnd
      //       ).calendar()}.`
      //     }
      //   }

      const stats = el("js-stats")
      if (
        domainToday &&
        !isNaN(domainToday.sessions) &&
        !isNaN(domainToday.time)
      ) {
        stats.innerHTML = `${domain} today: ${
          domainToday.sessions > 1
            ? `${domainToday.sessions} visits`
            : `${domainToday.sessions} visit`
        }, ${msToDuration(domainToday.time)}`
      } else {
        stats.innerHTML = `You haven't visited ${domain} yet today. Nice one!`
      }
    } catch (e) {}

    switch_ons = JSON.parse(localStorage[date]).switch_ons
    if (getStickier) {
      var stickyChange = (switch_ons + 2) / 2
      if (isNaN(stickyChange) || stickyChange < 1) {
        stickyMultiplier = 1
      } else if (stickyChange > 16) {
        stickyMultiplier = 16
      } else {
        stickyMultiplier = stickyChange
      }
    }

    if (stickyMultiplier > 1) {
      sliderText.innerHTML =
        "Slider gets harder to drag across after each switch on"
    }

    // tagline.innerHTML = `You last visited ${domain} less than ${lastVisited} minutes ago, are you sure you want to go back?`;
  })
}

getLocalStorage()

button.addEventListener("mousedown", sliderdown, true)
button.addEventListener("touchstart", sliderTouchdown, true)

// Signup mode stuff
if (signupMode) {
  el("mce-EMAIL").onfocus = function() {
    el("js-signup-prompt").style.visibility = "visible"
    el("mce-EMAIL").placeholder = ""
  }
  el("mce-EMAIL").onblur = function() {
    el("js-signup-prompt").style.visibility = "hidden"
    el("mce-EMAIL").placeholder = "Get Nudge updates"
  }
}

// Vars for the slider
var buttonPosition = 0
var mousePosition = false
var touchPosition = false
var stickyMultiplier = 1

function getPageLeft(el) {
  var rect = el.getBoundingClientRect()
  var docEl = document.documentElement
  return rect.left + (window.pageXOffset || docEl.scrollLeft || 0)
}

function sliderdown(e) {
  // Find where the button is
  var buttonDiff = getPageLeft(button) - getPageLeft(slider)
  // Set button position as where button is relative to slider
  // Set to zero if you have a negative value
  if (buttonDiff > 0) {
    buttonPosition = Math.round(buttonDiff)
  } else {
    buttonPosition = 0
  }
  // Set mouse position as wherever mouse is
  mousePosition = e.clientX
  button.classList.remove("returning")
  // bind late
  document.addEventListener("mouseup", sliderup, true)
  document.addEventListener("mousemove", slidermove, true)
}

function sliderTouchdown(e) {
  // Find where the button is
  var buttonDiff = getPageLeft(button) - getPageLeft(slider)
  // Set button position as where button is relative to slider
  // Set to zero if you have a negative value
  if (buttonDiff > 0) {
    buttonPosition = Math.round(buttonDiff)
  } else {
    buttonPosition = 0
  }
  // Set mouse position as wherever mouse is
  touchPosition = e.changedTouches[0].clientX
  button.classList.remove("returning")
  // bind late
  document.addEventListener("touchend", sliderupTouch, true)
  document.addEventListener("touchmove", slidermoveTouch, true)
}

function sliderup(e) {
  // Position for testing whether to initOn, or return
  var position = getPageLeft(button) - getPageLeft(slider)
  button.classList.remove("active")
  centre.classList.remove("active")
  // unbind
  document.removeEventListener("mousemove", slidermove, true)
  document.removeEventListener("mouseup", sliderup, true)
  // Initiate on
  if (Math.round(position) >= slider.offsetWidth - button.offsetWidth) {
    initOn()
  } else {
    if (stickyMultiplier === 1) {
      button.style.left = 0 + "px"
      button.classList.add("returning")
      background.style.opacity = 0
    }
  }
}

function sliderupTouch(e) {
  // Position for testing whether to initOn, or return
  var position = getPageLeft(button) - getPageLeft(slider)
  button.classList.remove("active")
  centre.classList.remove("active")
  // unbind
  document.removeEventListener("touchmove", slidermoveTouch, true)
  document.removeEventListener("touchend", sliderupTouch, true)

  // Initiate on
  if (Math.round(position) >= slider.offsetWidth - button.offsetWidth) {
    initOn()
  } else {
    if (stickyMultiplier === 1) {
      button.style.left = 0 + "px"
      button.classList.add("returning")
      background.style.opacity = 0
    }
  }
}

function slidermove(e) {
  // Difference between where mouse was on click, and where mouse is now
  var difference = 0
  if (e.clientX - mousePosition > 0) {
    difference = Math.round((e.clientX - mousePosition) / stickyMultiplier)
  } else {
    difference = Math.round(e.clientX - mousePosition)
  }

  // Filter set
  var blurExtent = (difference + buttonPosition) / slider.offsetWidth
  background.style.opacity =
    blurExtent > 1 ? 1 : blurExtent < 0 ? 0 : blurExtent.toFixed(2)

  // If you go negative, set to 0px
  if (difference + buttonPosition < 0) {
    button.style.left = "0px"
    // If you go further than end of slider,
  } else if (
    difference + buttonPosition + button.offsetWidth >=
    slider.offsetWidth
  ) {
    button.style.left = slider.offsetWidth - button.offsetWidth + "px"
  } else {
    button.style.left = difference + buttonPosition + "px"
  }
}

function slidermoveTouch(e) {
  // Difference between where mouse was on click, and where mouse is now
  var difference = 0
  log(e.changedTouches[0].clientX - touchPosition)
  if (e.changedTouches[0].clientX - touchPosition > 0) {
    difference = Math.round(
      (e.changedTouches[0].clientX - touchPosition) / stickyMultiplier
    )
  } else {
    difference = Math.round(e.changedTouches[0].clientX - touchPosition)
  }

  // Filter set
  var blurExtent = (difference + buttonPosition) / slider.offsetWidth
  background.style.opacity =
    blurExtent > 1 ? 1 : blurExtent < 0 ? 0 : blurExtent.toFixed(2)

  // If you go negative, set to 0px
  if (difference + buttonPosition < 0) {
    button.style.left = "0px"
    // If you go further than end of slider,
  } else if (
    difference + buttonPosition + button.offsetWidth >=
    slider.offsetWidth
  ) {
    button.style.left = slider.offsetWidth - button.offsetWidth + "px"
  } else {
    button.style.left = difference + buttonPosition + "px"
  }
}

// Off elements that we care about
var off = "off-"
var js = "js-"
var dir = "img/bg/"
var dir_small = "small/"
var dir_blur = "blur/"

var background = document.querySelector(`.${off}background`)
var backgroundEnhanced = document.querySelector(`.${off}background-enhanced`)

// Get the photos if exist in sync. Set them if not
function initOn() {
  eventLogSender("slide_on", { domain }, moment())
  chrome.runtime.sendMessage({
    type: "on",
    url,
    domain,
    stickyMultiplier
  })
}

function getBackgroundFile(index) {
  return bgImages[index]
}

function setBackground(element, image) {
  element.src = `${getUrl(`${dir}${image}`)}`
}

function backgroundLoader(index) {
  // This was as follows, but changed to make it work: // window.onload = function loadStuff() {}
  img = new Image()
  // Assign an onload handler to the dummy image *before* assigning the src
  img.onload = function() {
    // log(getBackgroundFile(index), index);
    setBackground(backgroundEnhanced, getBackgroundFile(index))
    toggleClass(background, `${off}background_animation`)
    setTimeout(function() {
      background.style.opacity = 0
      background.style.filter = "none"
      toggleClass(background, `${off}background_animation`)
      setBackground(background, `${dir_blur}${getBackgroundFile(index)}`)
    }, 1000)
  }

  // Finally, trigger the whole preloading chain by giving source
  img.src = getUrl(`${dir}${getBackgroundFile(index)}`)
}

var backgroundNumber = 0

// Keyboard shortcut to cycle through background images
// function cycleThroughBackgrounds() {
//   document.onkeyup = function(key) {
//     if (key.altKey && key.keyCode == 39) {
//       backgroundLoader(backgroundNumber)
//       backgroundNumber++
//     }
//   }
// }

// cycleThroughBackgrounds();
