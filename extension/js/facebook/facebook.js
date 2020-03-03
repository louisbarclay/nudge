// Variables
var executeUnfollow = false
var autoUnfollow = false
var haveRequestedRefollowData = false
var haveUpdatedRatio = false
var cancelOperation = false
var profilesLoaded = false
var fb_dtsg = ""
var user_id = ""
var currentlyUnfollowing = false
var domain = "facebook.com"
var retryUnfollowCount = 0

// Get settings
getSettings(execSettings)

function debugLogger(eventType, detailsObj) {
  if (config.debug) {
    // log(eventType, detailsObj)
  }
}

// Get Facebook user_id and fb_dtsg token needed to send Xhr requests
function getFacebookCreds(callback) {
  // Get the fb_dtsg token that must be passed to get a successful response to an XMLHttpRequest from Facebook
  try {
    // Get fb_dtsg
    fbTokenReady("fb_dtsg", function(node) {
      fb_dtsg = node.value
      debugLogger("getFbDtsg", { length: fb_dtsg.length })
      // Get user_id
      if (document.cookie.match(/c_user=(\d+)/)) {
        if (document.cookie.match(/c_user=(\d+)/)[1]) {
          user_id = document.cookie.match(
            document.cookie.match(/c_user=(\d+)/)[1]
          )
          user_id = user_id[0]
          debugLogger("getUserId", { length: user_id.length })
          callback()
        }
      }
    })
  } catch (e) {
    debugLogger("failedCreds", { errorMessage: e })
    // Error catching
  }
}

// Execute after receiving settings from Chrome sync storage
function execSettings(settings) {
  // Manually set domain
  domain = "facebook.com"
  // No longer checking if facebook.com is off
  // if (!settings.domains[domain] || !settings.domains[domain].nudge) {
  //   return
  // }

  // Check for snooze
  let dontNudge = checkSnoozeAndSchedule(settings)
  if (dontNudge) {
    log("Won't Nudge")
    return
  }

  // Some Facebook-specific nudges
  // If user wants Facebook bar grey, set grey
  if (domain) {
    if (settings.fb_grey) {
      addCSS("nudge-facebook-grey", "css/injected/grey.css")
    }
    // If user wants Facebook notifications hidden, hide them
    if (settings.fb_hide_notifications) {
      addCSS("nudge-facebook-notifications", "css/injected/notifications.css")
    }
  }

  // Set ratio, which is 0 if all friends, groups and pages unfollowed, 1 if none unfollowed, 0.5 if half unfollowed etc.
  var ratio = settings.fb_profile_ratio
  debugLogger("getRatio", { ratio })
  // If user has auto-unfollow on, set 2 variables to true to make it happen
  if (settings.fb_auto_unfollow) {
    executeUnfollow = true
    autoUnfollow = true
    eventLogSender("fb_unfollow_autounfollow", {})
  }

  // Only show the Nudge dialog box if user has this setting true
  if (settings.fb_auto_unfollow) {
    // Cover the pagelet_composer element with a white pseudo-element
    doAtEarliest(function() {
      addCSS("nudge-facebook-dialog", "css/injected/facebook.css")
    })
    // Function to load HTML and configure UX into Nudge dialog box
    function loadUx(uxUrl, uxFunc) {
      doAtEarliest(function() {
        pageletInit(function(element) {
          if (!document.getElementById("nudge-dialog")) {
            docReady(function() {
              // log(keyDefined(storage, uxUrl));
              if (keyDefined(nudgeStorage, uxUrl)) {
                // only do this EVER if it's prepped:
                if (!document.getElementById("nudge-dialog")) {
                  appendHtml(element, nudgeStorage[uxUrl], function() {
                    uxFunc()
                    protectFeatures(settings)
                  })
                }
              }
            })
          }
        })
      })
    }
    // If the user has unfollowed nearly all of their friends, show 'Share' dialog box, not
    // 'Delete your News Feed' dialog box
    loadUx("run.html", runUx)
    docReady(function() {
      getFacebookCreds(function() {
        // If we should be executing an unfollow, e.g. in case of autoUnfollow being on, go ahead and do it
        if (executeUnfollow) {
          friendAndPageListGenerator(unfollow, false, function() {
            executeUnfollow = false
          })
        } else {
          // Otherwise, load all profiles
          friendAndPageListGenerator(unfollow, false)
        }
      })
    })
  }
}

