// SHOW:  automatically unfollow any new friends or pages detected. with the slider button
// doespagelet exist?
// if not, do you offer some other way to unfollow?. and notify the app
// does the request for frienddata work? if not, notify

// Variables

var executeUnfollow = false;
var autoUnfollow = false;
var haveRequestedRefollowData = false;
var cancelOperation = false;
var profilesLoaded = false;
var fb_dtsg = "";
var user_id = "";
var currentlyUnfollowing = false;
var domain = "facebook.com";
var retryCount = 0;

// Get settings
getSettings(execSettings);

function getFacebookCreds(callback) {
  // Get the fb_dtsg token that must be passed to get a successful response to an XMLHttpRequest from Facebook
  try {
    // Get fb_dtsg
    fbTokenReady("fb_dtsg", function(node) {
      fb_dtsg = node.value;
      // Get user_id
      if (document.cookie.match(/c_user=(\d+)/)) {
        if (document.cookie.match(/c_user=(\d+)/)[1]) {
          user_id = document.cookie.match(
            document.cookie.match(/c_user=(\d+)/)[1]
          );
          user_id = user_id[0];
          callback();
        }
      }
    });
  } catch (e) {
    console.log(e);
    // Error catching
  }
}

// Execute after getting settings
function execSettings(settings) {
  // Set ratio
  var ratio = settings.fb_profile_ratio;
  // Test different ratio values
  if (settings.fb_grey) {
    addCSS("nudge-facebook-grey", "css/pages/grey.css");
  }
  if (settings.fb_hide_notifications) {
    addCSS("nudge-facebook-notifications", "css/pages/notifications.css");
  }
  if (settings.fb_auto_unfollow) {
    executeUnfollow = true;
    autoUnfollow = true;
  }
  if (ratio === false) {
    docReady(function() {
      getFacebookCreds(function() {
        friendAndPageListGenerator(unfollow, true);
      });
    });
    return;
  }
  if (settings.fb_show_unfollow) {
    // Hide the pagelet composer
    doAtEarliest(function() {
      addCSS("nudge-facebook-dialog", "css/pages/facebook.css");
    });
    // Load all the assets you'll need
    sendHTMLRequest(getUrl("html/facebook/intro.html"), storeForUse);
    sendHTMLRequest(getUrl("html/facebook/confirm_content.html"), storeForUse);
    sendHTMLRequest(getUrl("html/facebook/run_content.html"), storeForUse);
    sendHTMLRequest(getUrl("html/facebook/share_content.html"), storeForUse);
    sendHTMLRequest(getUrl("html/facebook/share_bottom.html"), storeForUse);
    sendHTMLRequest(getUrl("html/facebook/share.html"), storeForUse);
    sendHTMLRequest(getUrl("html/facebook/more_content.html"), storeForUse);
    // Function to run for various scenarios
    function loadUx(uxUrl, uxFunc) {
      doAtEarliest(function() {
        pageletInit(function(element) {
          if (!document.getElementById("nudge-dialog")) {
            docReady(function() {
              if (keyDefined(tempStorage, uxUrl)) {
                // only do this EVER if it's prepped: asdfasdf
                if (!document.getElementById("nudge-dialog")) {
                  appendHtml(element, tempStorage[uxUrl], function() {
                    uxFunc();
                    protectFeatures(settings);
                  });
                }
              }
            });
          }
        });
      });
    }
    if (ratio <= 0.1) {
      loadUx("share.html", shareUx);
      docReady(function() {
        getFacebookCreds(function() {
          if (executeUnfollow) {
            friendAndPageListGenerator(unfollow, false, function() {
              executeUnfollow = false;
            });
          } else {
            friendAndPageListGenerator(unfollow, true);
          }
        });
      });
    } else {
      loadUx("intro.html", introUx);
      docReady(function() {
        getFacebookCreds(function() {
          friendAndPageListGenerator(unfollow, true);
        });
      });
    }
  }
}

