execSettings();

async function execSettings() {
  let settings = await loadSettingsRequest();
  let hideesSync = await loadHideesRequest();
  // Check for snooze
  let dontNudge = checkSnoozeAndSchedule(settings);
  if (dontNudge) {
    log("Won't Nudge");
    return;
  }

  const url = window.location.href;

  if (settings.stop_autoplay) {
    console.log("do it");
    const extractedDomain = extractDomain(url);
    if (extractedDomain.includes("youtube.com")) {
      autoplayStopper();
    }
  }

  // Find domain
  try {
    var domain = domainCheck(url, settings);
  } catch (e) {
    log(e);
  }

  // Init div hider
  if (settings.div_hider && isNudgeDomain(domain)) {
    // Choose paid or free menus
    const menuPrefix = "hider-menu";
    let menuFile = `${menuPrefix}.html`;
    const menuHtmlString = extensionStorage[menuFile];
    // Set menuClass
    const menuClass = `${menuPrefix}-container`;

    hider(
      {
        log,
        // supportLink: getUrl("html/pages/support.html"),
        hidees: hideesSync || hideesStore,
        excludedHidees: settings.unhidden_hidees
          ? settings.unhidden_hidees
          : [],
        menuHtmlString,
        menuClass,
        menuCss: "css/injected/hider-menu.css",
        hider_invisibility: settings.hider_invisibility,
      },
      domain,
      (hidee, domain) => {
        eventLogSender("hide_show_once", { hidee: hidee.slug, domain });
      },
      (hidee, domain) => {
        settings.unhidden_hidees.push(hidee.slug);
        changeSettingRequest(settings.unhidden_hidees, "unhidden_hidees");
        eventLogSender("hide_show_always", { hidee: hidee.slug, domain });
      },
      "nudge"
    );
  }

  if (isNudgeDomain(domain)) {
    onDocHeadExists(function () {
      addCSS("nudges", "css/injected/nudges.css");
      docReady(function () {
        if (settings.time_nudge) {
          insertCorner(domain, settings.off_by_default);
        }
        if (settings.scroll_nudge) {
          insertScroll(domain);
        }
      });
    });

    // Init off keyboard shortcut
    // keyboardShortcut(domain)

    // Tab idler
    tabIdler();

    // Listener for corner
    chrome.runtime.onMessage.addListener(function (request) {
      // Prevent non-domains from changing this
      if (
        request.type === "live_update" &&
        extractDomain(window.location.href).includes(request.domain)
      ) {
        // If in preview mode,
        if (!config.previewMode) {
          cornerInit(request.total, request.visits, request.domain);
        }
      }
    });
  }
}