// Send Xhr requests to get friend and page IDs
// 'option' means 'unfollow' or 'refollow', because this function can get information either on
// users who can be refollowed or on users to be unfollowed
function friendAndPageListGenerator(option, oneOff, callback) {
  // Update ratio
  function updateRatio() {
    if (
      !haveUpdatedRatio &&
      (unfollow.totalProfiles || unfollow.totalProfiles === 0) &&
      (refollow.totalProfiles || refollow.totalProfiles === 0)
    ) {
      var profilesFollowed =
        unfollow.totalProfiles /
        (unfollow.totalProfiles + refollow.totalProfiles)
      changeSettingRequest(profilesFollowed, "fb_profile_ratio")
      debugLogger("updateRatio", { ratio: profilesFollowed })
      haveUpdatedRatio = true
    }
  }

  // Always update ratio - i.e. ask for refollow data, setting 'option' to refollow - before getting the rest of data
  if (!haveRequestedRefollowData) {
    // Make sure you don't repeat this step
    haveRequestedRefollowData = true
    // Run the function except for refollow, so you get no. of refollowable (i.e. currently unfollowed) profiles
    debugLogger("getRefollowCount")
    friendAndPageListGenerator(refollow, true, function() {
      // Callback to run original option, which usually will be unfollow
      friendAndPageListGenerator(option, oneOff, function() {
        // Run update ratio here if it's a oneOff
        if (oneOff) {
          updateRatio()
        }
      })
    })
    return
  }

  // Run update ratio
  updateRatio()

  // Ensure 'continueRequest' is set to true before starting
  if (option.profileRequestCounter === 0) {
    option.continueRequest = true
    progressLogger(`Started getting profile info to unfollow`)
  }

  // Create new XMLHttpRequest
  friendandpagelist_get = new XMLHttpRequest()
  // Put in custom URL, including profileRequestCounter, to get a bunch of info back
  friendandpagelist_get.open(
    "POST",
    option.listUrl + option.profileRequestCounter + "&dpr=1",
    true
  )
  // Tweak to get headers in right format
  friendandpagelist_get.setRequestHeader(
    "Content-type",
    "application/x-www-form-urlencoded"
  )
  // Run on successful get of info
  friendandpagelist_get.onreadystatechange = function() {
    if (friendandpagelist_get.readyState == 4) {
      // Get data on batch of profiles in the right format
      var data = friendandpagelist_get.responseText

      // Delete awkward character from string so it can be made into an object via JSON.parse
      data = data.substr(data.indexOf("{"))
      try {
        data = JSON.parse(data)
      } catch (e) {
        debugLogger("couldNotFindData", { errorMessage: e })
      }

      // Store totalProfiles (if you don't have it already), which is the total number of profiles that can be [refollowed/unfollowed]
      if (!option.totalProfiles) {
        debugLogger("getTotalProfiles", {
          fbTotalProfiles: data.payload.totalProfilesCount
        })
        // Temporary total profiles count - will be overriden at loadedAll
        option.totalProfiles = data.payload.totalProfilesCount
      }

      // Limit data to profiles only for easier manipulation
      var hasMoreData = data.payload.hasMoreData
      data = data.payload.profiles

      // If there are any profiles, add them
      if (data.length > 0) {
        // Iterate over the profiles and store them in array
        for (var j = 0; j < data.length; j++) {
          option.profiles.push({
            id: data[j].id,
            name: data[j].name,
            type: data[j].type,
            attempted: false
          })
        }
        // debugLogger("currentProfileCount", {
        //   totalProfiles: option.profiles.length
        // });
      }

      // Find out if all profile data stored
      // var loadedAll = option.profiles.length === option.totalProfiles;
      var loadedAll = !hasMoreData

      // Log progress
      if (!cancelOperation) {
        progressLogger(
          `Preparing to unfollow: ${option.profiles.length} loaded out of ${option.totalProfiles}`
        )
      }

      // If loadedAll - i.e. no more profile data to get - or oneOff - i.e. we only ran this as a one off to get ratio - execute callback

      if (loadedAll) {
        // Run update ratio
        updateRatio()

        debugLogger("allLoaded", {
          // Must do this to ensure we have the correct totalProfiles value
          totalProfiles: option.profiles.length
        })
        profilesLoaded = true
        if (callback) {
          callback()
        }
        if (executeUnfollow) {
          friendAndPageToggler(option)
        }
        // Tell it not to keep going
        option.continueRequest = false
        option.profileRequestCounter = 0
        return
      }

      if (oneOff) {
        debugLogger("oneOff", {
          totalProfiles: option.profiles.length
        })
        if (callback) {
          callback()
        }
        // Tell it not to keep going
        option.continueRequest = false
        option.profileRequestCounter = 0
        return
      }

      // Iterate again
      if (option.continueRequest && !cancelOperation) {
        option.profileRequestCounter++
        friendAndPageListGenerator(option)
      }
    }
  }

  // Define params and send
  var params = ""
  params += "&__a=1" // done
  params += "&fb_dtsg=" + fb_dtsg
  friendandpagelist_get.send(params)
}

