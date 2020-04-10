function hider(options, domain, onShowOnce, onShowAlways) {
  // Disable logging unless log variable is present
  !options.log && (log = function() {})
  // Store hiddenNodes by hash
  // Info: you can get hash from class, and slug from hash (in hiddenNodes)
  let hiddenNodes = {}
  // Track current URL
  let currentUrl = false
  // Set hidees
  let hidees = options.hidees
  let excludedHidees = options.excludedHidees

  // Add the CSS that you will need as early as possible
  onDocHeadExists(function() {
    addCSS("hider-menu", options.menuCss)
  })

  // Get only the hidees for this domain, without excluded ones
  const domainHidees = hidees.filter(hidee => {
    return !excludedHidees.includes(hidee.slug) && hidee.domain.includes(domain)
  })

  // Observe the document if you have a valid domain and domainHidees is longer than zero
  if (domainHidees.length > 0) {
    observeDoc()
  }

  // Once we have an element, hide it and add circle
  hideNode = (node, hidee, domain, hash) => {
    // 1. Does the hash exist in hiddenNodes?
    if (!hiddenNodes[hash]) {
      hiddenNodes[hash] = { slug: hidee.slug }
    }

    // 2. Does the class have nudge-${hash} in it?
    // You can get hash from class, and slug from hash (in hiddenNodes)
    if (!node.className.includes("nudge")) {
      node.className = node.className + ` nudge-${hash}`
    }

    // 3. Is the hidee excluded?
    // if (hidee.excluded) {
    //   hidee.excluded = false
    // }

    // 4. Does the node have a child element that's the circle-container?
    if (
      (node.childNodes.length === 0 ||
        node.childNodes[0].className !== options.menuClass) &&
      hidee.showMenu
    ) {
      addMenu(node, domain, hidee, hash)
    }

    // 5. Are there hidden styles on the element?
    addHiddenStyles(node, hash)

    // 6. Does the node have child hidden styles?
    if (!el(`nudge-opacity-${hash}`)) {
      addChildHiddenStyles(node, hash)
    }
  }

  showNode = (node, hidee, hash) => {
    // log(`Showing ${JSON.stringify(hidee)}`)

    // Numbers correspond to sections of hideNode
    // 3
    // if (!hidee.excluded) {
    //   hidee.excluded = true
    // }

    // 1, 5
    if (
      hiddenNodes[hash] &&
      node.style.visibility != hiddenNodes[hash].visibility
    ) {
      // Go back to before using previous styles
      node.style.visibility = hiddenNodes[hash].visibility
      node.style.pointerEvents = hiddenNodes[hash].pointerEvents
      node.style.cursor = hiddenNodes[hash].cursor
    }

    // Get the menu
    const menu =
      node.childNodes &&
      node.childNodes[0] &&
      node.childNodes[0].className === options.menuClass
        ? node.childNodes[0]
        : false
    // 4
    menu && deleteEl(menu)

    // Get the child hidden style
    const childHiddenStyle = el(`nudge-opacity-${hash}`)
    // 6
    childHiddenStyle && deleteEl(childHiddenStyle)
    // 2 is fine. Can leave it with hash
  }

  // Utils

  addChildHiddenStyles = (node, hash) => {
    var childSelector = `${nodeSelector(node)} > :not(.${options.menuClass}) *`
    styleAdder(
      childSelector,
      "{ opacity: 0 !important }",
      `nudge-opacity-${hash}`
    )
  }

  const nodeSelector = node => {
    let selector = {}
    if (node.className !== "") {
      selector.className = node.className.replace(/(^|\s+)/g, ".")
    }
    if (typeof node.id != "undefined") {
      selector.id = `#${node.id}`
    }
    if (selector.id && selector.className) {
      return `${selector.id} ${selector.className}`
    } else if (selector.id) {
      return `${selector.id}`
    } else if (selector.className) {
      return `${selector.className}`
    }
  }

  const addHiddenStyles = (node, hash) => {
    // Grab previous style of now-hidden div
    var prevStyle = {
      visibility: node.style.visibility,
      pointerEvents: node.style.pointerEvents,
      cursor: node.style.cursor
    }

    // Add this new processed div to divsHidden, and store its previous styles for use in the future
    if (!hiddenNodes[hash].visibility) {
      hiddenNodes[hash] = { ...prevStyle, ...hiddenNodes[hash] }
    }

    // Have to set visibility property with important in this lengthier fashion
    node.style.setProperty("visibility", "hidden", "important")
    node.style.pointerEvents = "none"
    node.style.cursor = "default"
  }

  // Circle add function
  function addMenu(node, domain, hidee, hash) {
    // See if there is already a circle in there...
    if (
      !node.childNodes ||
      node.childNodes.length === 0 ||
      node.childNodes[0].className != options.menuClass
    ) {
      try {
        if (options.menuHtmlString.includes(options.menuClass)) {
          appendHtml(node, options.menuHtmlString)
        }
        handleMenu(node, domain, hidee, hash)
      } catch (e) {
        // console.log(e)
      }
    }
  }

  function handleMenu(node, domain, hidee, hash) {
    // Find the container of the links
    var menu = node.childNodes[0]
    var dropdown = menu.firstChild.firstChild.firstChild
    var supportButtonContainer = menu.childNodes[1]

    // Set up support button container link
    supportButtonContainer &&
      (supportButtonContainer.childNodes[0].href = options.supportLink)

    // Access the show links relative to the tree structure
    var showOnceLink = dropdown.childNodes[1]
    var showAlwaysLink = dropdown.childNodes[2]

    showOnceLink.onclick = function() {
      showNode(node, hidee, hash)
      hidee.excluded = true
      onShowOnce(hidee, domain)
    }

    showAlwaysLink.onclick = function() {
      showNode(node, hidee, hash)
      hidee.excluded = true
      onShowAlways(hidee, domain)
    }
  }

  function observeDoc() {
    var observer = new MutationObserver(
      // You don't use any mutation info
      // It's just a convenient trigger
      // If we used the passed mutations and looped each mutation,
      // we could only run if addedNode or removedNode > 0
      // But we don't use them, because it could be slower
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

  // This runs every mutation and triggers a check to see that the right nodes are hidden
  const runOnMutation = () => {
    // Identify any change in URL
    let checkHideesOnUrlChange = false
    if (window.location.href != currentUrl || currentUrl == false) {
      // The URL has changed
      currentUrl = window.location.href
      checkHideesOnUrlChange = true
    }

    // Cycle through hidees and get elements that match their class, id, or both
    // This is completely unrelated to the hidee that was just added in the mutation
    // Which seems inefficient but I think is more accurate because the mutations sometimes aren't correct...
    // ...at the point of happening
    domainHidees.forEach(function(hidee) {
      if (checkHideesOnUrlChange) {
        hidee.ignored = isHideeIgnoredByUrl(
          currentUrl,
          hidee.ignorePages,
          hidee.includePages
        )
      }
      findHideeNodesInDoc(hidee).forEach(node => {
        processNode(node, hidee, domain)
      })
      // If currentUrl
    })
  }

  // Check whether a hidee should be ignored based on the URL
  const isHideeIgnoredByUrl = (currentUrl, ignorePages, includePages) => {
    let ignored = false
    // FIXME: currently this only supports single entry ignorePages and includePages values
    // Spec: ignorePages and includePages can't both be on the same domain
    if (ignorePages && currentUrl.includes(ignorePages)) {
      ignored = true
    }
    if (includePages && !currentUrl.includes(includePages)) {
      ignored = true
    }
    return ignored
  }

  // Process any node that matches a hidee
  const processNode = (node, hidee, domain) => {
    // Show node if it's excluded (show once or show always) or ignored (by URL)
    log(hidee)
    if (hidee.excluded || hidee.ignored) {
      showNode(node, hidee, getNodeHash(node))
      return
    }

    // Otherwise, hide node
    hideNode(node, hidee, domain, getNodeHash(node))
  }

  // Find hidee nodes in doc
  const findHideeNodesInDoc = hidee => {
    let nodes = []
    if (hidee.id && hidee.className) {
      // Search for brand new ones
      Array.from(document.getElementsByClassName(hidee.className)).forEach(
        function(node) {
          if (node.id === hidee.id) {
            nodes.push(node)
          }
        }
      )
    } else if (hidee.id) {
      const node = document.getElementById(hidee.id)
      if (node) {
        nodes.push(node)
      }
    } else if (hidee.className) {
      Array.from(document.getElementsByClassName(hidee.className)).forEach(
        function(node) {
          nodes.push(node)
        }
      )
    }
    return nodes
  }

  // Get or create a node hash
  const getNodeHash = node => {
    let hash = false
    // Assign new hash or get previous
    if (!node.className.includes("nudge")) {
      hash = getUserId()
    } else {
      hash = node.className.substring(node.className.indexOf("nudge-") + 6)
    }
    return hash
  }

  // Utils
  function el(id) {
    var element = document.getElementById(id)
    return element
  }
  function deleteEl(element) {
    if (!element || !element.parentNode) {
      return
    }
    element.parentNode.removeChild(element)
  }
  function appendHtml(parent, childString, callback) {
    if (parent) {
      parent.insertAdjacentHTML("afterbegin", childString)
    }
    if (callback) {
      callback()
    }
  }
  function onDocHeadExists(callback) {
    document.addEventListener("DOMSubtreeModified", runCallback, false)
    function runCallback() {
      if (document.head) {
        document.removeEventListener("DOMSubtreeModified", runCallback, false)
        callback()
      }
    }
  }
  function styleAdder(name, style, id) {
    var styleText = name + style
    style = document.createElement("style")
    style.innerHTML = styleText
    if (id) {
      style.id = id
    }
    document.head.appendChild(style)
  }
  function addCSS(cssId, nudgeUrl) {
    if (!document.getElementById(cssId)) {
      var head = document.getElementsByTagName("head")[0]
      var link = document.createElement("link")
      link.id = cssId
      link.rel = "stylesheet"
      link.type = "text/css"
      link.href = chrome.extension.getURL(nudgeUrl)
      link.media = "all"
      head.appendChild(link)
    }
  }
}
