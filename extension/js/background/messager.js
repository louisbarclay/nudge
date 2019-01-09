// // Send message to player.js
// function nudgeSender(object) {
//   // See if nudges are switched off
//   if (object.type === "compulsive" && !settingsLocal.compulsive_nudge) {
//     console.log("blocked compulsive nudge");
//     return;
//   }
//   if (object.type === "time" && !settingsLocal.time_nudge) {
//     console.log("blocked time nudge");
//     return;
//   }
//   // TODO: insert scroll nudge here
//   // See if you are not in Chrome or tab idle, in which case don't send nudge
//   var currentState = checkCurrentState();
//   if (
//     currentState.domain === notInChrome ||
//     currentState.domain === chromeOrTabIdle
//   ) {
//     return;
//   } else {
//     chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(
//       tabs
//     ) {
//       // Send message to the tab here
//       // Ask if the tab is ready to nudge
//       if (tabs[0] && tabs[0].id) {
//         chrome.tabs.sendMessage(tabs[0].id, { type: "ready_check" }, function(
//           response
//         ) {
//           // console.log(response);
//           if (response && response.type) {
//             chrome.tabs.sendMessage(tabs[0].id, object, function(response) {
//               if (response) {
//                 object.time_executed = response.time_executed;
//                 object.status = response.status;
//                 object.tabId = tabs[0].id;
//                 nudgeLogger(object);
//               } else if (object.send_fails < sendFailLimit) {
//                 object.send_fails++;
//                 nudgeSender(object);
//               } else {
//                 object.status = "failed";
//                 nudgeLogger(object);
//               }
//             });
//           } else {
//             // If tab record is undefined, create it
//             tabIdStorage[tabs[0].id].nudge = object;
//             object.send_fails++;
//             if (object.send_fails > 3) {
//               tabIdStorage[tabs[0].id].nudge = false;
//               console.log("Abort");
//             }
//             // so...... load the tab ID with the nudge to come (the whole object!)
//             // then the every-seconder asks the current selected tab if there is a nudge waiting, in which case it messageSends
//           }
//         });
//       }
//     });
//   }
// }

// URL receiver from content script and init options giver
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // Avoid sending a message to a tab that is part of the extension
  var chromeTab = sender.tab.url.includes("chrome-extension:");
  // Get settings
  if (request.type === "settings") {
    sendResponse({ settings: settingsLocal });
  }
  if (request.type === "get_localStorage") {
    sendResponse({ localStorage, settingsLocal });
  }
  if (request.type === "change_setting") {
    changeSetting(
      request.newVal,
      request.setting,
      request.domain,
      request.domainSetting,
      sender.tab.id
    );
  }
  if (request.type === "event") {
    eventLogReceiver(request);
  }
  if (request.type === "off") {
    if (inDomainsSetting(sender.url)) {
      changeSetting(true, "domains", request.domain, "off");
      switchOff(request.domain, sender.url, sender.tabId, "normal");
    }
  }
  if (request.type === "on") {
    if (request.domain) {
      var url = request.url;
      console.log(url);
      changeSetting(false, "domains", request.domain, "off");
      switchOn(request.domain, request.url, sender.tabId);
    }
    // Register a new switch on
    var date = moment().format("YYYY-MM-DD");
    var dateObj = open(date);
    if (isUndefined(dateObj.switch_ons)) {
      dateObj.switch_ons = 1;
    } else {
      dateObj.switch_ons++;
    }
    close(date, dateObj, "close date in messager");
  }
  if (
    request.type === "scroll" ||
    request.type === "visit" ||
    request.type === "compulsive" ||
    request.type === "time"
  ) {
    // nudgeSender(request);
  }
  if (request.type === "options") {
    chrome.runtime.openOptionsPage();
  }
  if (request.type === "close_one") {
    chrome.tabs.remove(sender.tab.id);
  }
  if (request.type === "close_all") {
    closeAll(request.domain);
  }
  if (request.type === "inject_tabidler" && !chromeTab) {
    try {
      chrome.tabs.get(sender.tab.id, checkIfExists);
    } catch (e) {
      console.log(e);
    }
    function checkIfExists() {
      try {
        if (chrome.runtime.lastError) {
          // Tab doesn't exist
          console.log(chrome.runtime.lastError.message);
        } else {
          // Tab exists
          try {
            chrome.tabs.executeScript(sender.tab.id, {
              file: "js/tabidler.js"
            });
            sendResponse({ message: "tab idler injected" });
          } catch (e) {
            console.log(e);
          }
        }
      } catch (e) {
        console.log(e);
      }
    }
  }
  if (request.type === "tabIdle") {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(
      tabs
    ) {
      if (typeof tabs[0] != "undefined" && tabs[0].id === sender.tab.id) {
        var domain = inDomainsSetting(sender.url);
        onTabIdle(request.status, domain);
      }
    });
  }
});
