var divsHidden = {}
var divsUnhiddenLocal = []
var currentUrl = false
var hiderOff = false
var mutationCounter = 0
var documentObserverCounter = 0
var nodeCache = []
var circleHtml = "circle.html"

// Reset div settings
if (config.resetDivSettings) {
  log("Reset div settings")
  changeSettingRequest({}, "unhidden_divs")
}

function divHider(settings, url, extractedDomain) {
  // Add the CSS that you will need
  // Doesn't matter if it's a Nudge site
  // Matters if it's in the div list
  doAtEarliest(function() {
    addCSS("nudge-circle", "css/injected/circle.css")
    if (!settings.paid) {
      circleHtml = "circle_alt.html"
    }
  })

  var observerOn = false
  Object.keys(divs).forEach(function(realDomain) {
    // This now refers to divs, not settings.divs
    if (url.includes(realDomain) && !observerOn) {
      // Find the unhidden divs for this particular domain
      var divsUnhidden = settings.unhidden_divs
      // Load up unhidden divs
      // log(extractedDomain)
      if (realDomain in divsUnhidden) {
        divsUnhiddenLocal = divsUnhidden[realDomain]
        // log(unhiddenDivsLocal)
      }
      // Run the document observer
      documentObserver(divs[realDomain], realDomain, divsUnhidden)
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
function processForCircle(
  node,
  div,
  domain,
  unhiddenDivs,
  randomiser,
  fromRemoved,
  source
) {
  // log("processForCircle", randomiser.substring(0, 8))
  let nodeProcessArray = [false, false, false]

  // As soon as you get the div randomiser, set the div to pending in case you are going to make any changes
  if (divsHidden[randomiser]) {
    divsHidden[randomiser].pending = true
  } else {
    divsHidden[randomiser] = { pending: true }
  }

  // Change class to include randomiser
  if (!node.className.includes("nudge")) {
    node.className = node.className + ` nudge-${randomiser}`
  }

  // 2. Does the node have a nudge attribute?
  if (node.getAttribute("nudge")) {
    nodeProcessArray[1] = true
  } else {
    node.setAttribute("nudge", randomiser)
  }

  // 3. Does the node have a child element that's the circle-container?
  if (
    node.childNodes.length === 0 ||
    node.childNodes[0].className !== "circle-container"
  ) {
    // Try to add a circle
    addCircle(node, domain, div, randomiser, unhiddenDivs)
  } else {
    nodeProcessArray[2] = true
  }

  // 4. Does the node have a corresponding children hide style?
  if (!el(`nudge-opacity-${randomiser}`)) {
    var childSelector = `${node.id === "" ? "" : `#${node.id}`} ${node.className
      .length > 0 &&
      `${node.className.replace(/(^|\s+)/g, ".")}`} > :not(.circle-container) *`
    styleAdder(
      childSelector,
      "{ opacity: 0 !important }",
      `nudge-opacity-${randomiser}`
    )
  } else {
    nodeProcessArray[3] = true
  }

  divsHidden[randomiser].pending = false

  // Clear up node cache now that potentially mutating operations are done
  // So now this node can be changed again
  nodeCache = nodeCache.filter(function(value, index) {
    return value !== node
  })

  // Grab previous style of now-hidden div
  var prevStyle = {
    visibility: node.style.visibility,
    pointerEvents: node.style.pointerEvents,
    cursor: node.style.cursor
  }

  // Add this new processed div to divsHidden, and store its previous styles for use in the future
  if (!divsHidden[randomiser].visibility) {
    divsHidden[randomiser] = { ...prevStyle, ...divsHidden[randomiser] }
  }

  node.style.setProperty("visibility", "hidden", "important")
  node.style.pointerEvents = "none"
  node.style.cursor = "default"
}

// Circle add function
function addCircle(element, domain, div, randomiser, unhiddenDivs) {
  // See if there is already a circle in there...
  if (
    !element.childNodes ||
    element.childNodes.length === 0 ||
    element.childNodes[0].className != "circle-container"
  ) {
    try {
      if (
        nudgeStorage[circleHtml] &&
        nudgeStorage[circleHtml].includes("circle-container")
      ) {
        appendHtml(element, nudgeStorage[circleHtml])
      } else {
      }
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
  var supportButtonContainer = container.childNodes[1]

  if (supportButtonContainer) {
    supportButtonContainer.childNodes[0].href = getUrl(
      "html/pages/support.html"
    )
  }

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
    divsUnhiddenLocal.forEach(function(unhiddenDiv) {
      if (isEquivalent(div, unhiddenDiv)) {
        alreadyUnhidden = true
      }
    })

    if (!alreadyUnhidden) {
      divsUnhiddenLocal.push(div)
    }

    // Go back to before using previous styles
    element.style.visibility = divsHidden[randomiser].visibility
    element.style.pointerEvents = divsHidden[randomiser].pointerEvents
    element.style.cursor = divsHidden[randomiser].cursor

    // Delete the container
    deleteEl(container)

    deleteEl(el(`nudge-opacity-${randomiser}`))

    if (showAlways) {
      changeSettingRequest(div, "unhidden_divs_add", domain)
      eventLogSender("hide_show_always", { div, domain })
    } else {
      eventLogSender("hide_show_once", { div, domain })
    }
  }
}

function turnOffHider() {
  Object.keys(divsHidden).forEach(function(randomiser) {
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

      element.style.visibility = divsHidden[randomiser].visibility
      element.style.pointerEvents = divsHidden[randomiser].pointerEvents
      element.style.cursor = divsHidden[randomiser].cursor
    }
  )
}

function turnOnHider() {
  Object.keys(divsHidden).forEach(function(hiddenDiv) {
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
      element.style.pointerEvents = "none"
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
      // log("On blacklist url, so let's nudge it")
      return false
    } else {
      // log("On blacklist site but not on targeted url")
      return true
    }
    // Otherwise, go whitelist hunting because you're on a regular site
  } else {
    if (whitelist.some(w => currentUrl.includes(w))) {
      // log("On regular site, on whitelist url")
      return true
    } else {
      // log("On regular site, blocking regularly")
      return false
    }
  }
}

function documentObserver(divs, domain, divsUnhidden) {
  documentObserverCounter++
  // Log whatever the current URL is. We'll use this to make sure we exclude certain URLs
  // log(documentObserverCounter)

  var observer = new MutationObserver(function(mutations) {
    debounce(
      mutations.forEach(function(mutation) {
        mutationCounter++
        // log(mutationCounter)

        // Identify any change in URL
        if (window.location.href != currentUrl || currentUrl == false) {
          // The URL has changed
          currentUrl = window.location.href

          if (checkList(domain, currentUrl)) {
            // If the URL is in the whitelist, temporarily turn off all the hide styles on divs and opacity hide styles
            turnOffHider()
            hiderOff = true
            // log("Won't hide on this site")
          } else {
            if (hiderOff) {
              turnOnHider()
            }
            // log("Can hide on this site")
            hiderOff = false
          }
        }

        // Don't care about looking up divs if there were no new addedNodes!
        // FIXME: also, if none of the added Nodes are interesting
        if (mutation.addedNodes.length > 0) {
          // Cycle through divs and get elements that match their class, id, or both
          // This is completely unrelated to the div that was just added in the mutation
          // Which seems inefficient but I think is more accurate because the mutations sometimes aren't correct...
          // ...at the point of happening
          divs.forEach(function(div) {
            if (divsUnhiddenLocal.some(u => isEquivalent(u, div))) {
              // log("Unhidden - will ignore")
            } else {
              if ("id" in div && "className" in div) {
                // Search for brand new ones
                Array.from(
                  document.getElementsByClassName(div.className)
                ).forEach(function(node) {
                  if (node.id === div.id) {
                    processNode(
                      node,
                      div,
                      domain,
                      null,
                      "matched div id and class"
                    )
                  }
                })
              } else if ("id" in div) {
                var node = document.getElementById(div.id)
                if (node) {
                  processNode(node, div, domain, null, "matched div id")
                }
              } else if ("className" in div) {
                Array.from(
                  document.getElementsByClassName(div.className)
                ).forEach(function(node) {
                  processNode(node, div, domain, null, "matched div class")
                })
              }
            }
          })
        }

        // Add a listener to anything removed to check for removed circles so you can put the circle back in
        mutation.removedNodes.forEach(function(node) {
          try {
            // Stringify this because we got a weird SVG className value once which caused an error
            if (JSON.stringify(node.className).includes("circle-container")) {
              // log("Removed:", node, node.className)
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
                    !divsUnhiddenLocal.some(u => isEquivalent(u, div))
                  ) {
                    Array.from(
                      document.getElementsByClassName(className)
                    ).forEach(function(element) {
                      if (element.id === id) {
                        processNode(
                          element,
                          div,
                          domain,
                          true,
                          "removedNodes id and class"
                        )
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
                    !divsUnhiddenLocal.some(u => isEquivalent(u, div))
                  ) {
                    var element = document.getElementById(id)
                    processNode(element, div, domain, true, "removedNodes id")
                  }
                })
              } else if (divInfo.includes(".")) {
                var className = divInfo.substring(1).replace(".", " ")

                // Find the div using divInfo
                divs.forEach(function(div) {
                  if (
                    className.includes(div.className) &&
                    !divsUnhiddenLocal.some(u => isEquivalent(u, div))
                  ) {
                    Array.from(
                      document.getElementsByClassName(className)
                    ).forEach(function(element) {
                      processNode(
                        element,
                        div,
                        domain,
                        true,
                        "removedNodes class"
                      )
                    })
                  }
                })
              }
            }
          } catch (e) {
            // console.log(e)
          }
        })

        // Process any node that's a match
        function processNode(node, div, domain, fromRemoved, source) {
          // Don't hide if hider is off, e.g. whitelisted URL
          if (hiderOff) {
            return
          }

          let randomiser = false

          // Assign new randomiser or get previous
          if (!node.className.includes("nudge")) {
            randomiser = getUserId()
            // log("processNode(new)", randomiser.substring(0, 8))
          } else {
            randomiser = node.className.substring(
              node.className.indexOf("nudge-") + 6
            )
            // log("processNode", randomiser.substring(0, 8))
          }

          // Check the node's state (if node is valid)
          // TODO: neither of these conditions actually do anything, as far as I can tell
          if (node) {
            if (divsHidden[randomiser] && divsHidden[randomiser].pending) {
              // log("Skip pending")
            } else {
              if (nodeCache.includes(node)) {
                // log("Skip double-checking")
              } else {
                nodeCache.push(node)
              }

              processForCircle(
                node,
                div,
                domain,
                divsUnhidden,
                randomiser,
                fromRemoved,
                source
              )
            }
          }
        }
        // Throttle/debounce parameter. Crazy to have it here, I know
      }),
      100,
      true
    )
    // Debounce here
  })

  // Have to observe entire document really. Which is very inefficient
  observer.observe(document, {
    childList: true,
    subtree: true,
    characterData: false
  })
}
