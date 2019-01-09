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
  lastEverySecond: moment()
    // .add(-1, "days")
    .add(-0.5, "hours"),
  time: moment()
    .add(-1, "hours")
    .toString()
};

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test function
async function t() {
  // Clear data
  r();
  // Wait a second
  await timeout(1500);

  console.log("Pause over, let's test");
  // Go into test mode
  testMode = true;

  // Set the time we will artifically induce
  // var timeOverride = moment().add(1, "hours");
  var timeOverride = moment().add(2, "days");
  var domain = "test.com";
  var source = "test-source";

  // Grab currentState
  var status = open("status");
  // For gap before day change, do nothing
  // // For no gap:
  // status.currentState.lastEverySecond = timeOverride;
  // // For gap after day change:
  // status.currentState.lastEverySecond = moment(timeOverride)
  //   .startOf("day")
  //   .add(2, "hours");

  // Close currentState
  close("status", status, "status close in test");

  // Put through new timeline event
  timeline(domain, source, timeOverride);

  console.log(localStorage);

  await timeout(12000);
  console.log("Pause over, back to business as usual");
  // Clear false data
  r();
  // Start business as usual
  testMode = false;
}

// Can put timeline events into the future
// Take NOW, that's fine and good

testMode = false;
