// Non-domains
var notInChrome = "$notInChrome";
var chromeOrTabIdle = "$chromeOrTabIdle";
var inChromeFalseDomain = "$inChromeFalseDomain";
var allDomains = "$allDomains";

// Quick access to settings
var settingsLocal = {};

// Default domain info
var defaultDomainInfo = {
  nudge: true,
  off: false,
  offByDefault: false
};

// Default domains
var defaultDomains = [
  "messenger.com",
  "facebook.com",
  "twitter.com",
  "linkedin.com",
  "reddit.com",
  "diply.com",
  "buzzfeed.com",
  "youtube.com",
  "mail.google.com",
  "gmail.com",
  "theladbible.com",
  "ladbible.com",
  "news.ycombinator.com",
  "instagram.com",
  "pinterest.com",
  "theguardian.com",
  "bbc.com",
  "bbc.co.uk",
  "tinder.com",
  "theguardian.co.uk",
  "dailymail.co.uk",
  "iwastesomuchtime.com",
  "mailonline.com",
  "imgur.com",
  "netflix.com",
  "tumblr.com",
  "thesportbible.com",
  "telegraph.co.uk",
  "worldsmostboringwebsite.com"
];

// Default non-domain settings
var defaultSettings = {
  scroll_s_setting: 5,
  scroll_b_setting: 3,
  time_s_setting: 10,
  time_b_setting: 5,
  compulsive_setting: 10,
  show_fb_unfollow: true,
  show_fb_ad: true,
  show_off_switch: true,
  reshow_time: false
};

// Other constants
var minSec = 60;
var sendFailLimit = 10;
var lastSuccessfulNudgeTime = 0; // could consider doing this on a domain by domain basis
