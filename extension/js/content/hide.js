var hiddenDivs = {}
var unhiddenDivsLocal = []
var currentUrl = false
var hiderOff = false

// Tweak the facebook share box a little

console.log(config)

// Reset div settings
if (config.resetDivSettings) {
  log("Reset div settings")
  changeSettingRequest({}, "unhidden_divs")
}

function divHider(settings, url, extractedDomain) {
  log(settings.unhidden_divs)
  // Add the CSS that you will need
  // Doesn't matter if it's a Nudge site
  // Matters if it's in the div list
  doAtEarliest(function() {
    addCSS("nudge-circle", "css/injected/circle.css")
  })

  var observerOn = false
  Object.keys(divs).forEach(function(realDomain) {
    // This now refers to divs, not settings.divs
    if (url.includes(realDomain) && !observerOn) {
      // Find the unhidden divs for this particular domain
      var unhiddenDivs = settings.unhidden_divs
      // Load up unhidden divs
      // log(extractedDomain)
      if (realDomain in unhiddenDivs) {
        unhiddenDivsLocal = unhiddenDivs[realDomain]
        // log(unhiddenDivsLocal)
      }
      // Run the document observer
      documentObserver(divs[realDomain], realDomain, unhiddenDivs)
      observerOn = true
    }
  })
}

// Takes a div info and makes it into a string
function encodeDivInfoToString(div) {
  if ("id" in div && "className" in div) {
    return `#${div.id}-${div.className.replace(/(^|\s+)/g, ".")}`
  } else if ("id" in div) {
    return `#${div.id}`
  } else if ("className" in div) {
    return `${div.className.replace(/(^|\s+)/g, ".")}`
  }
}

// Once we have an element, hide it and add circle
function processForCircle(element, div, domain, randomiser, unhiddenDivs) {
  // Check that the element is hidden by seeing if the hide style ID is present
  // This also checks for elements under the same class being hidden already

  var originalStyle = {
    visibility: element.style.visibility,
    "pointer-events": element.style["pointer-events"],
    cursor: element.style.cursor
    // opacity: element.style.opacity
  }

  // Give all children an opacity of 0 so they don't show up
  if (!el(`nudge-opacity-${randomiser}`)) {
    var childSelector = `${element.id === "" ? "" : `#${element.id}`} ${element
      .className.length > 0 &&
      `${element.className.replace(
        /(^|\s+)/g,
        "."
      )}`} > :not(.circle-container) *`
    styleAdder(
      childSelector,
      "{ opacity: 0 !important }",
      `nudge-opacity-${randomiser}`
    )
  }

  if (!hiddenDivs[randomiser]) {
    hiddenDivs[randomiser] = originalStyle
  }

  element.style.setProperty("visibility", "hidden", "important")
  element.style["pointer-events"] = "none"
  element.style.cursor = "default"

  // Give element
  element.setAttribute("nudge", randomiser)

  // Try to add a circle
  addCircle(element, domain, div, randomiser, unhiddenDivs)
}

// Circle add function
function addCircle(element, domain, div, randomiser, unhiddenDivs) {
  // See if there is already a circle in there...
  if (
    !element.childNodes ||
    element.childNodes[0].className != "circle-container"
  ) {
    try {
      appendHtml(element, localStorage["circle.html"])
      circleHandler(element, domain, div, randomiser, unhiddenDivs)
    } catch (e) {
      // console.log(e)
    }
  }
}

function circleHandler(element, domain, div, randomiser, unhiddenDivs) {
  // Find the container of the links
  var container = element.childNodes[0]
  var dropdown = container.firstChild.firstChild.firstChild

  // Set div info which will be used to find the original div should we need to
  var divInfo = `#${div.id}`

  if ("id" in div && "className" in div) {
    divInfo = `#${div.id} ${div.className.replace(/(^|\s+)/g, ".")}`
  } else if ("className" in div) {
    divInfo = `${div.className.replace(/(^|\s+)/g, ".")}`
  }

  container.setAttribute("nudge", divInfo)

  // This is quite hard-coded, beware
  var showOnceLink = dropdown.childNodes[1]
  var showAlwaysLink = dropdown.childNodes[2]

  showOnceLink.onclick = function() {
    unHide(container, element, false)
  }

  showAlwaysLink.onclick = function() {
    unHide(container, element, true)
  }

  function unHide(container, element, showAlways) {
    // Div tracker
    // Knows which divs have been unhidden
    // So that you don't recursively mess with them with the document observer

    var alreadyUnhidden = false
    unhiddenDivsLocal.forEach(function(unhiddenDiv) {
      if (isEquivalent(div, unhiddenDiv)) {
        alreadyUnhidden = true
      }
    })

    if (!alreadyUnhidden) {
      unhiddenDivsLocal.push(div)
    }

    // Go back to before
    element.style.visibility = hiddenDivs[randomiser].visibility
    element.style["pointer-events"] = hiddenDivs[randomiser]["pointer-events"]
    element.style.cursor = hiddenDivs[randomiser].cursor

    // Delete the container
    deleteEl(container)

    deleteEl(el(`nudge-opacity-${randomiser}`))

    if (showAlways) {
      if (domain in unhiddenDivs) {
        var foundDiv = false
        // If the div is already unhidden, don't do it again
        unhiddenDivs[domain].forEach(function(div) {
          foundDiv = true
        })
        if (!foundDiv) {
          unhiddenDivs[domain].push(div)
        }
      } else {
        unhiddenDivs[domain] = []
        unhiddenDivs[domain].push(div)
      }
      changeSettingRequest(unhiddenDivs, "unhidden_divs")
    }
  }
}

