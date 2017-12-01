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
  console.log('*Total today: ' + logMinutes(totalLoggedTimeToday));
}
