// SHOW:  automatically unfollow any new friends or pages detected. with the slider button
// doespagelet exist?
// if not, do you offer some other way to unfollow?. and notify the app
// does the request for frienddata work? if not, notify

// Variables

var executeUnfollow = false;
var autoUnfollow = false;
var cancelOperation = false;
var profilesLoaded = false;
var fb_dtsg = "";
var user_id = "";
var currentlyUnfollowing = false;
var domain = "facebook.com";

// Get settings
getSettings(execSettings);

function getFacebookCreds(callback) {
  console.log("here");
  // Get the fb_dtsg token that must be passed to get a successful response to an XMLHttpRequest from Facebook
  try {
    // Get fb_dtsg
    fbTokenReady("fb_dtsg", function(node) {
      fb_dtsg = node.value;
      console.log(fb_dtsg);
      // Get user_id
      if (document.cookie.match(/c_user=(\d+)/)) {
        if (document.cookie.match(/c_user=(\d+)/)[1]) {
          user_id = document.cookie.match(
            document.cookie.match(/c_user=(\d+)/)[1]
          );
          user_id = user_id[0];
          console.log(user_id);
          callback();
        }
      }
    });
  } catch (e) {
    console.log(e);
    // Error catching
  }
}

function getRatio() {
  console.log("hey");
  friendAndPageListGenerator(unfollow, true, function() {
    friendAndPageListGenerator(refollow, true, function() {
      var profilesFollowed =
        unfollow.totalProfiles /
        (unfollow.totalProfiles + refollow.totalProfiles);
      console.log(profilesFollowed);
      changeSettingRequest(profilesFollowed, "fb_profile_ratio");
    });
  });
}