// FIXME: some safety features to make sure this can't be abused (i.e. somehow set off friendtoggler multiple times within short space of time leading to acct getting blocked by fb)

// This is the function that actually *does* unfollowing
function friendAndPageToggler(option) {
  // Check if just starting
  if (option.profileCounter === 0) {
    // Log that you are starting
    if (!cancelOperation) {
      headlineLogger(
        `${option.profileCounter} of ${option.totalProfiles} friends, pages, and groups unfollowed`
      )
    }
    debugLogger("startUnfollow", { totalProfiles: option.totalProfiles })
    progressLogger(`Preparing to unfollow: 100% of profiles loaded`)
    // Make clear that you are currently unfollowing
    currentlyUnfollowing = true
  }
  // Check if there are profiles to toggle
  if (option.profiles.length === 0) {
    progressLogger(`You have no profiles to unfollow`)
    headlineLogger(`You're 100% unfollowed`)
    if (el("facebook-button")) {
      el("facebook-button").innerHTML = "Switch off Facebook Unfollower"
    }
    debugLogger("noProfilesToUnfollow")
    return
  }
  // Pick the first profile in the array, since if successful, we'll move it from array
  if (option.profiles[0].attempted) {
    // If profile has been attempted, maybe it was successfully unfollowed/refollowed but the connection died before we got a confirm - so let's skip it for now
    moveOnToNextProfile(option)
    debugLogger("moveOnToNextProfile")
  }
  // Define that profile
  try {
    var profile = option.profiles[0]
  } catch (e) {
    debugLogger("noProfileData", { errorMessage: e })
  }
  // Prevent attempting to unfollow if no profile
  if (typeof profile === "undefined") {
    progressLogger(`You have no profiles to unfollow`)
    debugLogger("noProfileData_undefined", { errorMessage: e })
    return
  } else {
    // Define name and id
    var name = profile.name
    var id = profile.id
    debugLogger("unfollowRequest", {
      nameIdentifier: name.charAt(0) + name.length
    })
  }
  // Create request
  friendandpage_toggle = new XMLHttpRequest()
  friendandpage_toggle.open("POST", option.actionUrl, true)
  friendandpage_toggle.setRequestHeader(
    "Content-type",
    "application/x-www-form-urlencoded"
  )
  // Parameters to make this work!
  var params = ""
  params += "&__a=1" // Need this
  params += "&location=1" // Need this
  params += "&fb_dtsg=" + fb_dtsg
  params += "&__user=" + user_id
  params += "&profile_id=" + id
  params += "&nctr[_mod]=pagelet_timeline_profile_actions"
  params += "&__req=65"
  // Function to run if the process fails
  function retry() {
    retryUnfollowCount++
    debugLogger("retryUnfollow", { retryUnfollowCount })
    if (retryUnfollowCount > 4) {
      headlineLogger(`Something went wrong. Please check your connection`)
      debugLogger("hitMaxRetry", { retryUnfollowCount })
      stopInit()
      retryUnfollowCount = 0
      return
    }
    friendAndPageToggler(option)
  }
  // Run on successful response to the request
  friendandpage_toggle.onreadystatechange = function() {
    if (friendandpage_toggle.readyState == 4) {
      // If the request didn't work, try again after 5 seconds - and retry 4 times
      if (friendandpage_toggle.status === 0) {
        debugLogger("failedRequest_willRetry", {
          errorMessage: friendandpage_toggle
        })
        if (retryUnfollowCount === 0) {
          option.profiles[0].attempted = true
        }
        setTimeout(retry, 5000)
        return
      }
      // Get data into the right format
      var data = friendandpage_toggle.responseText
      data = data.substr(data.indexOf("{"))
      data = JSON.parse(data)
      // If data came back OK, i.e. not undefined...
      if (typeof data != "undefined") {
        // ...if there is an 'error' key on data, Facebook is blocking us, so we stop...
        if (typeof data.error != "undefined") {
          headlineLogger(`Something went wrong. Please try again in 24 hours`)
          debugLogger("fatalError", { errorMessage: data.error })
          return
        }
        // ...but if no 'error' key on data, we probably succeeded
        // Check if we received a message back from Facebook that confirms a successful unfollow/refollow
        if (
          typeof data.onload != "undefined" &&
          data.onload[0] === option.verifText.start + id + option.verifText.end
        ) {
          // Reset the retry count
          retryUnfollowCount = 0
          // Increase the count of profiles successfully unfollowed
          moveOnToNextProfile(option)
          // Stop operation if cancelled
          if (cancelOperation) {
            debugLogger("cancelUnfollow", {
              executedProfilesLength: option.executedProfiles.length,
              profilesLength: option.profiles.length
            })
            // headlineLogger(
            //   `${option.profileCounter} of ${option.totalProfiles} friends, pages, and groups unfollowed`
            // )
          } else {
            // Logging stuff
            progressLogger(`Unfollowed ${name}`)
            headlineLogger(
              `${option.profileCounter} of ${option.totalProfiles} friends, pages, and groups unfollowed`
            )
            if (option.profileCounter % 10 === 0) {
              eventLogSender("fb_unfollow_progress", {
                unfollowedOfFollowed:
                  option.profileCounter / option.totalProfiles
              })
            }
            debugLogger("unfollowSuccess", {
              nameIdentifier: name.charAt(0) + name.length,
              count: option.profileCounter,
              totalProfiles: option.totalProfiles
            })
            var pct =
              ((option.profileCounter / option.totalProfiles) * 100).toFixed(
                0
              ) + "%"
            autoUnfollowLogger(`${pct} auto-unfollowed `, false, false)

            // Run another iteration after a c.1s delay
            if (option.profiles.length !== 0) {
              setTimeout(function() {
                friendAndPageToggler(option)
              }, randomTime(1, 0.1))
            } else {
              // Stop working because we have no more profiles to unfollow
              setTimeout(function() {
                headlineLogger(
                  `Congratulations! Finished unfollowing ${option.profileCounter} friends, pages and groups.`
                )
                eventLogSender("fb_unfollow_success", {
                  ratio: 1 - option.profileCounter / option.totalProfiles
                })
                autoUnfollowLogger(`100% auto-unfollowed `, false, false)
                var button = document.getElementById("facebook-button")
                if (button) {
                  button.innerHTML = "Now Nudge your friends"
                  button.onclick = function() {
                    popupCenter(
                      "https://www.facebook.com/sharer/sharer.php?u=http%3A//nudgeware.io",
                      "Share Nudge on Facebook",
                      555,
                      626
                    )
                  }
                }
                var bottom = document.querySelector(".facebook-bottom-text")
                if (bottom) {
                  bottom.innerHTML = nudgeStorage["share_bottom.html"]
                  shareBottomLinks()
                }
              }, 2000)
              // Change button
            }
          }
        } else {
          // We got data back but the unfollow request didn't work, so we log it
          debugLogger("fb_unfollow_fail", {
            responseText: friendandpage_toggle.responseText
          })
        }
      }
    }
  }
  // Send the request
  friendandpage_toggle.send(params)
}

