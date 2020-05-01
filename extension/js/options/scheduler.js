let validTime = /^([0-1][0-9]|[2][0-3]):([0-5][0-9])$/

;(async () => {
  const settings = await loadSettingsRequest()
  let schedule = settings.schedule
  log(schedule)

  // Find any main toggles and set correct value + handle click
  const startTime = el("start-time")
  const endTime = el("end-time")

  function initPage() {
    if (schedule) {
      startTime.value = schedule.substring(0, 5)
      endTime.value = schedule.substring(5, 10)
    } else {
      startTime.value = "00:00"
      endTime.value = "00:00"
    }
    Array.from(document.getElementsByClassName("form-checkbox")).forEach(
      function (element) {
        var subSetting = element.childNodes[0].id
        var checkbox = element.childNodes[0]
        // Set current setting
        if (schedule) {
          if (schedule.includes(subSetting)) {
            checkbox.checked = true
          } else {
            checkbox.checked = false
          }
        } else {
          checkbox.checked = true
        }
        checkbox.onclick = function () {
          changeSchedule()
        }
      }
    )
    startTime.oninput = function () {
      if (!startTime.value) {
        startTime.value = "00:00"
      }
      if (validTime.test(startTime.value)) {
        changeSchedule()
        startTime.focus()
      }
    }
    startTime.onblur = function () {
      if (validTime.test(startTime.value)) {
      } else {
        if (schedule) {
          startTime.value = schedule.substring(0, 5)
        } else {
          startTime.value = "00:00"
        }
        notie.alert({
          type: 3,
          text:
            "That's not a valid time format. Please put your time in format HH:MM.",
          position: "bottom",
        })
      }
    }
    endTime.oninput = function () {
      if (!endTime.value) {
        endTime.value = "00:00"
      }
      if (validTime.test(endTime.value)) {
        changeSchedule()
        endTime.focus()
      }
    }
    endTime.onblur = function () {
      if (validTime.test(endTime.value)) {
      } else {
        if (schedule) {
          endTime.value = schedule.substring(5, 10)
        } else {
          endTime.value = "00:00"
        }
        notie.alert({
          type: 3,
          text:
            "That's not a valid time format. Please put your time in format HH:MM.",
          position: "bottom",
        })
      }
    }
  }

  initPage()

  el("reset").onclick = function () {
    changeSettingRequest(false, "schedule")
    schedule = false
    log(schedule)
    initPage()
    notie.alert({
      type: 1,
      text: "Schedule has been reset. Nudge will always be on.",
      position: "bottom",
    })
  }

  function changeSchedule() {
    let newSchedule = `${startTime.value}${endTime.value}`
    Array.from(document.getElementsByClassName("form-checkbox")).forEach(
      function (element) {
        var subSetting = element.childNodes[0].id
        var checkbox = element.childNodes[0]
        if (checkbox.checked) {
          newSchedule = newSchedule + subSetting
        }
      }
    )
    schedule = newSchedule
    log(schedule)
    changeSettingRequest(newSchedule, "schedule")

    notie.alert({
      type: 1,
      text: "Saved!",
      position: "bottom",
    })
  }
})()
