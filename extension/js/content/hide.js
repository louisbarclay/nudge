var divsHidden = {}
var currentUrl = false
var hiderOff = false
var circleHtml = "circle.html"
var divsUnhidden = false
const hiderClassName = "circle-container"
const debounceParameter = 1

// TODO: use some clever logging to figure out what's happening
// if (config.debug) var log = console.log.bind(window.console)
// else var log = function() {}

// This is the all-important state of divs for the page
let domainHidees = false
let domain = false

// Reset div settings
if (config.resetDivSettings) {
  log("Reset div settings")
  changeSettingRequest([], "unhidden_divs")
}

function divHider(settings, url) {
  // Add the CSS that you will need
  doAtEarliest(function() {
    addCSS("nudge-circle", "css/injected/circle.css")
    if (
      !settings.paid &&
      (!settings.install_date ||
        moment().diff(moment(settings.install_date), "days") > 7)
    ) {
      circleHtml = "circle_alt.html"
    }
  })

  Object.keys(divs).forEach(key => {
    // This now refers to divs, not settings.divs
    if (url.includes(key)) {
      domain = key
      domainHidees = divs[domain]
      // Update domainDivs with
      domainHidees.forEach(div => {
        settings.unhidden_divs.forEach(unhiddenUniqueId => {
          if (div.uniqueId == unhiddenUniqueId) {
            div.excluded = true
          }
        })
      })
    }
  })

  if (domain && domainHidees) {
    observeDoc()
  }
}

// Has circle in it
// Container has nudge-unique-id attribute container.setAttribute("nudge-unique-id", div.uniqueId)

// Once we have an element, hide it and add circle
function hideNode(node, div, domain, randomiser) {
  let nodeProcessArray = [false, false, false]

  // Add randomiser to current hidees
  if (!divsHidden[randomiser]) {
    divsHidden[randomiser] = { uniqueId: div.uniqueId }
  }

  // Change class to include randomiser
  if (!node.className.includes("nudge")) {
    node.className = node.className + ` nudge-${randomiser}`
  }

  // 3. Does the node have a child element that's the circle-container?
  if (
    node.childNodes.length === 0 ||
    node.childNodes[0].className !== "circle-container"
  ) {
    // Try to add a circle
    addCircle(node, domain, div, randomiser)
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
function addCircle(element, domain, div, randomiser) {
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
      circleHandler(element, domain, div, randomiser)
    } catch (e) {
      // console.log(e)
    }
  }
}

function circleHandler(element, domain, div, randomiser) {
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

  container.setAttribute("nudge-unique-id", div.uniqueId)

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

    div.excluded = true

    // Go back to before using previous styles
    element.style.visibility = divsHidden[randomiser].visibility
    element.style.pointerEvents = divsHidden[randomiser].pointerEvents
    element.style.cursor = divsHidden[randomiser].cursor

    // Delete the container
    deleteEl(container)

    deleteEl(el(`nudge-opacity-${randomiser}`))

    if (showAlways) {
      changeSettingRequest(div.uniqueId, "unhidden_divs_add")
      // TODO: gotta therefore fix the (messy) unhidden divs area
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

function observeDoc() {
  var observer = new MutationObserver(
    // You actually don't use any mutation info
    // It's just a convenient trigger
    () => {
      runOnMutation()
    }
  )

  // Observe entire document and childList to capture all mutations
  observer.observe(document, {
    childList: true,
    subtree: true,
    characterData: false
  })
}

const runOnMutation = () => {
  log("Ran on mutation")
  // Identify any change in URL
  if (window.location.href != currentUrl || currentUrl == false) {
    // The URL has changed
    currentUrl = window.location.href
  }

  // Cycle through divs and get elements that match their class, id, or both
  // This is completely unrelated to the div that was just added in the mutation
  // Which seems inefficient but I think is more accurate because the mutations sometimes aren't correct...
  // ...at the point of happening
  domainHidees.forEach(function(hidee) {
    findHideesInDoc(hidee).forEach(node => {
      processNode(node, hidee, domain)
    })
  })
}

// Process any node that's a match
const processNode = (node, hidee, domain) => {
  // Don't hide if hider is off, e.g. whitelisted URL or div is excluded
  if (hiderOff || hidee.excluded) {
    return
  }

  // Assign randomiser
  let randomiser = false
  // Assign new randomiser or get previous
  if (!node.className.includes("nudge")) {
    randomiser = getUserId()
    // log("processNode(new)", randomiser.substring(0, 8))
  } else {
    randomiser = node.className.substring(node.className.indexOf("nudge-") + 6)
    // log("processNode", randomiser.substring(0, 8))
  }

  // Hide node
  hideNode(node, hidee, domain, divsUnhidden, randomiser)
}

// Find hidees in doc
const findHideesInDoc = div => {
  let nodes = []
  if (div.id && div.className) {
    // Search for brand new ones
    Array.from(document.getElementsByClassName(div.className)).forEach(function(
      node
    ) {
      if (node.id === div.id) {
        nodes.push(node)
      }
    })
  } else if (div.id) {
    const node = document.getElementById(div.id)
    if (node) {
      nodes.push(node)
    }
  } else if (div.className) {
    Array.from(document.getElementsByClassName(div.className)).forEach(function(
      node
    ) {
      nodes.push(node)
    })
  }
  return nodes
}

// Get hidee from hider
const getHidee = hider => {
  const uniqueId = hider.getAttribute("nudge-unique-id")
  domainHidees.forEach(div => {
    if (div.uniqueId === uniqueId) return div
  })
}

// If a hider is removed, decide whether to replace it
const handleRemovedHiders = hider => {
  try {
    const hidee = getHidee(hider)
    findHideesInDoc(hidee).forEach(node => {
      processNode(node, hidee, domain, null)
    })
  } catch (e) {
    // console.log(e)
  }
}
