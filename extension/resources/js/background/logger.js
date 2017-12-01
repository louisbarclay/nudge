function consoleLogger(domain, eventType, detailsObj, date, time) {
  var enabled = true;
  function logWithColor(message, color) {
    if (enabled) {
      message = `%c${message}`;
      color = `color:${color};`;
      console.log(message, color);
    }
  }
  switch (eventType) {
    case "visit":
      logWithColor(
        `${detailsObj.startTime} ${detailsObj.endTime} ${domain} ${
          detailsObj.duration
        } (${detailsObj.totalTimeToday} today). Source: ${detailsObj.source}`,
        "green"
      );
      break;
    case "shutdown":
      logWithColor(`${time} ${domain} shutdown`, "red");
      break;
    case "startup":
      logWithColor(`${time} startup`, "blue");
      break;
    case "install":
      logWithColor(`${time} install`, "orange");
      break;
    case "update":
      logWithColor(
        `${time} update ${detailsObj.previousVersion} ${
          detailsObj.thisVersion
        }`,
        "yellow"
      );
    case "visitStart":
      logWithColor(
        `${time} new Visit ${domain} no.${detailsObj.totalVisits}. Source: ${
          detailsObj.source
        }`,
        "brown"
      );
      break;
    default:
  }
}

// Nudge logger function
function nudgeLogger(nudgeObject) {
  // Nudges get recorded in the 'nudges' object within each date
  // Also, 'lastNudged' gets recorded in the status object
  var date = todayDate();
  var time = timeNow();
  var statusObj = open("status");
  var dateObj = open(date);
  dateObj = dataAdder(dateObj, "nudges", nudgeObject, time);
  statusObj = dataAdder(statusObj, nudgeObject.domain, time, "lastNudged");
  close("status", statusObj);
  close(date, dateObj);
}

function eventLogReceiver(request) {
  eventLog(
    request.domain,
    request.eventType,
    request.detailsObj,
    request.date,
    request.time
  );
}

function eventLog(domain, eventType, detailsObj, date, time) {
  // Define event
  var event = {
    domain,
    eventType
  };
  if (detailsObj) {
    Object.keys(detailsObj).forEach(function(key) {
      event[key] = detailsObj[key];
    });
  }
  // Define date and time
  if (!date && !time) {
    date = todayDate();
    time = timeNow();
  }
  time = epochToDate(time);
  consoleLogger(domain, eventType, detailsObj, date, time);
  // should match up perfectly
  if (eventType != "visitStart") {
    var dateObj = open(date);
    dateObj = dataAdder(dateObj, "events", event, time);
    close(date, dateObj);
  }
}
