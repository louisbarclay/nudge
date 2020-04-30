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
      if (toggle) {
        if (toggle.attributes.checked) {
          // That particular toggle exists and is checked
          // We change its value
          toggle.click()
          // log(`Clicked ${toggle.id}`)
          observe = false
        } else {
          // The toggle exists and is not checked
          // We can stop observing
          observe = false
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
