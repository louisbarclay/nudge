

// // Try to get favicon again, if not set by message
// function backupFaviconGenerator() {
//   docReady(function() {
//     var links = document.head.getElementsByTagName("link");
//     for (var link in links) {
//       if (links.hasOwnProperty(link)) {
//         var l = links[link];
//         if (l.rel === "shortcut icon") {
//           console.log(l.href);
//           if (!keyDefined(imageStorage, "faviconUrl")) {
//             tempStorage.faviconUrl = l.href;
//           }
//         }
//       }
//     }
//   });
// }

// backupFaviconGenerator();
