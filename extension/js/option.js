var optionsIndex = [
  { page: "sites.html", name: "Choose Sites" },
  {
    page: "defaulter.html",
    name: "Defaulter"
  },
  { page: "hider.html", name: "Hider" },
  { page: "rainbowtimer.html", name: "Rainbow Timer" }
]

for (var i = 0; i < optionsIndex.length; i++) {
  if (window.location.href.includes(optionsIndex[i].page)) {
    log(i)
    try {
      log(optionsIndex[i - 1].name)
      // Set up back link
      el("js-back").innerHTML = `🠐 ${optionsIndex[i - 1].name}`
      el("js-back").onclick = function() {
        window.location = `./${optionsIndex[i - 1].page}`
      }
      // Set up next link
      el("js-next").innerHTML = `Next: ${optionsIndex[i + 1].name}`
      el("js-next").onclick = function() {
        window.location = `./${optionsIndex[i + 1].page}`
      }
    } catch (e) {}
    break
  }
}

function handleToggle(element, callback, override) {
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
    handleOnboardingClick(this, true)
  }
}

;(async () => {
  var settings = await loadSettings()
  var contents = document.getElementsByClassName("contents")[0]
  var setting = contents.id
  // Find any main toggles and set correct value + handle click
  Array.from(document.getElementsByClassName("toggle")).forEach(function(
    element
  ) {
    var left = element.childNodes[0]
    var currentVal = !left.className.includes("on")
    element.onclick = function() {
      handleToggle(element, function handleSettingChange(value) {
        changeSettingRequest(value, setting)
      })
    }
    if (currentVal !== settings[setting]) {
      handleToggle(element, null)
    }
  })
  // Find any subSetting checkboxes set correct value + handle click
  Array.from(document.getElementsByClassName("form-checkbox")).forEach(function(
    element
  ) {
    var subSetting = element.childNodes[0].id
    log(subSetting)
    var checkbox = element.childNodes[0]
    // Set current setting
    if (settings[subSetting]) {
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
})()

function handleOnboardingClick(element, changeSetting) {
  var parent = element.parentNode
  var setting = parent.parentNode.id
  log(setting)
  if (changeSetting) {
    var toggle = document.getElementsByClassName("toggle")[0]
    handleToggle(toggle, null, true)
    changeSettingRequest(true, setting)
  }
  parent.style.display = "none"
  el("js-next").parentNode.style.display = "flex"
}
