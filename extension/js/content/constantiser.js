var currentScript = document.currentScript;
var domain = currentScript.getAttribute("data-domain");

function constantiser(newTitle) {
  if (newTitle) {
    document.getElementsByTagName("title")[0].remove();
    document.title = newTitle;
    Object.defineProperty(document, "title", {
      enumerable: false,
      configurable: false,
      writable: false,
      value: document.title
    });
    // var iconArray = ["link[rel*='shortcut icon']", "link[rel*='icon']"];
    // for (var i = 0; i < iconArray.length; i++) {
    //   var element = document.querySelector(iconArray[i]);
    //   if (element) {
    //     console.log(element);
    //     element.remove();
    //   }
    // }
  }
}

function domainTranslate(domain) {
  // if (domain === "facebook.com") {
  //   return "Facebook";
  // }
  // if (domain === "twitter.com") {
  //   return "Twitter";
  // }
  if (domain === "messenger.com") {
    return "Messenger";
  }
  // if (domain === "mail.google.com") {
  //   return "Gmail";
  // }
  // if (domain === "linkedin.com") { // This is making LinkedIn mess up
  //   return "LinkedIn";
  // }
  return false;
}

constantiser(domainTranslate(domain));