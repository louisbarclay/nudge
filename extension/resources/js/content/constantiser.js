var currentScript = document.currentScript;
var domain = currentScript.getAttribute("data-domain");

function constantiseTitle(newTitle) {
  if (newTitle) {
    document.getElementsByTagName("title")[0].remove();
    document.title = newTitle;
    Object.defineProperty(document, "title", {
      enumerable: false,
      configurable: false,
      writable: false,
      value: document.title
    });
  }
}

function domainTranslate(domain) {
  if (domain === "facebook.com") {
    return "Facebook";
  }
  if (domain === "twitter.com") {
    return "Twitter";
  }
  if (domain === "messenger.com") {
    return "Messenger";
  }
  if (domain === "mail.google.com") {
    return "Gmail";
  }
  return false;
}

constantiseTitle(domainTranslate(domain));

// https://static.xx.fbcdn.net/rsrc.php/y7/r/O6n_HQxozp9.ico