function turnOffHider() {
  Object.keys(hiddenDivs).forEach(function(randomiser) {
    var opacityHideStyle = el(`nudge-opacity-${randomiser}`)
    if (opacityHideStyle) {
      opacityHideStyle.innerHTML = `#deactivated ${opacityHideStyle.innerHTML}`
    }
  })
  // Search for already existing ones
  Array.from(document.getElementsByClassName("circle-container")).forEach(
    el => {
      el.display = "none"
      var element = el.parentNode

      randomiser = element.className.substring(
        element.className.indexOf("nudge-") + 6
      )

      element.style.visibility = hiddenDivs[randomiser].visibility
      element.style["pointer-events"] = hiddenDivs[randomiser]["pointer-events"]
      element.style.cursor = hiddenDivs[randomiser].cursor
    }
  )
}

function turnOnHider() {
  Object.keys(hiddenDivs).forEach(function(hiddenDiv) {
    var opacityHideStyle = el(`nudge-opacity-${hiddenDiv}`)
    if (opacityHideStyle) {
      opacityHideStyle.innerHTML.replace("#deactivated ", "")
    }
  })
  // Search for already existing ones
  Array.from(document.getElementsByClassName("circle-container")).forEach(
    el => {
      el.display = "none"
      var element = el.parentNode

      element.style.setProperty("visibility", "hidden", "important")
      element.style["pointer-events"] = "none"
      element.style.cursor = "default"
    }
  )
}

// Check whitelist and blacklist
function checkList(domain, currentUrl) {
  // Cycle through all blacklist items and look for a match
  var blacklistMatch = false

  blacklist.forEach(function(b) {
    if (b.domain.includes(domain)) {
      blacklistMatch = b
    }
  })

  // If you're on a blacklist site, you'll only nudge if you are on the right URL
  if (blacklistMatch) {
    if (currentUrl.includes(blacklistMatch.url)) {
      log("On blacklist url, so let's nudge it")
      return false
    } else {
      log("On blacklist site but not on targeted url")
      return true
    }
    // Otherwise, go whitelist hunting because you're on a regular site
  } else {
    if (whitelist.some(w => currentUrl.includes(w))) {
      log("On regular site, on whitelist url")
      return true
    } else {
      log("On regular site, blocking regularly")
      return false
    }
  }
}