// when running for first time, store time in chrome storage
// every time you go back to fb after, keep running if enough time has elapsed
// randomise number of profiles to unfollow every day. max 100

// UX helpers
function hideLink() {
  var container = document.querySelector(".facebook-container");
  var close = document.querySelector(".facebook-close");
  var hide = document.getElementById("fb_show_unfollow");
  hide.onclick = function() {
    changeSettingRequest("toggle", hide.id);
    deleteEl(container);
    deleteEl(close);
    styleAdder("#pagelet_composer::before", "{ content: none !important; }");
  };
}

function autoUnfollowLogger(firstMsg, secondMsg, secondOnclick) {
  var fb_auto_unfollow = document.getElementById("fb_auto_unfollow");
  var fb_unfollow_extra = document.getElementById("fb_unfollow_extra");
  if (fb_auto_unfollow && firstMsg !== false) {
    fb_auto_unfollow.innerHTML = firstMsg;
  }
  if (fb_unfollow_extra) {
    if (secondMsg !== false) {
      fb_unfollow_extra.innerHTML = secondMsg;
    }
    if (secondOnclick) {
      fb_unfollow_extra.onclick = function() {
        secondOnclick();
      };
    }
  }
}

function unfollowLink() {
  function stopAutounfollowing() {
    changeSettingRequest(false, "fb_auto_unfollow");
    autoUnfollow = false;
    stopAuto();
    autoUnfollowLogger(``, `Auto-unfollow`, startAutounfollowing);
  }
  function startAutounfollowing() {
    changeSettingRequest(true, "fb_auto_unfollow");
    autoUnfollow = true;
    startAuto();
    autoUnfollowLogger(`Auto-unfollowing `, `(don't)`, stopAutounfollowing);
  }
  if (autoUnfollow) {
    autoUnfollowLogger(`Auto-unfollowing `, `(don't)`, stopAutounfollowing);
  } else {
    autoUnfollowLogger(``, `Auto-unfollow`, startAutounfollowing);
  }
}

function startAuto() {
  cancelOperation = false;
  friendAndPageToggler(unfollow);
}

function stopAuto() {
  cancelOperation = true;
}

function moreLink() {
  var container = document.querySelector(".facebook-container");
  var link_to_more = document.getElementById("link_to_more");
  link_to_more.onclick = function() {
    container.innerHTML = tempStorage["more_content.html"];
    var back_to_share = document.getElementById("back_to_share");
    back_to_share.onclick = function() {
      container.innerHTML = tempStorage["share_content.html"];
      shareUx();
    };
  };
}

function shareBottomLinks() {
  hideLink();
  unfollowLink();
  moreLink();
}

// UX loaders
function introUx(element) {
  var close = document.querySelector(".facebook-close");
  var container = document.querySelector(".facebook-container");
  if (!container) {
    deleteEl(container);
    deleteEl(close);
    styleAdder("#pagelet_composer::before", "{ content: none !important; }");
  }
  var button = document.querySelector(".facebook-button-blue");
  button.onclick = function() {
    container.innerHTML = tempStorage["confirm_content.html"];
    confirmUx();
  };
  hideLink();
  close.onclick = function() {
    deleteEl(container);
    deleteEl(close);
    styleAdder("#pagelet_composer::before", "{ content: none !important; }");
    var dialog = document.getElementById("facebook-nudge-dialog");
    deleteEl(dialog);
  };
}

function confirmUx() {
  var button = document.querySelector(".facebook-button-blue");
  var container = document.querySelector(".facebook-container");
  button.onclick = function() {
    cancelOperation = false;
    container.innerHTML = tempStorage["run_content.html"];
    if (profilesLoaded && !currentlyUnfollowing) {
      friendAndPageToggler(unfollow);
    } else {
      executeUnfollow = true;
    }
    runUx();
  };
}

function runUx() {
  var container = document.querySelector(".facebook-container");
  var text = document.querySelector(".facebook-text");
  buttonInit();
}

