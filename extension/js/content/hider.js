function hider(options, domain, onShowOnce, onShowAlways) {
  // Disable logging unless log variable is present
  !options.log && (log = function () {})
  // Store hiddenNodes by hash
  // Info: you can get hash from class, and slug from hash (in hiddenNodes)
  let hiddenNodes = {}
  // Track current URL
  let currentUrl = false
  // Set hidees
  let hidees = options.hidees
  let excludedHidees = options.excludedHidees
  // Option to debug styles
  const debugStyles = false

  // Define universal styles always applied to hidee nodes
  const universalStyles = {
    "pointer-events": "none",
    cursor: "default",
    display: "flex",
    "flex-direction": "column",
  }

  // Add the CSS that you will need as early as possible
  onDocHeadExists(function () {
    addCSS("hider-menu", options.menuCss)
  })

  // Get only the hidees for this domain, without excluded ones
  const domainHidees = hidees.filter((hidee) => {
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

    // 2. Does the hidee attribute exist?
    // You can get hash from class, and slug from hash (in hiddenNodes)
    // Note: this is just a safety check
    // The real job of checking for a hash and getting a hash is done in a separate function within processNode
    if (node.getAttribute && node.attributes.hidee) {
      setNodeHash(node, hash)
    }

    // 3. Is the hidee excluded?
    // if (hidee.excluded) {
    //   hidee.excluded = false
    // }

    // For special cases where we need hidees to have different ids because they are only identified by class, we apply id
    if (hidee.applyId) {
      node.id = hash
    }

    // 4. Does the node have a child element that's the hide-menu-container?
    // setTimeout(() => {
    if (
      (node.childNodes.length === 0 ||
        node.childNodes[0].className !== options.menuClass) &&
      !hidee.noMenu
    ) {
      addMenu(node, domain, hidee, hash)
    }
    // }, 5000)

    // 5. Are there hidden styles on the element?
    checkAndAddHiddenStyles(node, hash, hidee.style)

    // 6. Does the node have child hidden styles?
    if (!el(`hidee-children-${hash}`) && !debugStyles) {
      addChildHiddenStyles(node, hash)
    }
  }

  showNode = (node, hash) => {
    // Numbers correspond to sections of hideNode

    // 1, 5
    if (hiddenNodes[hash]) {
      // Go back to before using prevStyles
      Object.keys(hiddenNodes[hash]).forEach((property) => {
        // Skip the slug which is in the hiddenNodes hash object
        // TODO: kind of ugly having the slug exception here
        if (property !== "slug") {
          node.style[property] = hiddenNodes[hash][property]
        }
      })
    }

    // Get the menu
    const menu =
      node.children &&
      [...node.children].find((node) => {
        return node.className === options.menuClass
      })
    // 4
    menu && deleteEl(menu)

    // Get the child hidden style
    const childHiddenStyle = el(`hidee-children-${hash}`)
    // 6
    childHiddenStyle && deleteEl(childHiddenStyle)
    // 2 is fine. Can leave it with hash
  }

  // Utils

  addChildHiddenStyles = (node, hash) => {
    var childSelector = `${nodeSelector(node)} > :not(.${
      options.menuClass
    }) *, ${nodeSelector(node)} > :not(.${options.menuClass})`
    styleAdder(
      childSelector,
      `{ opacity: 0 !important; } ${nodeSelector(
        node
      )}:after { display: none; } `,
      `hidee-children-${hash}`
    )
  }

  const nodeSelector = (node) => {
    let selector = {}
    if (node.className && node.className !== "") {
      selector.className = node.className.trim().replace(/(^|\s+)/g, ".")
    }
    if (typeof node.id != "undefined" && node.id.length !== 0) {
      selector.id = `#${node.id}`
    }
    if (selector.id && selector.className) {
      return `${selector.id}${selector.className}`
    } else if (selector.id) {
      return `${selector.id}`
    } else if (selector.className) {
      return `${selector.className}`
    }
  }

  // FIXME: this is a bad name, because it also CHECKS for the styles
  // FIXME: set all styles with !important......................AWFUL!!!!!!!!!!!!!!!!!!!!!!!
  const checkAndAddHiddenStyles = (node, hash, styleObj) => {
    // Grab previous style of now-hidden div

    // This returns an array of styles that you want to change
    const applyStyles = getApplyStyles(styleObj)
    let prevStyle = {}
    // Then loop over those to capture previous styles
    Object.keys(applyStyles).forEach((applyStyle) => {
      // Check if that style is applied on the node already anyway
      if (node.style[applyStyle] != applyStyles[applyStyle]) {
        // Store the current style in prevStyle
        prevStyle[applyStyle] = node.style[applyStyle]
        // Apply the new style, with an !important nuke
        node.style.setProperty(applyStyle, applyStyles[applyStyle], "important")
      }
    })

    // Add this new processed node to hiddenNodes, and store its previous styles for use in the future
    // (Include any previous stuff from the object, i.e. slug)
    hiddenNodes[hash] = { ...prevStyle, ...hiddenNodes[hash] }
  }

  // This is the place for rules about which styles will be applied
  const getApplyStyles = (styleObj) => {
    // If no styles are set, create a styleObj
    !styleObj && (styleObj = {})
    // Create a new styles object
    let styles = {
      ...universalStyles,
    }

    // maxHeight specified in hidee
    styleObj.maxHeight &&
      (styles = {
        ...styles,
        "max-height": styleObj.maxHeight,
        overflow: "hidden",
        "padding-top": "0px",
      })

    // flexDirection specified in hidee
    if (styleObj.flexDirection) {
      styles["flex-direction"] = styleObj.flexDirection
      styles = {
        ...styles,
        "justify-content": "space-between",
      }
    }

    // minHeight specified in hidee
    styleObj.minHeight &&
      (styles = {
        ...styles,
        "min-height": styleObj.minHeight,
      })

    // backgroundColor specified in hidee
    styleObj.backgroundColor &&
      (styles = {
        ...styles,
        "background-color": styleObj.backgroundColor,
        "box-shadow": "none",
        "border-style": "none",
        "border-radius": "4px",
      })

    // borderRadius specified in hidee
    styleObj.borderRadius &&
      (styles = {
        ...styles,
        "border-radius": styleObj.borderRadius,
      })

    // backgroundColor specified in hidee
    styleObj.marginBottom &&
      (styles = {
        ...styles,
        "margin-bottom": styleObj.marginBottom,
      })

    // No backgroundColor specified in hidee, or in debugMode
    if (!styleObj.backgroundColor && !debugStyles) {
      styles = {
        ...styles,
        visibility: "hidden",
      }
    }

    return styles
  }

  // Circle add function
  function addMenu(node, domain, hidee, hash) {
    // See if there is already a menu in there...
    if (
      !node.children ||
      ![...node.children].find((node) => {
        return node.className === options.menuClass
      })
    ) {
      try {
        // Here we have the option to append HTML at the end of the div instead of the beginning
        // Which covers an annoying edge case on Facebook
        if (options.menuHtmlString.includes(options.menuClass)) {
          appendHtml(
            node,
            options.menuHtmlString,
            hidee.style.flexDirection === "column-reverse"
          )
        }
        handleMenu(node, domain, hidee, hash)
      } catch (e) {
        // console.log(e)
      }
    }
  }

  function handleMenu(node, domain, hidee, hash) {
    // Find the container of the links
    var menu = [...node.children].find((node) => {
      return node.className === options.menuClass
    })
    var dropdown = menu.firstChild.firstChild.firstChild
    var supportButtonContainer = menu.childNodes[1]

    // Set up support button container link
    supportButtonContainer &&
      (supportButtonContainer.childNodes[0].href = options.supportLink)

    // Access the show links relative to the tree structure
    const showOnceLink = [...dropdown.childNodes].find((node) => {
      return node.id === "hider-show-once"
    })
    const showAlwaysLink = [...dropdown.childNodes].find((node) => {
      return node.id === "hider-show-always"
    })

    // Here we give our menu the unique CTA depending on the shortName of the hidee
    showOnceLink.innerText = `Show ${hidee.shortName}`

    showOnceLink.onclick = function () {
      showNode(node, hash)
      hidee.excluded = true
      onShowOnce(hidee, domain)
    }

    showAlwaysLink.onclick = function () {
      showNode(node, hash)
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
      characterData: false,
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
    domainHidees.forEach(function (hidee) {
      if (checkHideesOnUrlChange) {
        hidee.ignored = isHideeIgnoredByUrl(
          currentUrl,
          hidee.ignorePages,
          hidee.includePages
        )
      }
      findHideeNodesInDoc(hidee).forEach((node) => {
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
    if (hidee.excluded || hidee.ignored) {
      showNode(node, getOrCreateNodeHash(node, hidee))
      return
    }

    // Otherwise, hide node
    hideNode(node, hidee, domain, getOrCreateNodeHash(node, hidee))
  }

  // Find hidee nodes in doc
  const findHideeNodesInDoc = (hidee) => {
    let nodes = []
    if (hidee.id && hidee.className) {
      // Search for brand new ones
      Array.from(document.getElementsByClassName(hidee.className)).forEach(
        (node) => {
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
        (node) => {
          nodes.push(node)
        }
      )
    }

    let filteredNodes = nodes.filter((node) => {
      let include = true

      // Parent className option
      if (hidee.parentClassName) {
        !(hidee.parentClassName === node.parentElement.className) &&
          (include = false)
      }

      // Parent parent className option
      if (hidee.parentParentClassName) {
        !(
          hidee.parentParentClassName ===
          node.parentElement.parentElement.className
        ) && (include = false)
      }

      // Custom attribute option
      if (hidee.customAttributeName && hidee.customAttributeValue) {
        !(
          node.attributes[hidee.customAttributeName] ||
          node.attributes[hidee.customAttributeName] !==
            hidee.customAttributeValue
        ) && (include = false)
      }

      // Tag name option
      if (hidee.tagName) {
        !(hidee.tagName === node.tagName) && (include = false)
      }

      // Exact match option
      if (hidee.classNameExactMatch) {
        !(hidee.className === node.className) && (include = false)
      }

      // Inner text option
      if (hidee.innerText) {
        !(hidee.innerText === node.innerHTML) && (include = false)
      }

      // Child element option
      if (hidee.firstChildId || hidee.firstChildClassName) {
        const childElements = [...node.childNodes].filter((node) => {
          return node.nodeType === 1
        })

        // Define the first child to compare against
        let firstChild = node.children[0]
        // If first child is the menu child, use next child
        // FIXME: this option would not work with the flexDirection column-reverse option
        if (
          node.children[0] &&
          node.children[0].className === options.menuClass
        ) {
          if (node.children[1]) {
            firstChild = node.children[1]
          } else {
            firstChild = false
          }
        }

        // If you have a first child, compare against the hidee first child property
        if (firstChild) {
          if (hidee.firstChildId && hidee.firstChildClassName) {
            !(
              firstChild.id === hidee.firstChildId &&
              firstChild.className === hidee.firstChildClassName
            ) && (include = false)
          } else if (hidee.firstChildId) {
            !(firstChild.id === hidee.firstChildId) && (include = false)
          } else if (hidee.firstChildClassName) {
            !(firstChild.className === hidee.firstChildClassName) &&
              (include = false)
          }
        } else {
          include = false
        }
      }

      return include
    })

    // Option for finding a node by parent and childIndex
    if (hidee.childIndex && filteredNodes[0]) {
      // Search for an existing found node
      // And check it has child nodes
      if (filteredNodes[0] && filteredNodes[0].children) {
        // Then replace the node with its child, specified by index
        filteredNodes = [filteredNodes[0].children[hidee.childIndex]]
      } else {
        filteredNodes = []
      }
    }

    // Go up to the level of a parent if this option is specified
    // Only do this if we have a filtered node to use
    if (hidee.parentLevels && filteredNodes[0]) {
      let parentNode = filteredNodes[0]
      for (let i = 0; i < hidee.parentLevels; i++) {
        parentNode = parentNode.parentElement
      }
      filteredNodes = [parentNode]
    }

    // Closest parent option
    if (hidee.closestParentClass && filteredNodes[0]) {
      filteredNodes = [
        filteredNodes[0].closest(`[class='${hidee.closestParentClass}']`),
      ]
    }

    if (filteredNodes.length > 1) {
      log("MULTIPLE HIDE ALERT")
      log(hidee)
      log(nodes)
      // TODO: Maybe make the thing light up in pink? As a util?
    }
    // Return filtered nodes if there are any
    if (filteredNodes && filteredNodes[0]) {
      return filteredNodes
    } else return []
  }

  // Get or create a node hash
  const getOrCreateNodeHash = (node, hidee) => {
    let hash = false
    if (node.attributes && node.attributes.hidee) {
      hash = node.attributes.hidee.value
    } else {
      let existingHash = Object.keys(hiddenNodes).find((hash) => {
        return hiddenNodes[hash].slug === hidee.slug
      })
      if (existingHash) {
        hash = existingHash
      } else {
        hash = getUid()
      }
    }
    return hash
  }

  const setNodeHash = (node, hash) => {
    node.setAttribute("hidee", hash)
  }

  // Utils
  // Generate userId
  function getUid() {
    // E.g. 8 * 32 = 256 bits token
    var randomPool = new Uint8Array(32)
    crypto.getRandomValues(randomPool)
    var hex = ""
    for (var i = 0; i < randomPool.length; i++) {
      hex += randomPool[i].toString(16)
    }
    hex = `hider-${hex.substring(0, 58)}`
    // E.g. db18458e2782b2b77e36769c569e263a53885a9944dd0a861e5064eac16f1a
    return hex
  }

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
  function appendHtml(parent, childString, beforeend) {
    let position = !beforeend ? "afterbegin" : "beforeend"
    if (parent) {
      parent.insertAdjacentHTML(position, childString)
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
  function addCSS(cssId, url) {
    if (!document.getElementById(cssId)) {
      var head = document.getElementsByTagName("head")[0]
      var link = document.createElement("link")
      link.id = cssId
      link.rel = "stylesheet"
      link.type = "text/css"
      link.href = chrome.extension.getURL(url)
      link.media = "all"
      head.appendChild(link)
    }
  }
}
