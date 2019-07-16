var dateCheck = new RegExp("[0-9]{4}-[0-9]{2}-[0-9]{2}");

function hms(hms) {
  var a = hms.split(":"); // split it at the colons
  // minutes are worth 60 seconds. Hours are worth 60 minutes.
  var seconds = +a[0] * 60 * 60 + +a[1] * 60 + +a[2];
  return seconds;
}

function getLocalStorage() {
  chrome.runtime.sendMessage({ type: "get_localStorage" }, function(response) {
    var localStorage = response.localStorage;
    var date = false;
    Object.keys(localStorage).forEach(function(key) {
      if (dateCheck.test(key)) {
        date = JSON.parse(localStorage[key]);
      }
    });

    var events = date.events;

    console.log(events);

    var testDataObject = {};

    Object.keys(events).forEach(event => {
      if (events[event].eventType === "visit") {
        console.log(events[event]);
        if (events[event].domain && events[event].domain in testDataObject) {
          testDataObject[
            {
              starting_time: hms(events[event].startTime),
              ending_time: hms(events[event].endTime)
            }
          ];
        } else {
          console.log(testDataObject);
          testDataObject[events[event].domain] = [];
          testDataObject[events[event].domain].push({
            starting_time: hms(events[event].startTime),
            ending_time: hms(events[event].endTime)
          });
        }
      }
    });

    console.log(testDataObject);

    var chart = d3.timelines();

    var svg = d3
      .select("#timeline1")
      .append("svg")
      .attr("width", 500)
      .datum(testDataObject)
      .call(chart);
  });
}
getLocalStorage();

var colours = ["green", "blue", "red", "orange"];

/*Get events from localStorage
  So what I do here is pass a callback to getLocalStorage in order to
  return events as when trying to return the conventional way, events
  wasn't defined - I probably missed an obvious way to make it work but anyhow 
  I went to stackoverflow for a solution and saw this in an already answered quesiton 
  --- Reasoning copied from stackoverflow: ---
  This is impossible as you cannot return from an asynchronous call inside 
  a synchronous method. In this case you need to pass a callback 
  to foo that will receive the return value The thing is, if an 
  inner function call is asynchronous, then all the functions 
  'wrapping' this call must also be asynchronous 
  in order to 'return' a response. */

