var hash = window.location.hash.substr(1)

eventLogSender("optionsPage", { page: window.location.pathname.split("/")[3] })

// Hide onboarding if coming from options home
if (hash === "options") {
  toggleClass(el("js-onboarding"), "display-none")
}

var optionsIndex = [
  { page: "start.html", name: "Welcome to Nudge" },
  { page: "set_up.html", name: "Setting up Nudge" },
  { page: "privacy.html", name: "Nudge and privacy" },
  { page: "sites.html", name: "Choose sites" },
  { page: "scheduler.html", name: "Your Nudge schedule" },
  {
    page: "defaulter.html",
    name: "Defaulter"
  },
  { page: "hider.html", name: "Hider" },
  {
    page: "rainbowtimer.html",
    name: "Rainbow Timer"
  },
  {
    page: "scrollnudger.html",
    name: "Scroll Nudger"
  },
  {
    page: "unfollower.html",
    name: "Unfollower"
  },
  {
    page: "facebooktweaker.html",
    name: "Facebook Greyifyer"
  },
  {
    page: "youtubeautoplaystopper.html",
    name: "YouTube Autoplay Stopper"
  },
  {
    page: "options_home.html#onboarding",
    name: "your Options"
  }
]

for (var i = 0; i < optionsIndex.length; i++) {
  if (window.location.href.includes(optionsIndex[i].page)) {
    if (hash === "options") {
      el("js-back").innerHTML = `🠐 Options`
      el("js-back").onclick = function() {
        window.location = `./options_home.html`
      }
    } else if (hash === "unfollower") {
      el("js-back").innerHTML = `🠐 Welcome to Nudge`
      el("js-back").onclick = function() {
        window.location = `./start.html`
      }
      el("js-onboarding-skip").innerHTML = "No, thanks"
      el("js-next").innerHTML = "Check out Nudge's other features"
      el("js-next").onclick = function() {
        window.location = `./options_home.html`
      }
    } else if (
      window.location.href.includes("options_home.html") &&
      hash != "onboarding"
    ) {
      el("js-back").innerHTML = ``
    } else {
      try {
        // Catch possible error on Change Site page
        if (optionsIndex[i - 1]) {
          // Set up back link
          el("js-back").innerHTML = `🠐 ${optionsIndex[i - 1].name}`
          el("js-back").onclick = function() {
            window.location = `./${optionsIndex[i - 1].page}`
          }
        }
      } catch (e) {
        log(e)
      }
      try {
        // Set up next link
        if (window.location.href.includes("scheduler.html")) {
          el(
            "js-next"
          ).innerHTML = `Next: choose which of Nudge's features to enable`
        } else {
          el("js-next").innerHTML = `Next: ${optionsIndex[i + 1].name}`
        }
        el("js-next").onclick = function() {
          window.location = `./${optionsIndex[i + 1].page}`
        }
      } catch (e) {}
      break
    }
  }
}

function handleToggle(element, callback, override, onFirstClick) {
  var left = element.childNodes[0]
  var newVal = left.className.includes("on")
  var right = element.childNodes[1]
  if (override) {
    if (newVal) {
      toggleClass(left, "on")
      toggleClass(right, "on")
    }
  } else {
    toggleClass(left, "on")
    toggleClass(right, "on")
    if (newVal && onFirstClick) {
      if (el("js-onboarding-enable")) {
        el("js-onboarding-enable").parentNode.style.display = "none"
        el("js-next").parentNode.style.display = "flex"
      }
    }
  }
  if (callback) {
    callback(newVal)
  }
}

if (el("js-onboarding-enable")) {
  el("js-onboarding-enable").onclick = function() {
    handleOnboardingClick(this, true)
  }
}

if (el("js-onboarding-skip")) {
  el("js-onboarding-skip").onclick = function() {
    handleOnboardingClick(this, false)
  }
}

;(async () => {
  var settings = await loadSettings()
  // Find any main toggles and set correct value + handle click
  Array.from(document.getElementsByClassName("toggle")).forEach(function(
    element
  ) {
    // This will only work if the parentNode of the element has an id that's a valid setting string
    var setting = element.parentNode.id
    var left = element.childNodes[0]
    var currentVal = !left.className.includes("on")

    // Only change the onboarding thing on the very first click
    let onFirstClick = true
    element.addEventListener("click", function(e) {
      // e.stopPropagation()
      // e.stopImmediatePropagation()
      e.preventDefault()
      handleToggle(
        element,
        function handleSettingChange(value) {
          changeSettingRequest(value, setting)
        },
        null,
        onFirstClick
      )
      onFirstClick = false
    })

    if (currentVal !== settings[setting]) {
      handleToggle(element, null)
    }
  })
  // Find any subSetting checkboxes set correct value + handle click
  Array.from(document.getElementsByClassName("form-checkbox")).forEach(function(
    element
  ) {
    var subSetting = element.childNodes[0].id
    var checkbox = element.childNodes[0]
    // Set current setting
    if (subSetting in settings && settings[subSetting]) {
      checkbox.checked = true
    }
    // Handle click
    checkbox.onclick = function() {
      changeSettingRequest(checkbox.checked, subSetting)
    }
  })
  if (window.location.href.includes("sites")) {
    runSites(settings)
  }
  if (window.location.href.includes("hider")) {
    runHider(settings)
  }
  // Plug in Nudge ID if we have it
  var nudgeId = el("js-nudge-id")
  if (nudgeId) {
    nudgeId.innerHTML = settings.userId
  }
})()

function handleOnboardingClick(element, changeSetting) {
  var parent = element.parentNode
  var setting = parent.parentNode.parentNode.id
  if (changeSetting) {
    var toggle = document.getElementsByClassName("toggle")[0]
    handleToggle(toggle, null, true)
    changeSettingRequest(true, setting)
  }
  parent.style.display = "none"
  el("js-next").parentNode.style.display = "flex"
}