function moveOnToNextProfile(option) {
  option.profileCounter++
  var itemToMove = option.profiles.shift()
  option.executedProfiles.push(itemToMove)
}

// UX stuff
function pageletInit(callback) {
  var pageletExists = false
  var pagelet = document.getElementById("pagelet_composer")
  if (pagelet) {
    debugLogger("pagelet_composer exists from start")
    callback(pagelet)
    return
  } else {
    debugLogger("pagelet_composer does not exist right now")
  }

  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      for (var i = 0; i < mutation.addedNodes.length; i++) {
        var pagelet = document.getElementById("pagelet_composer")
        if (pagelet) {
          if (pageletExists === false) {
            debugLogger("pagelet_composer exists now")
            pageletExists = true
          }
          callback(pagelet)
          observer.disconnect()
        }
      }
    })
  })

  observer.observe(document, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false
  })
}

function protectFeatures(settings) {
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      for (var i = 0; i < mutation.addedNodes.length; i++) {
        checkOnMutation(settings)
      }
    })
  })

  observer.observe(document, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false
  })
}

function checkOnMutation(settings) {
  // Make sure if grey that always stays grey
  if (settings.fb_grey) {
    var grey = document.getElementById("nudge-facebook-grey")
    if (!grey) {
      addCSS("nudge-facebook-grey", "css/injected/grey.css")
    }
  }

  // Make sure if hide notifs that they always stay hidden
  if (settings.fb_hide_notifications) {
    var notifications = document.getElementById("nudge-facebook-notifications")
    if (!notifications) {
      addCSS("nudge-facebook-notifications", "css/injected/notifications.css")
    }
  }

  // Make sure pagelet never covered in white without dialog
  var pagelet = document.getElementById("pagelet_composer")
  if (pagelet) {
    var dialog = document.getElementById("nudge-dialog")
    var facebookCss = document.getElementById("nudge-facebook-dialog")
    if (dialog && !facebookCss) {
      addCSS("nudge-facebook-dialog", "css/injected/facebook.css")
    } else if (!dialog && facebookCss) {
      deleteEl(facebookCss)
    }
  }
}

