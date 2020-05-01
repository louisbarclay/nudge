;(async () => {
  const settings = await loadSettingsRequest()
  if (el("js-pay-button")) {
    el("js-pay-button").href = `https://nudgeware.io/pay/?id=${settings.userId}`
  }
})()
