// settingsLocal

// if (setting) {

// }

// chrome.webRequest.onBeforeRequest.addListener(request => {
//     const cancel = request.url.indexOf('watch_autoplayrenderer.js') !== -1 || request.url.indexOf('endscreen.js') !== -1;
//     return { cancel };
// },
//     {
//         urls: [
//             '*://*.ytimg.com/yts/jsbin/*',
//             '*://*.youtube.com/yts/jsbin/*'
//         ]
//     },
//     ['blocking']
// );