// UX helpers
function hideLink() {
  var container = document.querySelector(".facebook-container")
  var close = document.querySelector(".facebook-close")
  var hide = document.getElementById("fb_show_unfollow")
  hide.onclick = function() {
    changeSettingRequest("toggle", hide.id)
    deleteEl(container)
    deleteEl(close)
    styleAdder("#pagelet_composer::before", "{ content: none !important; }")
  }
}

// Log messages if auto-unfollowing
function autoUnfollowLogger(firstMsg, secondMsg, secondOnclick) {
  var fb_auto_unfollow = document.getElementById("fb_auto_unfollow")
  var fb_unfollow_extra = document.getElementById("fb_unfollow_extra")
  if (fb_auto_unfollow && firstMsg !== false) {
    fb_auto_unfollow.innerHTML = firstMsg
  }
  if (fb_unfollow_extra) {
    if (secondMsg !== false) {
      fb_unfollow_extra.innerHTML = secondMsg
    }
    if (secondOnclick) {
      fb_unfollow_extra.onclick = function() {
        secondOnclick()
      }
    }
  }
}

// Make the 'auto-unfollow' link work
function unfollowLink() {
  function stopAutounfollowing() {
    changeSettingRequest(false, "fb_auto_unfollow")
    autoUnfollow = false
    stopAuto()
    autoUnfollowLogger(``, `Auto-unfollow`, startAutounfollowing)
  }
  function startAutounfollowing() {
    changeSettingRequest(true, "fb_auto_unfollow")
    autoUnfollow = true
    startAuto()
    autoUnfollowLogger(`Auto-unfollowing `, `(don't)`, stopAutounfollowing)
  }
  if (autoUnfollow) {
    autoUnfollowLogger(`Auto-unfollowing `, `(don't)`, stopAutounfollowing)
  } else {
    autoUnfollowLogger(``, `Auto-unfollow`, startAutounfollowing)
  }
}

// Start auto-unfollowing
function startAuto() {
  cancelOperation = false
  friendAndPageToggler(unfollow)
}

// Stop auto-unfollowing
function stopAuto() {
  cancelOperation = true
}

// Make 'FAQ' link work
function moreLink(intro) {
  var container = document.querySelector(".facebook-container")
  var link_to_more = document.getElementById("link_to_more")
  link_to_more.onclick = function() {
    container.innerHTML = nudgeStorage["more_content.html"]
    var back_to_share = document.getElementById("back_to_share")
    back_to_share.onclick = function() {
      if (intro) {
        container.innerHTML = nudgeStorage["intro.html"]
        intro()
      } else {
        container.innerHTML = nudgeStorage["share_content.html"]
        shareUx()
      }
    }
  }
}

