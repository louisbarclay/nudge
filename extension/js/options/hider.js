var settingsLocal = {}

runHider()
async function runHider() {
  settingsLocal = await loadSettingsRequest()
  let excludedHidees = settingsLocal.unhidden_hidees

  let domains = []
  hideesStore.forEach((hidee) => {
    if (!domains.includes(hidee.domain)) {
      domains.push(hidee.domain)
    }
  })

  let hideableDomains = false
  domains.forEach((domain) => {
    var domainContainer = document.createElement("div")
    domainContainer.className = "vertical"
    var domainHeading = document.createElement("h2")
    domainHeading.innerHTML = domain
    hiddenSections.appendChild(domainContainer)
    domainContainer.appendChild(domainHeading)

    hideesStore
      .filter((hidee) => {
        return hidee.domain === domain
      })
      .forEach((hidee) => {
        var hideeContainer = document.createElement("div")
        hideeContainer.className = "spacing-xsmall"
        var hideeCheckbox = document.createElement("input")
        hideeCheckbox.type = "checkbox"
        var randomId = getUserId().substring(0, 10)
        hideeCheckbox.id = randomId

        var hideeLabel = document.createElement("label")
        hideeLabel.innerHTML = hidee.description
        hideeLabel.htmlFor = randomId
        domainContainer.appendChild(hideeContainer)
        hideeContainer.appendChild(hideeCheckbox)
        hideeContainer.appendChild(hideeLabel)

        if (
          !settingsLocal.nudge_domains ||
          !settingsLocal.nudge_domains.includes(domain)
        ) {
          hideeLabel.className = "label-inactive"
        } else if (settingsLocal.nudge_domains.includes(domain)) {
          if (!hideableDomains) {
            hideableDomains = true
          }

          if (excludedHidees.includes(hidee.slug)) {
            hideeCheckbox.checked = false
          } else {
            hideeCheckbox.checked = true
          }
          // In all cases here, we want to handle the checkbox
          hideeCheckbox.onclick = function () {
            if (hideeCheckbox.checked) {
              excludedHidees = excludedHidees.filter((excludedHidee) => {
                return hidee.slug !== excludedHidee
              })
            } else {
              if (!excludedHidees.includes(hidee.slug)) {
                excludedHidees.push(hidee.slug)
              }
            }

            changeSettingRequest(excludedHidees, "unhidden_hidees")
          }
        }
      })

    if (
      !settingsLocal.nudge_domains ||
      !settingsLocal.nudge_domains.includes(domain)
    ) {
      let domainWarning = document.createElement("p")
      domainWarning.className = "tooltip spacing-xsmall"
      domainWarning.innerHTML = `Add ${domain} to your Nudge sites to hide ${
        hideesStore.filter((hidee) => {
          return hidee.domain === domain
        }).length > 1
          ? "these sections"
          : "this section"
      }`
      domainContainer.appendChild(domainWarning)
    }
  })

  if (!hideableDomains) {
    el("js-hider-warning").style.display = "block"
  }
}

var hiddenSections = el("js-hiddensections")
var hiddenSectionsToggle = el("js-hidden-sections-toggle")

let showHiddenSections = false
hiddenSectionsToggle.onclick = function () {
  toggleClass(hiddenSections, "display-none")

  if (showHiddenSections) {
    showHiddenSections = false
    hiddenSectionsToggle.innerHTML = "Show the sections that Nudge hides"
  } else {
    showHiddenSections = true
    hiddenSectionsToggle.innerHTML = "Hide the sections that Nudge hides"
  }
}
