// Files that need caching
var filesToCache = [
    "icon/logo-color.svg",
    "icon/closewhite.svg",
    "icon/hidegreynew.svg",
    "icon/hidewhitenew.svg",
    "icon/newcoggrey.svg",
    "icon/newcogwhite.svg",
    "icon/closegrey.svg",
    "icon/offswitch.svg",
    "icon/newcirclewhite.svg"
  ];
  
  // Cache images
  filesToCache.forEach(function (imageUrl) {
    var image = new Image();
    image.src = chrome.extension.getURL(`img/${imageUrl}`);
  });