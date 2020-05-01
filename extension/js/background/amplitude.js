// Amplitude
;(function (e, t) {
  var n = e.amplitude || { _q: [], _iq: {} }
  var r = t.createElement("script")
  r.type = "text/javascript"
  r.crossOrigin = "anonymous"
  r.async = true
  r.src = getUrl("js/vendor/amplitude-5.2.2-min.gz.js")
  r.onload = function () {
    if (!e.amplitude.runQueuedFunctions) {
      console.log("[Amplitude] Error: could not load SDK")
    }
  }
  var i = t.getElementsByTagName("script")[0]
  i.parentNode.insertBefore(r, i)
  function s(e, t) {
    e.prototype[t] = function () {
      this._q.push([t].concat(Array.prototype.slice.call(arguments, 0)))
      return this
    }
  }
  var o = function () {
    this._q = []
    return this
  }
  var a = ["add", "append", "clearAll", "prepend", "set", "setOnce", "unset"]
  for (var u = 0; u < a.length; u++) {
    s(o, a[u])
  }
  n.Identify = o
  var c = function () {
    this._q = []
    return this
  }
  var l = [
    "setProductId",
    "setQuantity",
    "setPrice",
    "setRevenueType",
    "setEventProperties",
  ]
  for (var p = 0; p < l.length; p++) {
    s(c, l[p])
  }
  n.Revenue = c
  var d = [
    "init",
    "logEvent",
    "logRevenue",
    "setUserId",
    "setUserProperties",
    "setOptOut",
    "setVersionName",
    "setDomain",
    "setDeviceId",
    "setGlobalUserProperties",
    "identify",
    "clearUserProperties",
    "setGroup",
    "logRevenueV2",
    "regenerateDeviceId",
    "groupIdentify",
    "onInit",
    "logEventWithTimestamp",
    "logEventWithGroups",
    "setSessionId",
    "resetSessionId",
  ]
  function v(e) {
    function t(t) {
      e[t] = function () {
        e._q.push([t].concat(Array.prototype.slice.call(arguments, 0)))
      }
    }
    for (var n = 0; n < d.length; n++) {
      t(d[n])
    }
  }
  v(n)
  n.getInstance = function (e) {
    e = (!e || e.length === 0 ? "$default_instance" : e).toLowerCase()
    if (!n._iq.hasOwnProperty(e)) {
      n._iq[e] = { _q: [] }
      v(n._iq[e])
    }
    return n._iq[e]
  }
  e.amplitude = n
})(window, document)

// This takes settings and an identify and flushes settings correctly
// We use this to prevent domains settings creating tons of User Properties in Amplitude
function sendAllSettingsToAmplitude(settings) {
  try {
    var identify = new amplitude.Identify()
    Object.keys(settings).forEach(function (key) {
      identify.set(key, settings[key])
    })
    amplitude.getInstance().identify(identify)
  } catch (e) {}
}

async function initAmplitude(userId) {
  try {
    // Start Amplitude
    await amplitude.getInstance().init(amplitudeCreds.apiKey)
    // Set user ID
    await amplitude.getInstance().setUserId(userId)
  } catch (e) {}
}

function amplitudeHttpEvent(eventType, eventProperties) {
  var url = "https://api.amplitude.com/2/httpapi"
  var event = {
    user_id: settingsLocal.userId,
    event_type: eventType,
  }
  if (eventProperties) {
    event.event_properties = eventProperties
  }

  var data = {
    api_key: amplitudeCreds.apiKey,
    events: [event],
  }

  async function postData() {
    try {
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
        },
      })
    } catch (error) {}
  }

  postData()
}

// Utils
function amplitudeLogger(eventType, detailsObj, time) {
  try {
    amplitude.getInstance().logEvent(eventType, { time, ...detailsObj })
  } catch (e) {
    log(e)
  }
}