function documentObserver(divs, domain, unhiddenDivs) {
  // Log whatever the current URL is. We'll use this to make sure we exclude certain URLs

  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      // Identify any change in URL
      if (window.location.href != currentUrl || currentUrl == false) {
        // The URL has changed
        currentUrl = window.location.href

        if (checkList(domain, currentUrl)) {
          // If the URL is in the whitelist, temporarily turn off all the hide styles on divs and opacity hide styles
          turnOffHider()
          hiderOff = true
          log("Won't hide on this site")
        } else {
          if (hiderOff) {
            turnOnHider()
          }
          log("Can hide on this site")
          hiderOff = false
        }
      }

      // Cycle through divs
      divs.forEach(function(div) {
        if (unhiddenDivsLocal.some(u => isEquivalent(u, div))) {
          // log("Unhidden - will ignore")
        } else {
          if ("id" in div && "className" in div) {
            // Search for brand new ones
            Array.from(document.getElementsByClassName(div.className)).forEach(
              function(node) {
                if (node.id === div.id) {
                  processNode(node, div, domain)
                }
              }
            )
          } else if ("id" in div) {
            var node = document.getElementById(div.id)
            if (node) {
              processNode(node, div, domain)
            }
          } else if ("className" in div) {
            Array.from(document.getElementsByClassName(div.className)).forEach(
              function(node) {
                processNode(node, div, domain)
              }
            )
          }
        }
      })

      // Add a listener to the containers so that if their contents change, you put the circle back in
      mutation.removedNodes.forEach(function(node) {
        try {
          // Stringify this because we got a weird SVG className value once which caused an error
          if (JSON.stringify(node.className).includes("circle-container")) {
            log("Removed:", node)
            var divInfo = node.getAttribute("nudge")
            if (divInfo.includes("#") && divInfo.includes(".")) {
              var id = divInfo.match(/(?!#)(.*?)(?=\s\.)/g)[0]
              var className = divInfo
                .match(/(\..+)/g)[0]
                .substring(1)
                .replace(".", " ")
              // Find the div using divInfo
              divs.forEach(function(div) {
                if (
                  div.id == id &&
                  className.includes(div.className) &&
                  !unhiddenDivsLocal.some(u => isEquivalent(u, div))
                ) {
                  Array.from(
                    document.getElementsByClassName(className)
                  ).forEach(function(element) {
                    if (element.id === id) {
                      processNode(element, div, domain, true)
                    }
                  })
                }
              })
            } else if (divInfo.includes("#")) {
              var id = divInfo.substring(1)

              // Find the div using divInfo
              divs.forEach(function(div) {
                if (
                  div.id == id &&
                  !unhiddenDivsLocal.some(u => isEquivalent(u, div))
                ) {
                  var element = document.getElementById(id)
                  processNode(element, div, domain, true)
                }
              })
            } else if (divInfo.includes(".")) {
              var className = divInfo.substring(1).replace(".", " ")

              // Find the div using divInfo
              divs.forEach(function(div) {
                if (
                  className.includes(div.className) &&
                  !unhiddenDivsLocal.some(u => isEquivalent(u, div))
                ) {
                  Array.from(
                    document.getElementsByClassName(className)
                  ).forEach(function(element) {
                    processNode(element, div, domain, true)
                  })
                }
              })
            }
          }
        } catch (e) {
          // console.log(e)
        }
      })

      function processNode(node, div, domain, fromRemoved) {
        // Create a random ID to find the div again later

        if (hiderOff) {
          return
        }

        var randomiser = getUserId()

        // // TODO: This is the attempt to create an excluder, which you don't need to do right now
        // if (whitelist.some(w => currentUrl.includes(w))) {
        //   return
        // }

        // If window.location is a whitelisted one
        // Find all circle-containers
        // Remove

        if (!node.className.includes("nudge")) {
          log("Found:", node)
          node.className = node.className + ` nudge-${randomiser}`
        } else {
          // Grab the randomiser value from the existing className with an offset of 6
          randomiser = node.className.substring(
            node.className.indexOf("nudge-") + 6
          )
        }

        try {
          if (node.childNodes[0].className !== "circle-container") {
            if (fromRemoved) {
              log("Readded:", node)
            } else {
              log("Initialised:", node)
            }
            processForCircle(node, div, domain, randomiser, unhiddenDivs)
          }
        } catch (e) {
          // console.log(e)
        }
      }
    })
  })

  // Have to observe entire document really. Which is very inefficient
  observer.observe(document, {
    childList: true,
    subtree: true,
    characterData: true
  })
}