// function getLocalStorage(fn) {
//   chrome.runtime.sendMessage({ type: "get_localStorage" }, function (response) {
//     var localStorage = response.localStorage;
//     var date = false;
//     Object.keys(localStorage).forEach(function (key) {
//       if (dateCheck.test(key)) {
//         date = JSON.parse(localStorage[key]);
//         events = date['events'];
//       }
//       return events;
//     });
//     if (events) {
//       Object.keys(events).forEach(function (key) {
//         if (key.indexOf('visit') > -1) {
//           var inDomain = events[key].domain;
//           if (domains.indexOf(inDomain) > -1) {
//             // For each event, if the event type is a visit and the domain for that visit event is indeed a nudge site
//             // push it to the array I use for accessing
//             arrayForObjLogging.push(key);
//           }
//         }
//       })
//     }
//     fn(events);
//   });
// }
// // So yeah, here I call getLocalStorage with the previously
// // discussed callback function, and this contains everything.
// getLocalStorage(function (events) {
//   // If arrayForObjLogging exists -
//   if (arrayForObjLogging || arrayForObjLogging.length > 0) {
//     // While i is less than arrayForObjLoggins length
//     for (var i = 0; i < arrayForObjLogging.length; i++) {
//       // Get the gmt+ time
//       var timeZone = arrayForObjLogging[i].slice(arrayForObjLogging[i].indexOf("GMT") + 3, arrayForObjLogging[i].indexOf("GMT") + 8)
//       /*    arrayForObjLogging looks something like this:
//             0: "Fri Feb 08 2019 11:25:26 GMT+0200 visit"
//             1: "Fri Feb 08 2019 11:25:35 GMT+0200 visit"
//             I then use that in the events object as events looks
//             something like this
//             Fri Feb 08 2019 11:22:48 GMT+0200 visit: {domain: false, eventType: "visit", startTime: "11:22:42", endTime: "11:22:48", duration: "0m06s", …}
//             So basically its events[Fri Feb 08 2019 11:22:48 GMT+0200 visit]
//             To easily further get access to the starting time, end time and domain */
//       var eventsObj = events[arrayForObjLogging[i]];
//       /*    Now eventsObj looks something like this:
//             Object
//               allDomainsDiff: (2) [163530, 163530]
//               domain: "youtube.com"
//               duration: "0m08s"
//               endTime: "11:25:26"
//               eventType: "visit"
//               source: "tabs.onActivated"
//               startTime: "11:25:18"
//               totalTimeToday: "0m08s" */
//       // I now log all that data in vars
//       var domain = eventsObj['domain'];
//       var startTime = eventsObj['startTime'];
//       var endTime = eventsObj['endTime'];
//       // Here comes the part where I should've used moment
//       // So again the array I'm getting the data from
//       // looks something like this:
//       // 0: "Fri Feb 08 2019 11:25:26 GMT+0200 visit"
//       var year = arrayForObjLogging[i][11] +
//         arrayForObjLogging[i][12] + arrayForObjLogging[i][13]
//         + arrayForObjLogging[i][14];
//       var month = arrayForObjLogging[i][4] +
//         arrayForObjLogging[i][5] + arrayForObjLogging[i][6];
//       var makingUTCMonths = ['Jan', 'Feb', 'Mar', 'Apr',
//         'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Nov', 'Dec']
//       // The Date.UTC works with number strings not actual months
//       // so I convert it to numbers below
//       for (var k = 0; k < 11; k++) {
//         if (makingUTCMonths[k].indexOf(month) > -1) {
//           var monthInUTC = '0' + k;
//         }
//       }
//       var date = arrayForObjLogging[i][8] + arrayForObjLogging[i][9];
//       var startHours = startTime[0] + startTime[1];
//       var startMinutes = startTime[3] + startTime[4];
//       var startSeconds = startTime[6] + startTime[7];
//       var endHours = endTime[0] + endTime[1];
//       var endMinutes = endTime[3] + endTime[4];
//       var endSeconds = endTime[6] + endTime[7];

//       // Convert it all to ms

//       var startTimeInUTCDate = Date.UTC(year, monthInUTC, date,
//         startHours, startMinutes, startSeconds);

//       var endTimeInUTCDate = Date.UTC(year, monthInUTC, date,
//         endHours, endMinutes, endSeconds);

//       // Start and end of day I use for chart displaying purposes,
//       // explanation below

//       var startOfDay = Date.UTC(year, monthInUTC, date,
//         "00", "00", "00");

//       var endOfDay = Date.UTC(year, monthInUTC, date,
//         "24", "00", "00");

//       // Push the starting and ending times to the domainTime 2d array
//       // Which I use below