function buttonInit() {
  var button = document.querySelector(".facebook-button-blue");
  button.onclick = function() {
    progressLogger(`Stopped unfollowing`);
    stopInit();
    // TODO: add feel free to move to another tab. this process will continue
  };
}

function stopInit() {
  var button = document.querySelector(".facebook-button-blue");
  button.innerHTML = "Resume unfollowing";
  cancelOperation = true;
  button.onclick = function() {
    cancelOperation = false;
    friendAndPageToggler(unfollow);
    button.innerHTML = "Stop unfollowing";
    progressLogger(`Resuming...`);
    buttonInit();
  };
}

function shareUx() {
  var container = document.querySelector(".facebook-container");
  var button = document.querySelector(".facebook-button-blue");
  button.onclick = function() {
    popupCenter(
      "https://www.facebook.com/sharer/sharer.php?u=http%3A//nudgeware.io",
      "Share Nudge on Facebook",
      555,
      626
    );
  };
  var close = document.querySelector(".facebook-close");
  close.onclick = function() {
    deleteEl(container);
    deleteEl(close);
    styleAdder("#pagelet_composer::before", "{ content: none !important; }");
  };
  shareBottomLinks();
  // to refollow, go to // want to make clear where you go to refollow
}

// https://developers.facebook.com/docs/plugins/share-button
// https://developers.facebook.com/docs/sharing/reference/share-dialog

function progressLogger(message) {
  function getEl() {
    return document.getElementById("facebook-specific-progress");
  }
  if (getEl()) {
    getEl().innerHTML = message;
  }
}

function headlineLogger(message) {
  function getEl() {
    return document.getElementById("headline-progress");
  }
  if (getEl()) {
    getEl().innerHTML = message;
  }
}

// Get friend and page IDs
function friendAndPageListGenerator(option, oneOff, callback) {
  // Always update ratio before getting the rest of data
  if (!haveRequestedRefollowData) {
    haveRequestedRefollowData = true;
    friendAndPageListGenerator(refollow, true, function() {
      friendAndPageListGenerator(option, oneOff, function() {
        var profilesFollowed =
          unfollow.totalProfiles /
          (unfollow.totalProfiles + refollow.totalProfiles);
        changeSettingRequest(profilesFollowed, "fb_profile_ratio");
      });
    });
    return;
  }
  // Empty out profile storage if you're on the first loop
  if (option.profileRequestCounter === 0) {
    option.continueRequest = true;
    progressLogger(`Started getting profile info to unfollow`);
  }

  // Create new XMLHttpRequest
  friendandpagelist_get = new XMLHttpRequest();
  friendandpagelist_get.open(
    "POST",
    option.listUrl + option.profileRequestCounter + "&dpr=1",
    true
  );
  // Tweak to get headers in right format
  friendandpagelist_get.setRequestHeader(
    "Content-type",
    "application/x-www-form-urlencoded"
  );
  // Run on successful get of info
  friendandpagelist_get.onreadystatechange = function() {
    if (friendandpagelist_get.readyState == 4) {
      // Get data in the right format
      var data = friendandpagelist_get.responseText;
      data = data.substr(data.indexOf("{"));
      data = JSON.parse(data);
      // Store totalProfiles (if you don't have it already)
      if (!option.totalProfiles) {
        option.totalProfiles = data.payload.totalProfilesCount;
      }
      // Limit data to profiles only
      data = data.payload.profiles;
      // Iterate over the profiles and store them in array
      for (var j = 0; j < data.length; j++) {
        option.profiles.push({
          id: data[j].id,
          name: data[j].name,
          type: data[j].type,
          attempted: false
        });
      }

      // Find out if all profile data stored
      var loadedAll = option.profiles.length === option.totalProfiles;

      // Log progress
      progressLogger(
        `Preparing to unfollow: ${option.profiles.length} loaded out of ${
          option.totalProfiles
        }`
      );

      // If loadedAll or oneOff, execute callback
      if (loadedAll) {
        profilesLoaded = true;
        if (callback) {
          callback();
        }
        if (executeUnfollow) {
          friendAndPageToggler(option);
        }
        // Tell it not to keep going
        option.continueRequest = false;
        option.profileRequestCounter = 0;
        return;
      }

      if (oneOff) {
        if (callback) {
          callback();
        }
        // Tell it not to keep going
        option.continueRequest = false;
        option.profileRequestCounter = 0;
        return;
      }

      // Iterate again
      if (option.continueRequest && !cancelOperation) {
        option.profileRequestCounter++;
        friendAndPageListGenerator(option);
      }
    }
  };

  // Define params and send
  var params = "";
  params += "&__a=1"; // done
  params += "&fb_dtsg=" + fb_dtsg;
  friendandpagelist_get.send(params);
}

