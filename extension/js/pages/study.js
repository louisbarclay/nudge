const input = el("js-input")
const button = el("js-submit")
const warning = el("js-warning")

// FIXME: group IDs to be supplied by Aditya and Kristoffer
const groupA = "4xctadd3571k"
const groupB = "4xctadd3572k"
const groupC = "4xctadd3573k"
const groupD = "4xctadd3574k"

button.onclick = function () {
  const value = input.value.trim()

  if (checkValue(value)) {
    // Send to Amplitude
    changeSettingRequest(value, "study")
    Object.keys(controlSettings).forEach((setting) => {
      changeSettingRequest(controlSettings[setting], setting)
    })
    // Get group ID
    const groupId = value.substring(0, 12)

    // And change settings depending on value
    if (groupId === groupA) {
      log("Control group - not changing settings")
    } else if (groupId === groupB) {
      log("YouTube autoplay only group - change setting")
      changeSettingRequest(true, "stop_autoplay")
    } else if (groupId === groupC) {
      log("YouTube autoplay only group - change setting")
      changeSettingRequest(true, "off_by_default")
    } else if (groupId === groupD) {
      log("YouTube autoplay only group - change setting")
      changeSettingRequest(true, "stop_autoplay")
      changeSettingRequest(true, "off_by_default")
    }

    window.location = "welcometostudy.html"
  }
}

function checkValue(value) {
  const groupId = value.substring(0, 12)
  console.log(groupId)
  function checkGroupId(groupId) {
    if (
      groupId === groupA ||
      groupId === groupB ||
      groupId === groupC ||
      groupId === groupD
    ) {
      return true
    } else {
      return false
    }
  }
  if (checkGroupId(groupId)) {
    return true
  } else {
    warning.style.display = "block"
  }
}

// Control group study settings
var controlSettings = {
  // Features
  time_nudge: false,
  div_hider: false,
  fb_grey: false,
  fb_hide_notifications: false,
  fb_auto_unfollow: false,
  off_by_default: false,
  stop_autoplay: false,
  scroll_nudge: false,
  // Unfollow info
  fb_profile_ratio: false,
  // Domain lists
  whitelist_domains: [
    "facebook.com/*/dialog/oauth",
    "api.twitter.com/oauth/authenticate",
    "accounts.google.com/signin/oauth",
    "login.yahoo.com/config/login",
    "business.facebook.com",
    "developers.facebook.com",
    "developer.twitter.com",
  ],
  nudge_domains: ["youtube.com"],
  on_domains: [],
  // Hider settings
  unhidden_hidees: [],
  // Defaulter settings
  get_stickier: false,
  daily_goal: false,
  // Snooze
  snooze: { all: 0 },
  // Paid
  paid: true,
  // Schedule
  schedule: false,
  // Share data
  share_data: true,
  settings_version: 2,
  dev: false,
}
