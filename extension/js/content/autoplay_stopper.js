async function autoplayStopper() {
  let observe = true;

  // Start observing the document
  observeDoc();

  // Only look for toggle for 60 seconds, after which give up and disconnect observer
  docReady(() => {
    // log("Begin time out")
    setTimeout(() => {
      // log("Time out: disconnect observer")
      observe = false;
    }, 60000);
  });

  // Set toggle
  async function setToggle() {
    // There are two possible toggles
    const toggleOriginal = el("toggle");
    const toggleAlternative = el("improved-toggle");
    const toggleNew =
      document.getElementsByClassName("ytp-button").length > 0 &&
      Array.from(document.getElementsByClassName("ytp-button")).find(
        (element) => {
          let label = element.getAttribute("aria-label");
          if (
            label &&
            // For edge case
            (label.toLowerCase().includes("auto-play") ||
              label.toLowerCase().includes("autoplay"))
          ) {
            return true;
          }
        }
      );

    console.log(toggleNew);

    if (toggleNew) {
      // Check that toggle children exist
      if (
        toggleNew.firstElementChild &&
        toggleNew.firstElementChild.firstElementChild
      ) {
        // Read property to see if toggle checked
        let toggleChecked =
          toggleNew.firstElementChild.firstElementChild.getAttribute(
            "aria-checked"
          ) === "true";

        if (toggleChecked) {
          eventLogSender("youtube_autoplay", {
            type: "off_auto",
            domain: "youtube.com",
          });
          toggleNew.click();
          // log(`Clicked ${toggle.id}`)
        } else {
          eventLogSender("youtube_autoplay", {
            type: "already_off",
            domain: "youtube.com",
          });
          // The toggle exists and is not checked
          // We can stop observing
          observe = false;
        }
      }
    } else {
      // Check both of them
      const toggleArray = [toggleOriginal, toggleAlternative, toggleNew];
      toggleArray.forEach(async (toggle) => {
        // Check that toggle exists
        if (toggle) {
          if (toggle.attributes.checked) {
            // That particular toggle exists and is checked
            // We change its value
            eventLogSender("youtube_autoplay", {
              type: "off_auto",
              domain: "youtube.com",
            });
            toggle.click();
            // log(`Clicked ${toggle.id}`)
            observe = false;
          } else {
            eventLogSender("youtube_autoplay", {
              type: "already_off",
              domain: "youtube.com",
            });
            // The toggle exists and is not checked
            // We can stop observing
            observe = false;
          }
          // Also attach an onclick to toggle
          toggle.onclick = function () {
            if (toggle.attributes.checked) {
              eventLogSender("youtube_autoplay", {
                type: "on_manual",
                domain: "youtube.com",
              });
            } else {
              eventLogSender("youtube_autoplay", {
                type: "off_manual",
                domain: "youtube.com",
              });
            }
          };
        }
      });
    }
  }

  // Observe doc
  function observeDoc() {
    const observer = new MutationObserver(
      // You don't use any mutation info
      // It's just a convenient trigger
      () => {
        setToggle();
        if (!observe) {
          // log("Disconnected observer")
          observer.disconnect();
        }
      }
    );

    // Observe entire document and childList to capture all mutations
    observer.observe(document, {
      childList: true,
      subtree: true,
      characterData: false,
    });
  }
}
