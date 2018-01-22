// Insert all tests here
function showMeStuff(date) {
  var object = JSON.parse(localStorage[date]);
  var totalLoggedTimeToday = 0;
  Object.keys(object).forEach(function(key) {
    var totalTime = 0;
    var runningCounter = 0;
    if (object[key].time != undefined) {
      totalTime = object[key].time / 1000;
      totalLoggedTimeToday += totalTime;
    }
    if (object[key].runningCounter != undefined) {
      runningCounter = object[key].runningCounter;
      totalLoggedTimeToday += runningCounter;
    }
    console.log(key, logMinutes(totalTime + runningCounter));
  });
  console.log("*Total today: " + logMinutes(totalLoggedTimeToday));
}

// Test day change
var testState = {
  domain: "facebook.com",
  source: "initial",
  lastEverySecond: moment(),
  time: moment()
    .add(-2, "days")
    .toString()
};

function x() {
  var s = open("status");
  s.currentState = testState;
  close("status", s);
}

var t = false;

function runTest() {
  x();
  t = true;
}
