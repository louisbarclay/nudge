;(async () => {
  const settings = await loadSettings()
  el("js-pay-button").href = `https://nudgeware.io/pay/?id=${settings.userId}`
})()
