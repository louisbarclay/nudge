// Beware! Some cases are more appropriate for className, others more appropriate for id
// For instance, on Buzzfeed there is a section that clearly has id applied a little late in page load
// Which means that it doesn't get hidden as immediately as you'd want

var divs = {
  "stackoverflow.com": [
    {
      id: "hot-network-questions"
    }
  ],
  "buzzfeed.com": [
    {
      id: "mod-site-component-list-1"
    },
    {
      className: "feed-cards col xs-col-12 md-col-8 clearfix xs-mb3"
    },
    {
      id: "mod-recsys-thumbstrip-1"
    },
    {
      id: "mod-recsys-list-1"
    },
    {
      id: "mod-quickly-catch-up-1"
    },
    {
      id: "mod-site-component-list-2"
    },
    {
      id: "mod-site-component-list-3"
    },
    {
      className: "now-buzzing"
    }
  ],
  "youtube.com": [
    {
      id: "related",
      className: "style-scope ytd-watch-flexy"
    }
    // {
    //   id: "contents",
    //   className: "style-scope ytd-section-list-renderer"
    // }
  ],
  "linkedin.com": [
    {
      className: "core-rail"
    },
    {
      className: "feed-right-rail right-rail"
    }
  ],
  "facebook.com": [
    {
      id: "leftCol"
    },
    {
      id: "fallback_feed"
    },
    {
      id: "rightCol"
    }
  ]
}

var whitelist = ["youtube.com/results?search_query"]

var blacklist = [{ domain: "linkedin.com", url: "linkedin.com/feed/" }]
