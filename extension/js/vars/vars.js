// Non-Nudge domains
var notInChrome = "$notInChrome"
var chromeIdle = "$idleSystem"
var tabIdle = "$idleTab"
var offPage = "$offPage"
var whitelistPage = "$whitelistDomain"
var chromePage = "$chromePage"
var httpPage = "$httpPage"
var unknownPage = "$unknownPage"
var nudgePage = "$nudgePage"

// Catch all domain
var allDomains = "$allDomains"

// Do we show the options page on init?
var showOptionsPage = false

// Quick access to settings
var settingsLocal = {}

// Default domain info
var defaultDomainInfo = {
  nudge: true,
  off: false
}

// Default domains
var defaultDomains = []

// Suggestions
var topRecommendations = [
  "facebook.com",
  "instagram.com",
  "youtube.com",
  "twitter.com",
  "buzzfeed.com",
  "yahoo.com",
  "reddit.com",
  "linkedin.com",
  "tumblr.com",
  "netflix.com"
]

var shoppingRecommendations = [
  "amazon.com",
  "amazon.co.uk",
  "ebay.com",
  "ebay.co.uk"
]

var socialRecommendations = [
  "facebook.com",
  "instagram.com",
  "imgur.com",
  "linkedin.com",
  "tumblr.com",
  "pinterest.com",
  "reddit.com",
  "twitter.com",
  "vk.com",
  "youtube.com"
]

var newsRecommendations = [
  "cnn.com",
  "bbc.co.uk/news",
  "buzzfeed.com",
  "dailymail.co.uk",
  "foxnews.com",
  "theguardian.com",
  "huffpost.com",
  "mashable.com",
  "mailonline.com",
  "news.ycombinator.com",
  "nytimes.com",
  "telegraph.co.uk",
  "usatoday.com",
  "wsj.com",
  "bbc.com"
]

var messagingRecommendations = [
  "web.whatsapp.com",
  "messenger.com",
  "slack.com",
  "mail.google.com",
  "outlook.live.com"
]

// Default non-domain settings
var defaultSettings = {
  scroll: 5,
  time: 15,
  compulsive: 10,
  fb_profile_ratio: false,
  fb_show_unfollow: true,
  fb_auto_unfollow: false,
  fb_grey: false,
  fb_hide_notifications: false,
  div_hider: false,
  constantise: true,
  share_data: true,
  time_nudge: false,
  whitelist: [
    "facebook.com/*/dialog/oauth",
    "api.twitter.com/oauth/authenticate",
    "accounts.google.com/signin/oauth",
    "login.yahoo.com/config/login",
    "business.facebook.com",
    "developers.facebook.com",
    "developer.twitter.com"
  ],
  scroll_nudge: false,
  compulsive_nudge: true,
  show_intro: 0,
  // New settings
  show_switch: true,
  off_by_default: false,
  bg_image: false,
  snooze: { all: 0 },
  get_stickier: false,
  show_update_article: true,
  updated_divs: true,
  unhidden_divs: {},
  paid: false,
  schedule: false
}

var unfollow = {
  listUrl:
    "https://www.facebook.com/feed_preferences/profile_list_more/?card_type=unfollow&filter=all&page=",
  actionUrl: "https://www.facebook.com/ajax/follow/unfollow_profile.php",
  profiles: [],
  executedProfiles: [],
  totalProfiles: false,
  messages: {
    loaded: "Unfollow everything",
    empty: "No profiles to unfollow",
    start: "Trying to unfollow ",
    success: "Successfully unfollowed ",
    fail: "Couldn't unfollow "
  },
  profileRequestCounter: 0,
  profileCounter: 0,
  safetyLock: 100000,
  continueRequest: true,
  timeStarted: false,
  verifText: {
    start: 'Arbiter.inform("UnfollowUser", {"profile_id":',
    end: "});"
  }
}

var refollow = {
  listUrl:
    "https://www.facebook.com/feed_preferences/profile_list_more/?card_type=refollow&filter=all&page=",
  actionUrl: "https://www.facebook.com/ajax/follow/follow_profile.php?dpr=1",
  profiles: [],
  executedProfiles: [],
  totalProfiles: false,
  messages: {
    loaded: "Ready to refollow ",
    empty: "No profiles to refollow",
    start: "Trying to refollow ",
    success: "Successfully refollowed ",
    fail: "Couldn't refollow "
  },
  profileRequestCounter: 0,
  profileCounter: 0,
  safetyLock: 100000,
  continueRequest: true,
  timeStarted: false,
  verifText: {
    start: 'Arbiter.inform("FollowUser", {"profile_id":',
    end: "});"
  }
}

var domainTest = /^((([a-zA-Z]{1})|([a-zA-Z]{1}[a-zA-Z]{1})|([a-zA-Z]{1}[0-9]{1})|([0-9]{1}[a-zA-Z]{1})|([a-zA-Z0-9][a-zA-Z0-9-_]{1,61}[a-zA-Z0-9]))\.)*([a-zA-Z]{2,6}|[a-zA-Z0-9-]{2,30}\.[a-zA-Z]{2,3})(\/(([a-zA-Z]{1})|([a-zA-Z]{1}[a-zA-Z]{1})|([a-zA-Z]{1}[0-9]{1})|([0-9]{1}[a-zA-Z]{1})|([a-zA-Z0-9][a-zA-Z0-9-_]{1,200}[a-zA-Z0-9]))?)?(\/)?$/
var whitelistTest = /^(([a-zA-Z]{1})|([a-zA-Z]{1}[a-zA-Z]{1})|([a-zA-Z]{1}[0-9]{1})|([0-9]{1}[a-zA-Z]{1})|([a-zA-Z0-9][a-zA-Z0-9-_]{1,61}[a-zA-Z0-9]))\.([a-zA-Z]{2,6}|[a-zA-Z0-9-]{2,30}\.[a-zA-Z]{2,3})(\/?)(.[^\s]*)|(\/)?$/