// add up from unfollow and refollow . see if matches that figure you got earlier. if that makes sense.

// FIXME: some safety features to make sure this can't be abused (i.e. somehow set off friendtoggler multiple times within short space of time leading to acct getting blocked by fb)

function friendAndPageToggler(option) {
  // Check if just starting
  if (option.profileCounter === 0) {
    headlineLogger(
      `${option.profileCounter} of ${
        option.totalProfiles
      } friends, pages, and groups unfollowed`
    );
    progressLogger(`Preparing to unfollow: 100% of profiles loaded`);
    currentlyUnfollowing = true;
  }
  // Check if there are profiles to toggle
  if (option.profiles.length === 0) {
    progressLogger(`You have no profiles to unfollow`);
    return;
  }
  // Pick the first profile in the array, since if successful, we'll move it from array
  if (option.profiles[0].attempted) {
    moveOnToNextProfile(option);
  }
  var profile = option.profiles[0];
  // Prevent attempting to unfollow if no profile
  if (typeof profile === "undefined") {
    progressLogger(`You have no profiles to unfollow`);
    return;
  } else {
    var name = profile.name;
    var id = profile.id;
  }
  // Create request
  friendandpage_toggle = new XMLHttpRequest();
  friendandpage_toggle.open("POST", option.actionUrl, true);
  friendandpage_toggle.setRequestHeader(
    "Content-type",
    "application/x-www-form-urlencoded"
  );
  var params = "";
  // Parameters to make this work!
  params += "&__a=1"; // Need this
  params += "&location=1"; // Need this
  params += "&fb_dtsg=" + fb_dtsg;
  params += "&__user=" + user_id;
  params += "&profile_id=" + id;
  params += "&nctr[_mod]=pagelet_timeline_profile_actions";
  params += "&__req=65";
  // Retry function
  function retry() {
    retryCount++;
    if (retryCount > 4) {
      headlineLogger(`Something went wrong. Please check your connection`);
      stopInit();
      retryCount = 0;
      return;
    }
    var detailsObj = { errorMessage: "retry" };
    eventLogSender(domain, "retry", detailsObj);
    friendAndPageToggler(option);
  }
  // Run on successful response to the request
  friendandpage_toggle.onreadystatechange = function() {
    if (friendandpage_toggle.readyState == 4) {
      if (friendandpage_toggle.status === 0) {
        if (retryCount === 0) {
          option.profiles[0].attempted = true;
        }
        setTimeout(retry, 5000);
        return;
      }
      var data = friendandpage_toggle.responseText;
      data = data.substr(data.indexOf("{"));
      data = JSON.parse(data);
      if (typeof data != "undefined") {
        if (typeof data.error != "undefined") {
          headlineLogger(`Something went wrong. Please try again in 24 hours`);
          return;
        }
        // Success happens here
        if (
          typeof data.onload != "undefined" &&
          data.onload[0] === option.verifText.start + id + option.verifText.end
        ) {
          // Reset the retry count
          retryCount = 0;
          // Increase the count of profiles successfully unfollowed
          moveOnToNextProfile(option);
          // Stop operation if cancelled
          if (cancelOperation) {
            eventLogSender("fb_unfollow", "cancelled", {
              executedProfilesLength: option.executedProfiles.length,
              profilesLength: option.profiles.length
            });
            headlineLogger(
              `${option.profileCounter} of ${
                option.totalProfiles
              } friends, pages, and groups unfollowed`
            );
          } else {
            progressLogger(`Unfollowed ${name}`);
            headlineLogger(
              `${option.profileCounter} of ${
                option.totalProfiles
              } friends, pages, and groups unfollowed`
            );
            var pct =
              (option.profileCounter / option.totalProfiles * 100).toFixed(0) +
              "%";
            autoUnfollowLogger(`${pct} auto-unfollowed `, false, false);
            // Run another iteration after a c.1s delay
            if (option.profiles.length !== 0) {
              setTimeout(function() {
                friendAndPageToggler(option);
              }, randomTime(1, 0.1));
            } else {
              // Stop working
              setTimeout(function() {
                headlineLogger(
                  `Congratulations! Finished unfollowing ${
                    option.profileCounter
                  } friends, pages and groups.`
                );
                autoUnfollowLogger(`100% auto-unfollowed `, false, false);
                var button = document.getElementById("facebook-button");
                if (button) {
                  button.innerHTML = "Now Nudge your friends";
                  button.onclick = function() {
                    popupCenter(
                      "https://www.facebook.com/sharer/sharer.php?u=http%3A//nudgeware.io",
                      "Share Nudge on Facebook",
                      555,
                      626
                    );
                  };
                }
                var bottom = document.querySelector(".facebook-bottom-text");
                if (bottom) {
                  bottom.innerHTML = tempStorage["share_bottom.html"];
                  shareBottomLinks();
                }
              }, 2000);
              // Change button
            }
          }
        } else {
          // Major fail - should log it
          eventLogSender("fb_unfollow", "major_fail", {
            responseText: friendandpage_toggle.responseText
          });
        }
      }
    }
  };
  // Send the request
  friendandpage_toggle.send(params);
}

