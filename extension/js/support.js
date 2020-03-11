;(async () => {
  const settings = await loadSettings()
  if (el("js-pay-button")) {
    el("js-pay-button").href = `https://nudgeware.io/pay/?id=${settings.userId}`
  }
})()
