// Init options
function createSettings() {
  // Add static stuff
  var settings = defaultSettings
  // Create new user ID
  settings.userId = getUserId()
  // Mark as dev if dev
  if (config.dev) {
    settings.dev = true
  }
  return settings
}

async function changeSetting(newVal, setting) {
  try {
    // Set up Amplitude identify
    let identify = new amplitude.Identify()
    // For event logging
    let previousVal = settingsLocal[setting]

    // Set new value
    settingsLocal[setting] = newVal
    // Update syncStorage with new settings
    storageSet({ settings: settingsLocal })
    // Set Amplitude identify
    identify.set(`${setting}`, settingsLocal[setting])

    // Only share data if the user is sharing data
    if (settingsLocal.share_data) {
      if (setting === "share_data") {
        // If the setting that's just been changed is share_data, initialise Amplitude first
        // And then flush all settings to Amplitude
        await initAmplitude(settingsLocal.userId)
        sendAllSettingsToAmplitude(settingsLocal)
      } else {
        // Otherwise, set just the one setting
        amplitude.getInstance().identify(identify)
      }
    }
    // Otherwise, only send the setting update to notify that share_data is now off
    if (!settingsLocal.share_data) {
      if (setting === "share_data") {
        amplitude.getInstance().identify(identify)
      }
    }

    // Now that you've set the settings, convert newVal and previousVal for arrays, and for daily_goal
    const cleanedVals = cleanVals({ newVal, previousVal }, setting)
    newVal = cleanedVals.newVal
    previousVal = cleanedVals.previousVal

    // Log the change of setting
    eventLog("changeSetting", {
      newVal,
      previousVal,
      setting,
    })
  } catch (e) {
    log(e)
  }
}

function cleanVals(valObject, setting) {
  if (Array.isArray(valObject.newVal) && Array.isArray(valObject.previousVal)) {
    if (valObject.newVal.length > valObject.previousVal.length) {
      let difference = valObject.newVal.filter(
        (newValValue) => !valObject.previousVal.includes(newValValue)
      )
      valObject.newVal = difference
      valObject.previousVal = []
      return valObject
    } else {
      let difference = valObject.previousVal.filter(
        (previousValValue) => !valObject.newVal.includes(previousValValue)
      )
      valObject.previousVal = difference
      valObject.newVal = []
      return valObject
    }
  }
  if (setting === "daily_goal") {
    const today = moment().format("YYYY-MM-DD")
    if (
      valObject.previousVal &&
      valObject.previousVal.substring(0, 10) === today
    ) {
      valObject.newVal = "updatedDailyGoal"
      valObject.previousVal = "previousDailyGoal"
    } else {
      valObject.newVal = "newDailyGoal"
      valObject.previousVal = "previousDailyGoal"
    }
    return valObject
  }
  return valObject
}
