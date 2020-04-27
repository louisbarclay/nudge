var CONSOLE_LOG = true
var AMPLITUDE_LOG = true

function consoleLogger(eventType, detailsObj, time) {
  function logWithColor(message, color) {
    if (CONSOLE_LOG) {
      message = `%c${message}`
      color = `color:${color};`
      log(message, color)
    }
  }
  switch (eventType) {
    case "visit":
      logWithColor(
        `${moment(detailsObj.time).format(
          "HH:mm:ss"
        )} ${detailsObj.startTime.format(
          "HH:mm:ss"
        )} ${detailsObj.endTime.format("HH:mm:ss")} ${
          detailsObj.domain
        } ${logMinutes(detailsObj.duration / 1000)} (${logMinutes(
          detailsObj.totalTimeToday / 1000
        )} today). Source (linked to next visit's domain): ${
          detailsObj.source
        }. Shutdown: ${detailsObj.shutdown}. Off: ${detailsObj.offDomain}`,
        "green"
      )
      break
    case "leftChrome":
      logWithColor(
        `${moment(detailsObj.time).format("HH:mm:ss")} Left Chrome ${
          detailsObj.domain
        } Source: ${detailsObj.source}`,
        "darkmagenta"
      )
      break
    case "shutdown":
      logWithColor(
        `${moment(detailsObj.time).format("HH:mm:ss")} ${
          detailsObj.domain
        } shutdown`,
        "red"
      )
      break
    case "startup":
      logWithColor(
        `${moment(detailsObj.time).format("HH:mm:ss")} startup`,
        "blue"
      )
      break
    case "install":
      logWithColor(
        `${moment(detailsObj.time).format("HH:mm:ss")} install`,
        "orange"
      )
      break
    case "update":
      logWithColor(
        `${moment(detailsObj.time).format("HH:mm:ss")} update ${
          detailsObj.previousVersion
        } ${detailsObj.thisVersion}`,
        "yellow"
      )
      break
    case "changeSetting":
      logWithColor(
        `${moment(detailsObj.time).format("HH:mm:ss")} ${eventType} ${
          detailsObj.setting
        } ${JSON.stringify(detailsObj.newVal)}`,
        "magenta"
      )
      break
    default:
      logWithColor(
        `${moment(detailsObj.time).format(
          "HH:mm:ss"
        )} ${eventType} ${JSON.stringify(detailsObj)}`,
        "pink"
      )
  }
}

// This takes event logs from elsewhere
function eventLogReceiver(request) {
  eventLog(request.eventType, request.detailsObj)
}

// Log event
function eventLog(eventType, detailsObj) {
  // Define date and time as a string
  let time = moment().format()
  // Log the event to console
  consoleLogger(eventType, detailsObj, time)
  // Filter events to log to Amplitude
  if (amplitudeLoggerFilter(settingsLocal, eventType, detailsObj)) {
    amplitudeLogger(eventType, detailsObj, time)
  }
}

// Utils
function amplitudeLogger(eventType, detailsObj, time) {
  amplitude.getInstance().logEvent(eventType, { time, ...detailsObj })
}

function amplitudeLoggerFilter(settings, eventType, detailsObj) {
  if (AMPLITUDE_LOG) {
    if (settings.share_data) {
      // If it's a visit, and it's not a Nudge domain, off page, or Nudge page, don't send
      if (
        eventType === "visit" &&
        detailsObj.domain &&
        !isNudgeDomain(detailsObj.domain) &&
        !detailsObj.domain.includes(offPage) &&
        !detailsObj.domain.includes(nudgePage)
      ) {
        return false
      }
      // If it's a daily_goal setting, only log it once a day
      if (
        eventType === "changeSetting" &&
        detailsObj.setting === "daily_goal"
      ) {
        if (detailsObj.newVal && detailsObj.newVal === "updatedDailyGoal") {
          return false
        }
      }
      return true
    }
    // If share_data is off but it's a change of setting and it's for the share_data setting, send
    if (!settings.share_data) {
      if (
        eventType === "changeSetting" &&
        detailsObj.setting === "share_data" &&
        detailsObj.previousVal
      ) {
        return true
      }
    }
  }
}
