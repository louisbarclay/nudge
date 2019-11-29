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
        } ${JSON.stringify(detailsObj.newVal)} ${JSON.stringify(
          detailsObj.domainSetting
        )}`,
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

function eventLogReceiver(request) {
  eventLog(request.eventType, request.detailsObj, request.time)
}

function eventLog(eventType, detailsObj, time) {
  // Define date and time
  if (!time) {
    time = moment()
  }
  // Log the event
  consoleLogger(eventType, detailsObj, time)

  // Send the event to Amplitude only if user is not opted out
  if (settingsLocal.share_data && AMPLITUDE_LOG) {
    // Send event
    amplitude.getInstance().logEvent(eventType, { time, ...detailsObj })
  }

  // One special case - send an event for the user switching off share_data
  // So we can understand why a user's data is no longer showing
  if (!settingsLocal.share_data && AMPLITUDE_LOG) {
    if (
      eventType === "changeSetting" &&
      detailsObj.setting === "share_data" &&
      detailsObj.previousVal
    ) {
      amplitude.getInstance().logEvent(eventType, { time, ...detailsObj })
    }
  }
}
