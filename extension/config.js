var config = {
  debug: false,
  // 'apiEndpoint': 'http://localhost:3000/' // for testing
  'apiEndpoint': 'http://ec2-34-252-87-55.eu-west-1.compute.amazonaws.com:3000/'
};

// Global debug option for logger
debugMode = config.debug;

if (debugMode) {
  console.log("Nudge is in debug mode - switch off before moving to production");
} else {
  // console.log("Nudge is in production - all logging is off");
  console.log = function() {};
}