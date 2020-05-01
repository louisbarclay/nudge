function loadFavicon(id, domain) {
  function updateFavicon() {
    var bgStyle = `{ background-image: url("https://www.google.com/s2/favicons?domain=${domain}"); }`
    styleAdder("#" + id + ":before", bgStyle)
  }
  updateFavicon()
}