function moveOnToNextProfile(option) {
  option.profileCounter++;
  var itemToMove = option.profiles.shift();
  option.executedProfiles.push(itemToMove);
}

function pageletInit(callback) {
  var pagelet = document.getElementById("pagelet_composer");
  if (pagelet) {
    callback(pagelet);
    return;
  }

  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      for (var i = 0; i < mutation.addedNodes.length; i++) {
        var pagelet = document.getElementById("pagelet_composer");
        if (pagelet) {
          callback(pagelet);
          observer.disconnect();
        }
      }
    });
  });

  observer.observe(document, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false
  });
}

function protectFeatures(settings) {
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      for (var i = 0; i < mutation.addedNodes.length; i++) {
        checkOnMutation(settings);
      }
    });
  });

  observer.observe(document, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false
  });
}

function checkOnMutation(settings) {
  // Make sure if grey that always stays grey
  if (settings.fb_grey) {
    var grey = document.getElementById("nudge-facebook-grey");
    if (!grey) {
      addCSS("nudge-facebook-grey", "css/pages/grey.css");
    }
  }

  // Make sure if hide notifs that they always stay hidden
  if (settings.fb_hide_notifications) {
    var notifications = document.getElementById("nudge-facebook-notifications");
    if (!notifications) {
      addCSS("nudge-facebook-notifications", "css/pages/notifications.css");
    }
  }

  // Make sure pagelet never covered in white without dialog
  var pagelet = document.getElementById("pagelet_composer");
  if (pagelet) {
    var dialog = document.getElementById("nudge-dialog");
    var facebookCss = document.getElementById("nudge-facebook-dialog");
    if (dialog && !facebookCss) {
      addCSS("nudge-facebook-dialog", "css/pages/facebook.css");
    } else if (!dialog && facebookCss) {
      deleteEl(facebookCss);
    }
  }
}