// Make bottom links work
function shareBottomLinks() {
  hideLink()
  unfollowLink()
  moreLink()
}

// UX loaders

// UX for intro.html
function introUx(element) {
  var close = document.querySelector(".facebook-close")
  var container = document.querySelector(".facebook-container")
  moreLink(true)
  if (!container) {
    deleteEl(container)
    deleteEl(close)
    styleAdder("#pagelet_composer::before", "{ content: none !important; }")
  }
  var unfollowButton = el("js-unfollow")
  unfollowButton.onclick = function() {
    container.innerHTML = nudgeStorage["confirm_content.html"]
    eventLogSender("fb_unfollow_intro_button", {})
    confirmUx()
  }
  el("js-survey").onclick = function() {
    eventLogSender("survey", { source: "fb_intro" }, moment())
  }
  hideLink()
  close.onclick = function() {
    deleteEl(container)
    deleteEl(close)
    styleAdder("#pagelet_composer::before", "{ content: none !important; }")
    var dialog = document.getElementById("facebook-nudge-dialog")
    deleteEl(dialog)
  }
}

// UX for confirm.html
function confirmUx() {
  var button = el("js-execute-unfollow")
  var container = document.querySelector(".facebook-container")
  button.onclick = function() {
    cancelOperation = false
    container.innerHTML = nudgeStorage["run_content.html"]
    eventLogSender("fb_unfollow_confirm_button", {})
    if (profilesLoaded && !currentlyUnfollowing) {
      friendAndPageToggler(unfollow)
    } else {
      executeUnfollow = true
    }
    runUx()
  }
}

// UX for run.html
function runUx() {
  var container = document.querySelector(".facebook-container")
  var text = document.querySelector(".facebook-text")
  buttonInit()
  var close = document.querySelector(".facebook-close")
  close.onclick = function() {
    deleteEl(container)
    deleteEl(close)
    stopInit()
    styleAdder("#pagelet_composer::before", "{ content: none !important; }")
    var dialog = document.getElementById("facebook-nudge-dialog")
    deleteEl(dialog)
  }
}

// UX for stopping unfollowing
function buttonInit() {
  var button = el("facebook-button")
  button.onclick = function() {
    eventLogSender("fb_unfollow_cancel", {})
    progressLogger(
      `If you leave this page, switch the Unfollower back on in Nudge Options`
    )
    headlineLogger(`Unfollowing has been stopped`)
    stopInit()
    // TODO: add feel free to move to another tab. this process will continue
  }
}

// UX for having hit stop
function stopInit() {
  var button = el("facebook-button")
  cancelOperation = true
  changeSettingRequest(false, "fb_auto_unfollow")
  if (button) {
    button.innerHTML = "Switch the Unfollower back on"
    button.onclick = function() {
      cancelOperation = false
      friendAndPageToggler(unfollow)
      button.innerHTML = "Switch the Unfollower off"
      progressLogger(`Resuming...`)
      headlineLogger(`Starting to unfollow again`)
      changeSettingRequest(true, "fb_auto_unfollow")
      eventLogSender("fb_unfollow_resume", {})
      buttonInit()
    }
  }
}

// UX for share.html
function shareUx() {
  var container = document.querySelector(".facebook-container")
  var close = document.querySelector(".facebook-close")
  close.onclick = function() {
    deleteEl(container)
    deleteEl(close)
    styleAdder("#pagelet_composer::before", "{ content: none !important; }")
  }
  el("js-survey").onclick = function() {
    eventLogSender("survey", { source: "fb_share" })
  }
  // Old sharing function
  // el("nudge-share").onclick = function() {
  //   eventLogSender("share_link", { location: "fb_ad", domain })
  // }
  shareBottomLinks()
  // to refollow, go to // want to make clear where you go to refollow
}

// Function for logging progress from inside unfollowing function (friendAndPageListToggle)
function progressLogger(message) {
  function getEl() {
    return document.getElementById("facebook-specific-progress")
  }
  if (getEl()) {
    getEl().innerHTML = message
  }
}

// Secondary function for logging progress
function headlineLogger(message) {
  function getEl() {
    return document.getElementById("headline-progress")
  }
  if (getEl()) {
    getEl().innerHTML = message
  }
}
