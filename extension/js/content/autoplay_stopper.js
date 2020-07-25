async function autoplayStopper() {
  let observe = true

  // Start observing the document
  observeDoc()

  // Only look for toggle for 60 seconds, after which give up and disconnect observer
  docReady(() => {
    // log("Begin time out")
    setTimeout(() => {
      // log("Time out: disconnect observer")
      observe = false
    }, 60000)
  })

  // Set toggle
  async function setToggle() {
    // There are two possible toggles
    const toggleOriginal = el("toggle")
    const toggleAlternative = el("improved-toggle")
    // Check both of them
    const toggleArray = [toggleOriginal, toggleAlternative]
    toggleArray.forEach(async (toggle) => {
      // Check that toggle exists
      if (toggle) {
        if (toggle.attributes.checked) {
          // That particular toggle exists and is checked
          // We change its value
          eventLogSender("youtube_autoplay", {
            type: "off_auto",
            domain: "youtube.com",
          })
          toggle.click()
          // log(`Clicked ${toggle.id}`)
          observe = false
        } else {
          eventLogSender("youtube_autoplay", {
            type: "already_off",
            domain: "youtube.com",
          })
          // The toggle exists and is not checked
          // We can stop observing
          observe = false
        }
        // Also attach an onclick to toggle
        toggle.onclick = function () {
          if (toggle.attributes.checked) {
            eventLogSender("youtube_autoplay", {
              type: "on_manual",
              domain: "youtube.com",
            })
          } else {
            eventLogSender("youtube_autoplay", {
              type: "off_manual",
              domain: "youtube.com",
            })
          }
        }
      }
    })
  }

  // Observe doc
  function observeDoc() {
    const observer = new MutationObserver(
      // You don't use any mutation info
      // It's just a convenient trigger
      () => {
        setToggle()
        if (!observe) {
          // log("Disconnected observer")
          observer.disconnect()
        }
      }
    )

    // Observe entire document and childList to capture all mutations
    observer.observe(document, {
      childList: true,
      subtree: true,
      characterData: false,
    })
  }
}
