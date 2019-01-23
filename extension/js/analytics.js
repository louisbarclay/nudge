var dateCheck = new RegExp("[0-9]{4}-[0-9]{2}-[0-9]{2}");

console.log("asdf");
function getLocalStorage() {
  chrome.runtime.sendMessage({ type: "get_localStorage" }, function(response) {
    var localStorage = response.localStorage;
    var date = false;
    Object.keys(localStorage).forEach(function(key) {
      if (dateCheck.test(key)) {
        date = JSON.parse(localStorage[key]);
      }
    });
    console.log(date);
    document.getElementById('analytics').innerHTML = date.events;
  });
}
getLocalStorage();
