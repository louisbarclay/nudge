var config = {
  'debug': true
}


//  global debug option for logger
debugMode = config.debug;

if (debugMode) {
  console.log('in debug mode');
}

function log(data) {

  if (debugMode == true) {
    console.log(data)
  }
}
