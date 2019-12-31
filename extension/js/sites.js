function runSites(settings) {
  log(settings)
  populateDomains(settings.domains)
}

function populateDomains(domains) {
  Object.keys(domains).forEach(function(key) {
    if (domains[key].nudge) {
      addLi(key, domainTags, domainTagsHandler)
    } else {
      console.log(key)
    }
  })
}
