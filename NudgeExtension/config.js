var config = {
  'debug': true,
  'apiEndpoint': 'http://ec2-34-252-87-55.eu-west-1.compute.amazonaws.com:3000/'
}

// http://ec2-34-252-87-55.eu-west-1.compute.amazonaws.com:3000/

//  global debug option for logger
debugMode = config.debug;

if (debugMode) {
  console.log('In debug mode - switch off before finishing');
}

function log(data) {
  if (debugMode) {
    console.log(data)
  }
}