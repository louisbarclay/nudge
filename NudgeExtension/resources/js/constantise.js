var domainTitle = title(domain);

// Set titles constant on case by case basis (should be done with object really)
function title(domain) {
  switch (domain) {
    case "facebook.com":
      return "Facebook";
    case "twitter.com":
      return "Twitter";
    case "pinterest.com":
      return "Pinterest";
    case "mail.google.com":
      return "Gmail";
    default:
      return document.title;
  }
}

function listenForOnUpdated() {
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === "title") {
      if (document.title !== domainTitle) {
        document.title = domainTitle;
        // setConstant();
      }
    }
  });
}

//stackoverflow.com/questions/2497200/how-to-listen-for-changes-to-the-title-element

function setConstant() {
  Object.freeze(document.title);
}

setInterval(changeTitle, 10000);

function changeTitle() {
  console.log("attempted");
  document.title = "Test";
}

listenForOnUpdated();

function observe() {
  console.log("asdfasdfasdfasdf");
  // select the target node
  var target = document.querySelector("head > title");
  // Create an observer instance
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      console.log("new title:", mutation.target.textContent);
      if (document.title !== title(domain)) {
        document.title = title(domain);
        Object.defineProperty(document, "title", {
          enumerable: false,
          configurable: false,
          writable: false,
          value: title(domain)
        });
      }
    });
  });
  // Pass in the target node, as well as the observer options
  observer.observe(target, {
    subtree: false,
    characterData: true,
    childList: false
  });
}

doAtEarliest(observe);
