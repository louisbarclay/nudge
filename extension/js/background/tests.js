// Insert all tests here
const testSettings = {
  bg_image: false,
  compulsive: 10,
  compulsive_nudge: true,
  constantise: true,
  daily_goal: false,
  div_hider: true,
  domains: {
    "facebook.com": { nudge: true, off: false },
    "gmail.com": { nudge: true, off: true },
    "buzzfeed.com": { nudge: false, off: false },
  },
  fb_auto_unfollow: true,
  fb_grey: true,
  fb_hide_notifications: false,
  fb_profile_ratio: false,
  fb_show_unfollow: true,
  get_stickier: false,
  install_date: false,
  last_seen_day: "2020-04-22",
  off_by_default: true,
  paid: false,
  schedule: false,
  scroll: 5,
  scroll_nudge: true,
  share_data: true,
  show_intro: 0,
  show_switch: true,
  snooze: { all: 0 },
  stop_autoplay: true,
  time: 15,
  time_nudge: true,
  unhidden_divs: ["seomt"],
  userId: "c68e928e7fa46e4c884bddbedaf177f8e5f0135836748706ee34afd5f797c2c",
  whitelist: [
    "facebook.com/*/dialog/oauth",
    "api.twitter.com/oauth/authenticate",
    "accounts.google.com/signin/oauth",
    "login.yahoo.com/config/login",
  ],
}
if (config.dev) {
  // testMigrateSettings()
}
function testMigrateSettings() {
  log(migrateSettings(testSettings))
}

function showMeStuff(date) {
  var object = JSON.parse(localStorage[date])
  var totalLoggedTimeToday = 0
  Object.keys(object).forEach(function (key) {
    var totalTime = 0
    var runningCounter = 0
    if (object[key].time != undefined) {
      totalTime = object[key].time / 1000
      totalLoggedTimeToday += totalTime
    }
    if (object[key].runningCounter != undefined) {
      runningCounter = object[key].runningCounter
      totalLoggedTimeToday += runningCounter
    }
    log(key, logMinutes(totalTime + runningCounter))
  })
  log("*Total today: " + logMinutes(totalLoggedTimeToday))
}

// Test day change
var testState = {
  domain: "facebook.com",
  source: "initial",
  lastEverySecond: moment()
    // .add(-1, "days")
    .add(-0.5, "hours"),
  time: moment().add(-1, "hours").toString(),
}

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Test function
async function t() {
  // Clear data
  r()
  // Wait a second
  await timeout(1500)

  log("Pause over, let's test")
  // Go into test mode
  testMode = true

  // Set the time we will artifically induce
  // var timeOverride = moment().add(1, "hours");
  var timeOverride = moment().add(2, "days")
  var domain = "test.com"
  var source = "test-source"

  // Grab currentState
  var status = open("status")
  // For gap before day change, do nothing
  // // For no gap:
  // status.currentState.lastEverySecond = timeOverride;
  // // For gap after day change:
  // status.currentState.lastEverySecond = moment(timeOverride)
  //   .startOf("day")
  //   .add(2, "hours");

  // Close currentState
  close("status", status, "status close in test")

  // Put through new timeline event
  timeline(domain, source, timeOverride)

  log(localStorage)

  await timeout(12000)
  log("Pause over, back to business as usual")
  // Clear false data
  r()
  // Start business as usual
  testMode = false
}

// Can put timeline events into the future
// Take NOW, that's fine and good

testMode = false