// Execute after getting settings
function execSettings(settings) {
  console.log(settings);
  // Set ratio
  var ratio = settings.fb_profile_ratio;
  // Test different ratio values
  // ratio = 0;
  if (settings.fb_grey) {
    addCSS("nudge-facebook-grey", "css/pages/grey.css");
  }
  if (settings.fb_hide_notifications) {
    addCSS("nudge-facebook-notifications", "css/pages/notifications.css");
  }
  if (settings.fb_auto_unfollow) {
    executeUnfollow = true;
    autoUnfollow = true;
    // set checkbox value
  }
  if (ratio === false) {
    console.log("yes");
    docReady(function() {
      getFacebookCreds(getRatio);
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
    console.log(ratio);
    if (ratio === 0) {
      loadUx("share.html", shareUx);
    }
    if (ratio > 0) {
      loadUx("intro.html", introUx);
      console.log("read");
      docReady(function() {
        getFacebookCreds(function() {
          console.log("next next step");
          friendAndPageListGenerator(unfollow, false, function() {
            executeUnfollow = false;
            if (executeUnfollow) {
              friendAndPageToggler(unfollow);
            }
          });
        });
      });
    }
  }
}

// when running for first time, store time in chrome storage
// every time you go back to fb after, keep running if enough time has elapsed
// randomise number of profiles to unfollow every day. max 100

function introUx(element) {
  var hide = document.querySelector(".fb_show_unfollow");
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
  hide.onclick = function() {
    changeSettingRequest("toggle", hide.id);
    deleteEl(container);
    deleteEl(close);
    styleAdder("#pagelet_composer::before", "{ content: none !important; }");
  };
  var close = document.querySelector(".facebook-close");
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
  var button = document.querySelector(".facebook-button-blue");
  var container = document.querySelector(".facebook-container");
  var text = document.querySelector(".facebook-text");
  button.onclick = function() {
    cancelOperation = true;
    text.innerHTML = "Unfollowing stopped, with X people unfollowed.";
    button.innerHTML = "Resume unfollowing";
    // want to make clear how much time it's going to take
    // feel free to move to another tab. this process will continue
    // container.innerHTML = tempStorage["share_content.html"];
    // shareUx();
  };
}

function shareUx() {
  var container = document.querySelector(".facebook-container");
  var button = document.querySelector(".facebook-button-blue");
  var close = document.querySelector(".facebook-close");
  close.onclick = function() {
    deleteEl(container);
    deleteEl(close);
    styleAdder("#pagelet_composer::before", "{ content: none !important; }");
  };
  var fb_auto_unfollow = document.getElementById("fb_auto_unfollow");
  if (autoUnfollow) {
    fb_auto_unfollow.innerHTML = `Don't auto-unfollow`;
  } else {
  }
  fb_auto_unfollow.onclick = function() {
    if (autoUnfollow) {
      changeSettingRequest(false, "fb_auto_unfollow");
      autoUnfollow = false;
      fb_auto_unfollow.innerHTML = `Auto-unfollow new profiles`;
    } else {
      changeSettingRequest(true, "fb_auto_unfollow");
      autoUnfollow = true;
      fb_auto_unfollow.innerHTML = `Don't auto-unfollow`;
    }
  };
  var link_to_more = document.getElementById("link_to_more");
  link_to_more.onclick = function() {
    container.innerHTML = tempStorage["more_content.html"];
    var back_to_share = document.getElementById("back_to_share");
    back_to_share.onclick = function() {
      container.innerHTML = tempStorage["share_content.html"];
      shareUx();
    };
  };
  // to refollow, go to // want to make clear where you go to refollow
}

// https://developers.facebook.com/docs/plugins/share-button
// https://developers.facebook.com/docs/sharing/reference/share-dialog

function progressLogger(message) {
  function getEl() {
    return document.querySelector("#facebook-specific-progress");
  }
  if (getEl()) {
    getEl().innerHTML = message;
  }
  console.log(message);
}

function headlineLogger(message) {
  function getEl() {
    return document.querySelector("#facebook-text");
  }
  if (getEl()) {
    getEl().innerHTML = message;
  }
  console.log(message);
}

// Get friend and page IDs
function friendAndPageListGenerator(option, oneOff, callback) {
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
          type: data[j].type
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
    progressLogger(`Preparing to unfollow`);
    currentlyUnfollowing = true;
  }
  // Check if there are profiles to toggle
  if (option.profiles.length === 0) {
    progressLogger(`You have no profiles to unfollow`);
    return;
  }
  // Pick the first profile in the array, since if successful, we'll move it from array
  var profile = option.profiles[0];
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
  // Set a 10-second time out
  friendandpage_toggle.timeout = 10000;
  // Set the timeout function - keep going
  friendandpage_toggle.ontimeout = function(e) {
    eventLogSender(domain, "unfollow_timeout", { errorMessage: e });
    friendAndPageToggler(option);
  };
  // Run on successful response to the request
  friendandpage_toggle.onreadystatechange = function() {
    if (friendandpage_toggle.readyState == 4) {
      var data = friendandpage_toggle.responseText;
      data = data.substr(data.indexOf("{"));
      data = JSON.parse(data);
      if (typeof data != "undefined") {
        if (typeof data.error != "undefined") {
          progressLogger(`Something went wrong. Please try again in 24 hours`);
          return;
        }
        // Success happens here
        if (
          typeof data.onload != "undefined" &&
          data.onload[0] === option.verifText.start + id + option.verifText.end
        ) {
          // Increase the count of profiles successfully unfollowed
          option.profileCounter++;
          progressLogger(`Unfollowed ${name}`);
          headlineLogger(
            `${option.profileCounter} of ${
              option.totalProfiles
            } friends, pages, and groups unfollowed`
          );
          var itemToMove = option.profiles.shift();
          option.executedProfiles.push(itemToMove);
          if (
            option.profileCounter < option.profiles.length &&
            !cancelOperation
          ) {
            // Run another iteration after a c.1s delay
            setTimeout(function() {
              friendAndPageToggler(option);
            }, randomTime(1, 0.1));
          }
          if (option.profileCounter === option.profiles.length) {
            setTimeout(function() {
              // All done - send message about it
            }, 2000);
          }
        } else {
          // Major fail - should log it
          console.log(option.messages.fail + name);
          console.log(friendandpage_toggle);
        }
      }
    }
  };
  // Send the request
  friendandpage_toggle.send(params);
}

function checkIfPageletExists(callback) {
  if (observer) {
    observer.disconnect();
  }
  return;
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
  if (settings.fb_grey) {
    var grey = document.getElementById("nudge-facebook-grey");
    if (!grey) {
      addCSS("nudge-facebook-grey", "css/pages/grey.css");
      console.log("regreyed");
    }
  }
  if (settings.fb_hide_notifications) {
    var notifications = document.getElementById("nudge-facebook-notifications");
    if (!notifications) {
      addCSS("nudge-facebook-notifications", "css/pages/notifications.css");
      console.log("reantinotifed");
    }
  }
  // var nudge = document.getElementById()
  // if (settings.fb_hide_notifications) {
  //   var notifications = document.getElementById("nudge-facebook-notifications");
  //   if (!notifications) {
  //     addCSS("nudge-facebook-notifications", "css/pages/notifications.css");
  //   }
  // }
  var pagelet = document.getElementById("pagelet_composer");
  if (pagelet) {
    var dialog = document.getElementById("nudge-dialog");
    var facebookCss = document.getElementById("nudge-facebook-dialog");
    if (dialog && !facebookCss) {
      addCSS("nudge-facebook-dialog", "css/pages/facebook.css");
      console.log("added it");
    } else if (!dialog && facebookCss) {
      console.log("deleted it");
      deleteEl(facebookCss);
    }
  }
}
