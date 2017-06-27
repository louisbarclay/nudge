// Copyright 2016, Nudge, All rights reserved.

// Load the UI
var messageContents = false;

$(document).ready(function() {
  if (document.getElementById('uf_message_contents')) {
    return;
  }
  bar();
});

// Load the UI
function bar() {
  var nudge_uf = createEl(document.body, 'div', 'nudge_uf');
  nudge_uf.innerHTML =
  '<div id="uf_container">' +
      '<div id="uf_message">' +
        '<div id="uf_message_contents">' +
          'The other bar' +
        '</div>' +
      '</div>' +
  '</div>';
}

// Change the UI text
function barChangeText(newText) {
  messageContents = document.getElementById('uf_message_contents');
  messageContents.innerHTML = newText;    
}

// Create user_id variable
var user_id = '';

// Get the fb_dtsg token that must be passed to get a successful response to an XMLHttpRequest from Facebook
try {
  fb_dtsg = document.getElementsByName("fb_dtsg")[0].value;
  console.log(fb_dtsg);
  // var el = document.createElement("div");
  //   el.innerText = el.textContent = fb_dtsg;
  //   fb_dtsg = el.innerHTML;
  } catch (error) {
  // Error catching
}

// Get user_id (1 method)
if (document.cookie.match(/c_user=(\d+)/)) {
  if (document.cookie.match(/c_user=(\d+)/)[1]) {
    user_id = document.cookie.match(document.cookie.match(/c_user=(\d+)/)[1]);
  }
  console.log(user_id);
}

// Keyboard shortcuts for testing
if (window.addEventListener) {
  var letters = [], prompt1 = ["z","x"];
  window.addEventListener("keydown", function(e) {
          letters.push(e.key);
          if ([letters.slice(-2)[0],letters.slice(-1)[0]].toString() === prompt1.toString()) {
            friendAndPageListGenerator(i);
          }
  }, true);
}

// TODO: test first. try unfollowing 1 profile then refollowing. If it works, offer the feature

// URLs to do XMLHttpRequests to:

// unfollow show profile url
// https://www.facebook.com/feed_preferences/profile_list_more/?card_type=unfollow&filter=all&page=1&dpr=1
// refollow show profile url
// https://www.facebook.com/feed_preferences/profile_list_more/?card_type=refollow&filter=all&page=" + i + "&dpr=1"
// unfollow action url
// https://www.facebook.com/ajax/follow/unfollow_profile.php?dpr=1
// refollow action url
// https://www.facebook.com/ajax/follow/follow_profile.php?dpr=1

// Create a random delay between XMLHttpRequests
function randomTime() {
  var ms = 1000;
  var floor = 0.1;
  var variance = 0.1;
  return Math.floor(ms * (floor + (Math.random() * variance)));
}

// Set loop counter
var i = 0;
var keepGoing = true;

// Not in use any more - loop function with in-built delay
// function loopIt() {
//   setTimeout(function () {
//   friendAndPageListGenerator(i);
//     i++;
//     console.log(i, keepGoing);
//     if (i < 4 && keepGoing) {
//         loopIt();
//     }
//   }, randomTime());
// }

// Store profile data here (friends and pages)
var profileData = [];

// Get friend and page IDs
function friendAndPageListGenerator(i) {
  console.log(i);
  // Define params variable for passing with the XMLHttpRequest send
  var params = '';
  // Create new XMLHttpRequest
  friendlist_get = new XMLHttpRequest();
  // Set the url etc. - note that 'i' will change as we load more pages worth of data
  friendlist_get.open("POST", "https://www.facebook.com/feed_preferences/profile_list_more/?card_type=refollow&filter=all&page=" + i + "&dpr=1", true);
  // Tweak to get headers in right format
  friendlist_get.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  // Listener for when it has worked
  friendlist_get.onreadystatechange = function() {
    if (friendlist_get.readyState == 4) {
      // Get data in the right format
      console.log(friendlist_get);
      var data = friendlist_get.responseText;
      data = data.substr(data.indexOf('{'));
      data = JSON.parse(data);
      data = data.payload.profiles;
      console.log(data);
      // Set keepGoing to false if you reach a stage where you get less than 24 
      if (data.length < 24) {
        keepGoing = false;
      }
      for (var j = 0; j < data.length; j++) {
        profileData.push(data[j]);
        if (j === data.length - 1) {
          console.log(profileData);
        }
      }
      // Loop again with higher 'i', unless keepGoing is false
      if (keepGoing) {
        i++;
        setTimeout(function () {
          friendAndPageListGenerator(i);  
        }, randomTime());
      }
    }
  };
  // Parameters to make this work!
  // params+="&__user="+user_id; // don't need it
  params+="&__a=1"; // done
  // params+="&__req=12"; // don't need it
  params+="&fb_dtsg="+ fb_dtsg;
  // params+="&__rev=3114741"; // don't need it
  friendlist_get.send(params);
}

// add up from unfollow and refollow . see if matches that figure you got earlier. if that makes sense.