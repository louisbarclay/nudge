// // what is my domain?

// // how much time have i spent on it today? live updates please

// // can i please stop this site from being a nudge site?

// // can i please undo that change? i.e. toggle?

// // can i please have a link to options? surely that's easy

// var optionsLink = document.getElementById("options");

// console.log(optionsLink);

// optionsLink.onclick = function() {
//   chrome.runtime.sendMessage({
//     type: "options"
//   });
// };

// var timeToday = document.querySelector(".thing");

// var query = { active: true, currentWindow: true };

// chrome.tabs.query(query, callback);

// function callback(tabs) {
//   var currentTab = tabs[0]; // there will be only one in this array
//   console.log(currentTab); // also has properties like currentTab.id
//   document.querySelector(".domain").innerHTML = extractDomain(currentTab.url);
// }

// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//   if (request.type === "live_update") {
//     console.log(
//       request.domain +
//         " | Now: " +
//         logMinutes(request.runningCounter) +
//         " | Total: " +
//         logMinutes(request.total) +
//         " | Before: " +
//         logMinutes(request.before / 1000) +
//         " | Visits: " +
//         request.visits +
//         " | Time per visit: " +
//         logMinutes(request.total / request.visits)
//     );
//     timeToday.innerHTML = logMinutes(request.total);
//     document.querySelector(".domain").innerHTML = request.domain;
//   }
// });
