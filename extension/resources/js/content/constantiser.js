function constantiseTitle() {
  document.getElementsByTagName("title")[0].remove();
  document.title = 'constant';
  Object.defineProperty(document, "title", {
    enumerable: false,
    configurable: false,
    writable: false,
    value: document.title
  });
  console.log("title constantised");
}

constantiseTitle();