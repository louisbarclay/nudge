var settingsLocal = {}

function runHider(settings) {
  settingsLocal = settings
  let unhiddenDivs = settingsLocal.unhidden_divs
  log(unhiddenDivs)

  let hideableDomains = false
  Object.keys(divs).forEach(function(domain) {
    var domainContainer = document.createElement("div")
    domainContainer.className = "vertical"
    var domainHeading = document.createElement("h2")
    domainHeading.innerHTML = domain
    hiddenSections.appendChild(domainContainer)
    domainContainer.appendChild(domainHeading)

    divs[domain].forEach(function(div) {
      var divContainer = document.createElement("div")
      divContainer.className = "spacing-xsmall"
      var divCheckbox = document.createElement("input")
      divCheckbox.type = "checkbox"
      var randomId = getUserId().substring(0, 10)
      divCheckbox.id = randomId

      var divLabel = document.createElement("label")
      divLabel.innerHTML = div.description
      divLabel.htmlFor = randomId
      domainContainer.appendChild(divContainer)
      divContainer.appendChild(divCheckbox)
      divContainer.appendChild(divLabel)

      if (
        !settingsLocal.domains[domain] ||
        !settingsLocal.domains[domain].nudge
      ) {
        divLabel.className = "label-inactive"
      } else if (settingsLocal.domains[domain].nudge) {
        if (!hideableDomains) {
          hideableDomains = true
        }

        // This absolute mess is to factor in having added the new description property
        // Could be handled much better by doing a comparison of id and className keys only
        if (unhiddenDivs && unhiddenDivs[domain]) {
          if (
            !unhiddenDivs[domain].some(u =>
              isEquivalent(
                objectWithoutKey(u, "description"),
                objectWithoutKey(div, "description")
              )
            )
          ) {
            divCheckbox.checked = true
          }
        } else {
          divCheckbox.checked = true
        }
        // In all cases here, we want to handle the checkbox
        divCheckbox.onclick = function() {
          log(divCheckbox.checked)
          if (divCheckbox.checked) {
            unhiddenDivs[domain] = unhiddenDivs[domain].filter(u => {
              return !isEquivalent(
                objectWithoutKey(u, "description"),
                objectWithoutKey(div, "description")
              )
            })
          } else {
            if (!unhiddenDivs) {
              unhiddenDivs = {}
              unhiddenDivs[domain] = []
              unhiddenDivs[domain].push(objectWithoutKey(div, "description"))
            } else if (!unhiddenDivs[domain]) {
              unhiddenDivs[domain] = []
              unhiddenDivs[domain].push(objectWithoutKey(div, "description"))
            } else if (unhiddenDivs[domain]) {
              if (
                !unhiddenDivs[domain].some(u =>
                  isEquivalent(
                    objectWithoutKey(u, "description"),
                    objectWithoutKey(div, "description")
                  )
                )
              ) {
                unhiddenDivs[domain].push(objectWithoutKey(div, "description"))
              }
            }
          }

          changeSettingRequest(unhiddenDivs, "unhidden_divs")
        }
      }
    })

    if (
      !settingsLocal.domains[domain] ||
      !settingsLocal.domains[domain].nudge
    ) {
      let domainWarning = document.createElement("p")
      domainWarning.className = "tooltip spacing-xsmall"
      domainWarning.innerHTML = `Add ${domain} to your Nudge sites to hide ${
        divs[domain].length > 1 ? "these sections" : "this section"
      }`
      domainContainer.appendChild(domainWarning)
    }
  })

  if (!hideableDomains) {
    el("js-hider-warning").style.display = "block"
  }
}

const checkboxHandler = (checkbox, domain, div) => {
  checkbox.onclick = function() {
    log("boom")
  }
}

var hiddenSections = el("js-hiddensections")
var hiddenSectionsToggle = el("js-hidden-sections-toggle")

let showHiddenSections = false
hiddenSectionsToggle.onclick = function() {
  toggleClass(hiddenSections, "display-none")

  if (showHiddenSections) {
    showHiddenSections = false
    hiddenSectionsToggle.innerHTML = "Show the sections that Nudge hides"
  } else {
    showHiddenSections = true
    hiddenSectionsToggle.innerHTML = "Hide the sections that Nudge hides"
  }
}
