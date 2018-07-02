// sendHTMLRequest(getUrl("html/injected/nudge/time.html"), storeForUse);
// sendHTMLRequest(getUrl("html/injected/nudge/compulsive.html"), storeForUse);

// doAtEarliest(function() {
//   // addCSS("nudges", "css/injected/nudges.css");
//   // FIXME: weird case here with messenger.com. See Nudge text before whole page load. Affects compulsives
// });

// // Wait for favicon to come from message
// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//   var alreadyNudged = document.getElementById("nudge");
//   if (!alreadyNudged) {
//     if (request.type === "time") {
//       // // console.log("TIME NUDGE", request);
//       // createTimeNudge(request.amount, request.domain);
//       // sendResponse({ time_executed: moment(), status: "succeeded" });
//     }
//     if (request.type === "compulsive") {
//       // // console.log("COMPULSIVE NUDGE", request);
//       // createCompulsiveNudge(request.amount, request.domain);
//       // sendResponse({ time_executed: moment(), status: "succeeded" });
//     }
//   }
//   if (request.type === "ready_check") {
//     // console.log(request.type);
//     sendResponse({ type: "ready" });
//   }
// });

// function setFavicon(callback) {
//   var favicon = document.getElementById("nudge-favicon");
//   if (favicon)
//     favicon.style.background = `url(${
//       tempStorage.faviconUrl
//     }) center center/32px no-repeat`;
//   if (callback) {
//     callback();
//   }
//   if (!el("nudge")) {
//     cancelRepeatSetFavicon();
//   }
// }

// // var repeatSetFavicon;

// function keepUpdatingFavicon() {
//   repeatSetFavicon = setInterval(function() {
//     setFavicon();
//   }, 200);
// }

// function cancelRepeatSetFavicon() {
//   clearInterval(repeatSetFavicon);
// }

// function createTimeNudge(time, domain) {
//   docReady(function() {
//     var n = createEl(document.body, "div", "nudge");
//     n.innerHTML = tempStorage["time.html"];
//     // Wait for favicon to exist before fading in
//     setFavicon(function() {
//       var c = el("nudge-container");
//       // Fade in when all elements ready
//       docReady(function() {
//         toggleClass(c, "nudge-intro");
//         // Update time
//         var nt = el("nudge-time");
//         nt.innerHTML = logMinutes(time);
//         function increaseTime() {
//           time++;
//           nt.innerHTML = logMinutes(time);
//         }
//         setInterval(increaseTime, 1000);
//         // Setup
//         genericSetup(domain);
//       });
//     });
//   });
// }

// // // Test it
// // docReady(function() {
// //   createTimeNudge(1000, "facebook.com");
// // });

// function createCompulsiveNudge(time, domain) {
//   docReady(function() {
//     // console.log("created nudge");
//     // addCSS("nudge-compulsive", "css/pages/compulsive.css");
//     var n = createEl(document.body, "div", "nudge");
//     n.innerHTML = tempStorage["compulsive.html"];
//     // Wait for favicon to exist before fading in
//     setFavicon(function() {
//       var c = el("nudge-container");
//       // Fade in when all elements ready
//       docReady(function() {
//         toggleClass(c, "nudge-intro");
//         // Set time
//         var nt = el("nudge-time");
//         var interval = moment().diff(time, "seconds");
//         var humanise = moment.duration(interval, "seconds").humanize();
//         nt.innerHTML = humanise;
//         // Setup
//         genericSetup(domain);
//       });
//     });
//   });
// }

// function genericSetup(domain) {
//   // Set up autoclose TODO: could be better
//   autoClose();
//   // FIXME: Shitty favicon updater
//   keepUpdatingFavicon();
//   // Set up domain text
//   var domainText = el("nudge-domain");
//   var domainText2 = el("nudge-domain2");
//   domainText.innerHTML = domain;
//   domainText2.innerHTML = domain;
//   // Set up options
//   var o = el("nudge-options");
//   // Set up options click
//   o.onclick = function() {
//     sendMessage("options", {});
//   };
//   // Close all
//   var ca = el("close-all");
//   ca.onclick = function() {
//     closeAll(domain);
//   };
//   // Don't nudge
//   var dn = el("dont-nudge");
//   dontNudge(dn, domain);
//   // Close on click
//   var cb = el("close-button");
//   cb.onclick = function() {
//     closeNudge();
//   };
// }

// function closeNudge() {
//   var c = el("nudge-container");
//   if (c) {
//     toggleClass(el("nudge-container"), "nudge-outro");
//   }
//   setTimeout(deleteNudge, 1000);
// }

// function deleteNudge() {
//   n = el("nudge");
//   if (n) {
//     deleteEl(n);
//   }
// }

// // Auto close can be better, using numbers and arrays instead of true false
// function autoClose() {
//   var c = el("nudge-container");
//   var initialLeave = true;
//   var leave = true;
//   c.onmouseenter = function() {
//     initialLeave = false;
//     leave = false;
//   };
//   c.onmouseleave = function() {
//     leave = true;
//     setTimeout(endClose, 4000);
//   };
//   function initialClose() {
//     if (initialLeave) {
//       closeNudge();
//     }
//   }
//   function endClose() {
//     if (leave) {
//       closeNudge();
//     }
//   }
//   setTimeout(initialClose, 8000);
// }

// function closeAll(domain) {
//   sendMessage("close_all", { domain });
// }

// function dontNudge(element, domain) {
//   var fp = el("first-part");
//   // console.log("prepped");
//   function domainOff() {
//     changeSettingRequest(false, "domains", domain, "nudge");
//     fp.innerHTML = "Won't nudge ";
//     element.onclick = function() {
//       domainOn();
//     };
//   }
//   function domainOn() {
//     changeSettingRequest(true, "domains", domain, "nudge");
//     fp.innerHTML = "Don't nudge ";
//     element.onclick = function() {
//       domainOff();
//     };
//   }
//   element.onclick = function() {
//     // console.log("clicked");
//     domainOff();
//   };
// }
