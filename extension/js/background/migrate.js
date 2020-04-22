function migrateSettings(settings) {
  let newSettings = {}
  // Migrate the userId
  if (settings.userId && typeof settings.userId === "string") {
    newSettings.userId = settings.userId
  } else {
    newSettings.userId = getUserId()
  }
  const boolean = [
    "time_nudge",
    "div_hider",
    "fb_grey",
    "fb_hide_notifications",
    "fb_auto_unfollow",
    "off_by_default",
    "stop_autoplay",
    "scroll_nudge",
    "fb_profile_ratio",
    "get_stickier",
    "paid",
    "share_data",
  ]
  const array = ["on_domains", "unhidden_hidees"]
  const hybrid = [
    "daily_goal",
    "snooze",
    "schedule",
    "install_date",
    "last_seen_day",
    "settings_version",
  ]
  boolean.forEach((setting) => {
    if (typeof settings[setting] === "boolean") {
      newSettings[setting] = settings[setting]
    } else {
      newSettings[setting] = defaultSettings[setting]
    }
  })
  // Change whitelist name
  if (settings.whitelist && Array.isArray(settings.whitelist)) {
    newSettings.whitelist_domains = settings.whitelist
  } else {
    newSettings.whitelist_domains = []
  }
  array.forEach((setting) => {
    newSettings[setting] = defaultSettings[setting]
  })
  hybrid.forEach((setting) => {
    if (settings[setting]) {
      newSettings[setting] = settings[setting]
    } else {
      newSettings[setting] = false
    }
  })
  if (
    settings.domains &&
    typeof settings.domains === "object" &&
    !Array.isArray(settings.domains)
  ) {
    let newDomains = []
    Object.keys(settings.domains).forEach((domain) => {
      if (settings.domains[domain].nudge) {
        newDomains.push(domain)
      }
    })
    newSettings.nudge_domains = newDomains
  } else {
    newSettings.nudge_domains = []
  }
  return newSettings
}