//       for (var j = 0; j < domainTime.length; j++) {
//         if (domainTime[j].indexOf(domain) > -1) {
//           domainTime[j].push(startTimeInUTCDate,
//             endTimeInUTCDate);
//         }
//       }
//     }
//   }
//   // To avoid error - check if timezone is not null
//   if (timeZone) {
//     // timeZone looks like this (for me) 0200, if it's gmt +3 it would be 0300 etc.
//     // Here I convert the timezone to milliseconds - I then go on to minus it from the starting
//     // and ending times - that is if it's a positive gmt, if it's gmt -2 for example, I add it
//     var gmtHour = timeZone[1] + timeZone[2];
//     var gmtMinute = timeZone[3] + timeZone[4];
//     var gmtInms = (gmtHour * 3600000) + (gmtMinute * 120000)
//     // Check to see if it's a negative gmt, I then make gmtInms negative
//     // and am able to add it as it becomes a double negative e.g: startOfDay-(-gmtInms)
//     if (timeZone[0] === "-") {
//       gmtInms = -gmtInms
//     }
//     /*    Keep in mind a dataset for the chart looks something like this:
//           var testData = [
//           {label: "person a", times: [
//               {"starting_time": 1355752800000, "ending_time": 1355759900000},
//               {"starting_time": 1355767900000, "ending_time": 1355774400000}]},
//           {label: "person b", times: [
//               {"starting_time": 1355759910000, "ending_time": 1355761900000}]},
//           {label: "person c", times: [
//               {"starting_time": 1355761910000, "ending_time": 1355763910000}]}
//           ]; */
//     // So this is the explanation for start and end of day
//     // So below I use as the 1st entry in the timeline to get the time to go from 12am-12am, and then I hide
//     // the timeline a bit later, I could not find another way to do it, it works but it's not good practice.
//     var chartData = [
//       {
//         times: [
//           { "color": "rgba(255, 0, 0, 0)", "starting_time": startOfDay - gmtInms, "ending_time": endOfDay - gmtInms }],
//       },
//     ]
//     // I make z 1 as chartData[0] would be equal to the above, and I want to just leave that alone.
//     var z = 1;
//     // This part may be a little confusing
//     // I then loop around the 2D array
//     for (var a = 0; a < domainTime.length; a++) {
//       // This means if there has actually been a visit to the domain, as without a visit its length would be
//       // 1 as it contains only the domain
//       if ((domainTime[a].length > 1)) {
//         // Keep in mind domainTime looks something like this:
//         /*         Array(5)
//                   0: "youtube.com"
//                   1: 1549625118000
//                   2: 1549625126000
//                   3: 1549630443000
//                   4: 1549630458000
//                   length: 5 */
//         // I use ab, bc and v in the loop below
//         var ab = 1;
//         var bc = 2;
//         var v = 0;
//         // With the options.js favicon fetching method this should not be necessary
//         // you cannot name files with a "/" so I had to improvise
//         if (domainTime[a][0] === "bbc.co.uk/news") {
//           domainTime[a][0] = "bbc.co.uk";
//         }
//         // So here I push the icon along with an empty times array
//         chartData.push({
//           icon: `../../img/favicon2/${domainTime[a][0]}.png`, times: []
//         })
//         // I then push the actual starting and ending times into the
//         // empty times array declared above, below. That way the correct domain has
//         // the correct time
//         // I dont't actually use p but it does stop the loop when there are no times left
//         // Which is perfect, I do p < (domainTime[a].length -1 as domainTime is a 2d array, but it's first
//         // element I'm not particularly interested in (the domain), so I -1 it to negate the length added by the first
//         // element
//         // I also p+=2 as it's a 2d array and I use 2 times in a single loop,
//         // so doing ++ would make the loop go on when there's no actual data left
//         for (var p = 0; p < (domainTime[a].length - 1); p += 2) {
//           var c = 0;
//           if (v > (colours.length - 1)) {
//             v = 0;
//           }
//           // Notice it's domainTime[a], and a only gets incremented at the every end of the first loop, this way
//           // it pushes all the data to the array above, and it gets the correct colour and time added.
//           chartData[z]["times"].push({
//             "color": colours[v],
//             "starting_time": domainTime[a][ab] - gmtInms,
//             "ending_time": domainTime[a][bc] - gmtInms,
//           });
//           // ab and bc I also +=2 for obvious reasons
//           // as starting time would be [1],[3],[5] and ending time would be [2],[4],[6] etc.
//           ab += 2;
//           bc += 2;
//           v++;
//           c++;
//         }
//         // z incremented, now pushes the next set of colour and times on the same domain
//         z++;
//       }
//     }
//     // Static width of the timeline, can and should probably be changed to be dynamic
//     var width = 900;
//     var rectArr = [];
//     var chart = d3.timelines()
//       // Format is in hours so it's 12 AM - 12 AM
//       .tickFormat({
//         format: d3.timeFormat("%I%p"),
//         tickTime: d3.timeHour,
//         tickInterval: 1,
//         tickSize: 15,
//         tickValues: null
//       })
//       .stack()
//       // The background color of the timeline
//       // This is the blue colour that is sometimes darker
//       // 0.2 is obviously the opacity
//       // I'm not great with styling, maybe that's the issue
//       // Apologize if it's blatantly obvious what's causing it to happen.
//       .background("rgba(28, 80, 134, 0.2)")
//     // This calls the actual chart
//     var svg = d3.select("#timeline1").append("svg").attr("width", width)
//       .datum(chartData).call(chart);
//     // This is where I manipulate the dom to hide the background of the 1st timeline
//     // that makes it show 12 AM - 12 AM
//     // as well as making all the timelines at least 1px, for displaying and hover functionality purposes
//     var b = 0;
//     // I use rectCount specifically if there's a background (fill) styling in thetimeline, if there is
//     // I hide the 1st timeline that does the 12 AM - 12 AM thing.
//     // It's 0 index, so I -1
//     var rectCount = document.getElementsByClassName("row-green-bar").length - 1;
//     // This is for loops to get the length of the rect elements
//     var fullRectCount = document.getElementsByClassName("view")[0].getElementsByTagName("rect").length;
//     // Sets the height of the svg element to not be too much or little
//     // based on the amount of data in the chart
//     var svgHeight = document.getElementsByTagName("svg")[0];
//     // 7 is slightly arbitrary with some reasoning but may not be the best number
//     // and could be changed
//     svgHeight.height.baseVal.value = (fullRectCount - 1) * 7
//     // if the .background() method is called in the timeline
//     if (document.getElementsByTagName("rect")[0].attributes["fill"]) {
//       // when the .background() method is present, the last
//       // "row-green-bar" class is the 12 AM - 12 AM one that we don't want to see
//       // so I set it's width value to 0;
//       document.getElementsByClassName("row-green-bar")[rectCount].width.baseVal.value = 0;
//       document.getElementsByClassName("row-green-bar")[rectCount].height.baseVal.value = 0;
//       // I do this as the background color is now hidden, but there is still a rect element
//       // with normal width and height, which is not good, especially if we want to use hover
//       // so set it to 0
//       document.getElementById("timelineItem_0_0").width.baseVal.value = 0;
//       document.getElementById("timelineItem_0_0").height.baseVal.value = 0;
//       for (var d = 1; d < fullRectCount - 1; d++) {
//         // loop through all the rect elements, we make d = 1 as timeline_0 is the 12AM - 12AM one and we don't want anything from it
//         if (document.getElementById(`timelineItem_${d}_${0}`) === null) {
//           // If there are no longer any rect elements left to loop through
//           // break
//           break;
//         }
//         else {
//           b = 0;
//           while (document.getElementsByClassName(`timelineSeries_${d}`)[b] !== undefined) {
//             if (document.getElementsByClassName(`timelineSeries_${d}`)[b].width.baseVal.value < 1) {
//               document.getElementsByClassName(`timelineSeries_${d}`)[b].width.baseVal.value = 1;
//             }
//             b++;
//           }
//         }
//       }
//     }
//     else {
//       // Largely a repeat from above, but without taking care of the .background() method stuff
//       // if there isn't a .background() method called, only necessary to hide the rect element
//       // Copy pasting some comments for same lines
//       document.getElementById("timelineItem_0_0").width.baseVal.value = 0;
//       document.getElementById("timelineItem_0_0").height.baseVal.value = 0;
//       // loop through all the rect elements, we make g = 1 as timeline_0 is the 12AM - 12AM one and we don't want anything from it
//       for (var g = 1; g < fullRectCount - 1; g++) {
//         // If there are no longer any rect elements left to loop through
//         // break
//         if (document.getElementById(`timelineItem_${g}_${0}`) === null) {
//           break;
//         }
//         else {
//           b = 0;
//           // while e.g document.getElementsByClassName(`timelineSeries_${1}`)[0] is not undefined
//           // A.K.A if there are no more timelines left in that specific series
//           // go to next timelineSeries (loop)
//           while (document.getElementsByClassName(`timelineSeries_${g}`)[b] !== undefined) {
//             // if the width of a specific subseries of data is < 1
//             if (document.getElementsByClassName(`timelineSeries_${g}`)[b].width.baseVal.value < 1) {
//               // make it 1.
//               document.getElementsByClassName(`timelineSeries_${g}`)[b].width.baseVal.value = 1;
//             }
//             b++;
//           }
//         }
//       }
//     }
//   }
//   else {
//     // If timezone is null - display a "helpful" message for user
//     document.body.textContent = "No events logged for today"
//   }
// });
