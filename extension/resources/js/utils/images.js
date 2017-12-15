console.log('image loader is here');

function imageLoader(imageName, url) {
  imageName = new Image();
  imageName.src = url;
}

var faviconUrl = "";

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === "favicon") {
    imageLoader("favicon", request.favicon);
    faviconUrl = request.favicon;
    console.log(faviconUrl)
  }
});

var faviconFromDOM = "";

function dothis() {
  var links = document.head.getElementsByTagName("link");
  for (var link in links) {
    if (links.hasOwnProperty(link)) {
      var l = links[link];
      if (l.rel === "shortcut icon") {
        faviconFromDOM = l.href;
        console.log(l.href);
      }
    }
  }
}

setTimeout(dothis, 4000);

// favicon from chrome
// favicon from
