// Beware! Some cases are more appropriate for className, others more appropriate for id
// For instance, on Buzzfeed there is a section that clearly has id applied a little late in page load
// Which means that it doesn't get hidden as immediately as you'd want

var divs = {
  "twitter.com": [
    {
      className:
        "css-1dbjc4n r-1u4rsef r-9cbz99 r-t23y2h r-1phboty r-rs99b7 r-ku1wi2 r-1udh08x",
      description: "Trending bar"
    }
  ],
  "stackoverflow.com": [
    {
      id: "hot-network-questions",
      description: "Questions from other StackExchange sites"
    }
  ],
  "buzzfeed.com": [
    {
      id: "mod-site-component-list-1",
      description: "Side bars and related content"
    },
    {
      className: "feed-cards col xs-col-12 md-col-8 clearfix xs-mb3",
      description: "Main page area"
    },
    {
      id: "mod-recsys-thumbstrip-1",
      description: "Thumbnail strip"
    },
    {
      id: "mod-recsys-list-1",
      description: "Recommendations side bar"
    },
    {
      id: "mod-quickly-catch-up-1",
      description: "Quickly catch up side bar"
    },
    {
      id: "mod-site-component-list-2",
      description: "Side bar 2"
    },
    {
      id: "mod-site-component-list-3",
      description: "Side bar 3"
    },
    {
      className: "now-buzzing",
      description: "Now buzzing"
    }
  ],
  "youtube.com": [
    {
      id: "related",
      className: "style-scope ytd-watch-flexy",
      description: "Recommended videos"
    }
  ],
  "linkedin.com": [
    {
      className: "core-rail",
      description: "News feed"
    },
    {
      className: "right-rail",
      description: "Side bar"
    }
  ],
  "facebook.com": [
    {
      id: "leftCol",
      description: "Left-hand menu"
    },
    {
      id: "fallback_feed",
      description:
        "Fallback feed (occasionally appears if News Feed has been deleted)"
    },
    {
      id: "rightCol",
      description: "Right-hand menu"
    }
  ]
}

var whitelist = ["youtube.com/results?search_query"]

var blacklist = [{ domain: "linkedin.com", url: "linkedin.com/feed/" }]
