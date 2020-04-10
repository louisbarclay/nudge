// Options set
getSettings(execSettings)

function execSettings(settings) {
  // Check for snooze
  let dontNudge = checkSnoozeAndSchedule(settings)
  if (dontNudge) {
    log("Won't Nudge")
    return
  }

  var url = window.location.href

  // Find domain
  try {
    var domain = domainCheck(url, settings)
  } catch (e) {
    log(e)
  }

  // Init div hider
  if (settings.div_hider && isNudgeDomain(domain)) {
    // Choose paid or free menus
    const menuPrefix = "hider-menu"
    const menuFile = `${menuPrefix}.html`
    if (
      !settings.paid &&
      (!settings.install_date ||
        moment().diff(moment(settings.install_date), "days") > 7)
    ) {
      menuFile = `${menuPrefix}-alt.html`
    }
    // Set menuHtmlString
    const menuHtmlString = nudgeStorage[menuFile]
    // Set menuClass
    const menuClass = `${menuPrefix}-container`

    hider(
      {
        log,
        supportLink: getUrl("html/pages/support.html"),
        hidees: hideesStore,
        excludedHidees: settings.unhidden_divs,
        menuHtmlString,
        menuClass,
        menuCss: "css/injected/hider-menu.css"
      },
      domain,
      (hidee, domain) => {
        eventLogSender("hide_show_once", { hidee, domain })
      },
      (hidee, domain) => {
        changeSettingRequest(hidee.slug, "unhidden_divs_add")
        eventLogSender("hide_show_always", { hidee, domain })
      }
    )
  }

  if (isNudgeDomain(domain)) {
    onDocHeadExists(function() {
      addCSS("nudges", "css/injected/nudges.css")
      docReady(function() {
        if (settings.time_nudge) {
          insertCorner(domain, settings.off_by_default)
        }
        if (settings.scroll_nudge) {
          insertScroll(domain)
        }
      })
    })

    // Init off keyboard shortcut
    // keyboardShortcut(domain)

    // Tab idler
    tabIdler()

    // Listener for corner
    chrome.runtime.onMessage.addListener(function(request) {
      // Prevent non-domains from changing this
      if (
        request.type === "live_update" &&
        extractDomain(window.location.href).includes(request.domain)
      ) {
        // If in preview mode,
        if (!config.previewMode) {
          cornerInit(request.total, request.visits, request.domain)
        }
      }
    })
  }
}

// function keyboardShortcut(domain) {
//   document.onkeyup = function(key) {
//     if (key.altKey && key.keyCode == 40) {
//       switchOffRequest(domain)
//     }
//   }
// }
