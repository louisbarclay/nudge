// SHOW:  automatically unfollow any new friends or pages detected. with the slider button

// Load the UI
var messageContents = false;
var bottomContents = false;
var fb_dtsg = '';
// Create user_id variable
var user_id = '';
// Store profile data here (friends and pages)
var profileData = [];

// when running for first time, store time in chrome storage
// every time you go back to fb after, keep running if enough time has elapsed
// randomise number of profiles to unfollow every day. max 100

docReady(function() {
  // Get the fb_dtsg token that must be passed to get a successful response to an XMLHttpRequest from Facebook
  try {
    // Get fb_dtsg
    fb_dtsg = document.getElementsByName("fb_dtsg")[0].value;
    // Get user_id
    if (document.cookie.match(/c_user=(\d+)/)) {
      if (document.cookie.match(/c_user=(\d+)/)[1]) {
        user_id = document.cookie.match(document.cookie.match(/c_user=(\d+)/)[1]);
        user_id = user_id[0];
      }
    }
    friendAndPageListGenerator(unfollow);
    ad();
  } catch (error) {
    // Error catching
  }
});

var nudge_ad = null;

var nudge_uf = null;

// Load the UI
function bar() {
  nudge_uf = createEl(document.body, 'div', 'nudge_uf');
  nudge_uf.innerHTML =
  '<div id="uf_container">' +
    '<div id="uf_message">' +
      '<div id="uf_message_contents">' +
        'Loading...' +
      '</div>' +
      '<div id="uf_logo"></div>' +
      '<div id="uf_close"></div>' +
    '</div>' +
    "<div id='uf_bottom'>Press 'Esc' to cancel and hide</div>" +
  '</div>';
}

// Change the UI text
function barChangeText(newText) {
  messageContents = document.getElementById('uf_message_contents');
  messageContents.innerHTML = newText;    
}

// Change the UI text
function bottomChangeText(newText) {
  bottomContents = document.getElementById('uf_bottom');
  bottomContents.innerHTML = newText;    
}

var barState = {
  initial: 'auto',

};

var clickNumber = 0;

// Click handler
function clickHandler() {
  var close = document.getElementById('uf_close');
  close.onclick = function() {
    // change html. add 2 links. closing in 5 seconds (close now / close forever, close for 10 weeks). only do this once? and in future hide forever?
    deleteEl(nudge_uf);
    cancelled = true;
  };
  var bar_container = document.getElementById('uf_message_contents'); // FIXME: danger. should only be for the part that is NOT the close button
  bar_container.onclick = function() {
    clickNumber++;
    if (clickNumber === 1) {
      barChangeText("Only you will know about unfollowing, and you can always refollow later. Click to confirm");
      clickHandler();
      return;
    }
    if (clickNumber === 2) {
      friendAndPageToggler(unfollow);
      return;
    }
  };
  nudge_uf.onmouseover = function() {
    if (clickNumber === 0) {
      barChangeText('Delete your News Feed forever by unfollowing all your friends, pages, and groups');
    }
  };
  nudge_uf.onmouseout = function() {
    // if (clickNumber === 0) {
    //   barChangeText(unfollow.messages.loaded); // this is wrongly set up!
    // }
  };
  var logo = document.getElementById('uf_logo');
  logo.onmouseover = function() {
    bottomChangeText('This is a new Nudge feature');
  };
  logo.onmouseout = function() {
    bottomChangeText("Press 'Esc' to cancel and hide");
  };
}

var cancelled = false;

// Hide bar and cancel anything that's happening
document.onkeyup = function(key) {
  if (key.keyCode === 27) {
    deleteEl(nudge_uf);
    cancelled = true;
  }
  window.onbeforeunload = null;
};

// Keyboard shortcuts for testing
// if (window.addEventListener) {
//   var letters = [], prompt1 = ["z","x"];
//   window.addEventListener("keydown", function(e) {
//     letters.push(e.key);
//     if ([letters.slice(-2)[0],letters.slice(-1)[0]].toString() === prompt1.toString()) {
//     }
//   }, true);
// }

// Create a random delay between XMLHttpRequests
function randomTime(floor, variance) {
  var ms = 1000;
  return Math.floor(ms * (floor + (Math.random() * variance)));
}

// Set loop counter
var i = 0;
var keepGoing = true;


function selectRandomFromArray(array) {
  var randomNumber = Math.floor(Math.random() * array.length);
  return randomNumber;
}

// tiny use case: only show the thing if the person is fololwing any friends

var unfollow = {
  listUrl: "https://www.facebook.com/feed_preferences/profile_list_more/?card_type=unfollow&filter=all&page=",
  actionUrl: "https://www.facebook.com/ajax/follow/unfollow_profile.php",
  profiles: [],
  messages: {
    loaded: 'Unfollow everything',
    empty: 'No profiles to unfollow',
    start: 'Trying to unfollow ',
    success: 'Successfully unfollowed ', // FIXME: Recommend that you go and do something else - leave tab open
    fail: "Couldn't unfollow "
  },
  i: 0,
  j: 0,
  safetylock: 2000, // FIXME
  keepGoing: true,
  verifText: {
    start: 'Arbiter.inform("UnfollowUser", {"profile_id":',
    end: '});'
  }
};

var refollow = {
  listUrl: 'https://www.facebook.com/feed_preferences/profile_list_more/?card_type=refollow&filter=all&page=',
  actionUrl: "https://www.facebook.com/ajax/follow/follow_profile.php?dpr=1",
  profiles: [],
  messages: {
    loaded: 'Ready to refollow ',
    empty: 'No profiles to refollow',
    start: 'Trying to refollow ',
    success: 'Successfully refollowed ',
    fail: "Couldn't refollow "
  },
  i: 0,
  j: 0,
  safetylock: 2000, // that's not for toggle vs. listgen-  it's for both FIXME
  keepGoing: true,
  verifText: {
    start: 'Arbiter.inform("FollowUser", {"profile_id":',
    end: '});'
  }
};

// Get friend and page IDs
function friendAndPageListGenerator(option) {
  // Empty out profile storage if you're on the first loop
  if (option.i === 0) {
    option.keepGoing = true;
  }
  // Define params variable for passing with the XMLHttpRequest send
  var params = '';
  // Create new XMLHttpRequest
  friendandpagelist_get = new XMLHttpRequest();
  // Set the url etc. - note that 'i' will change as we load more pages worth of data
  friendandpagelist_get.open("POST", option.listUrl + option.i + "&dpr=1", true);
  // Tweak to get headers in right format
  friendandpagelist_get.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  // Listener for when it has worked
  friendandpagelist_get.onreadystatechange = function() {
    if (friendandpagelist_get.readyState == 4) {
      // Get data in the right format
      var data = friendandpagelist_get.responseText;
      data = data.substr(data.indexOf('{'));
      data = JSON.parse(data);
      var hasMoreData = false;
      if (typeof data.payload.hasMoreData != 'undefined') {
        hasMoreData = data.payload.hasMoreData;
      }
      data = data.payload.profiles;
      if (data.length > 0) {
        console.log('Loaded ' + data[0].name + ' and ' + (data.length - 1) + ' other profiles');
      }
      // Set keepGoing to false if you reach a stage where you get less than 24 
      for (var j = 0; j < data.length; j++) {
        option.profiles.push(data[j]); // Should you check you aren't adding duplicates?
        // console.log((option.i * 24) + j + ' ' + data[j].name); // Why not 
      }
      if (!hasMoreData) {
        option.i = 0;
        option.keepGoing = false;
        if (!document.getElementById('uf_message_contents') && option.profiles.length > 0) {
          bar();
          clickHandler();
          var friends = " friends ";
          if (option.profiles.length === 1) {
            friends = " friend ";
          }
          barChangeText(option.messages.loaded); //  + option.profiles.length + friends + "(click to start, press 'Esc' to hide)"
        }
      }
      // Loop again with higher 'i', unless keepGoing is false
      if (option.keepGoing && option.i < option.safetylock && !cancelled) {
        option.i++;
        friendAndPageListGenerator(option);
      } else {
        option.keepGoing = false;
        option.i = 0;
      }
    }
  };
  // Parameters to make this work!
  // params+="&__user="+user_id; // don't need it
  params+="&__a=1"; // done
  // params+="&__req=12"; // don't need it
  params+="&fb_dtsg="+ fb_dtsg;
  // params+="&__rev=3114741"; // don't need it
  friendandpagelist_get.send(params);
}

// add up from unfollow and refollow . see if matches that figure you got earlier. if that makes sense.

// window.onbeforeunload = function(){
//   return "";
// };

// FIXME: some safety features to make sure this can't be abused (i.e. somehow set off friendtoggler multiple times within short space of time leading to acct getting blocked by fb)

function friendAndPageToggler(option) {
  if (option.j === 0) {
    barChangeText('Starting to unfollow ' + option.profiles.length + ' friends, pages, and groups');
  }
  // Check if there are profiles to toggle
  if (option.profiles.  length === 0) {
    console.log(option.messages.empty);
    barChangeText(option.messages.empty);
    return;
  }
  var profile_id_obj = option.profiles[option.j];
  if (typeof profile_id_obj === 'undefined') {
    console.log("Couldn't find profile");
    return;
  } else {
    var name = profile_id_obj.name;
    var profile_id = profile_id_obj.id;
  }
  console.log(option.messages.start + name);
  friendandpage_toggle = new XMLHttpRequest();
  friendandpage_toggle.open("POST", option.actionUrl, true);
  friendandpage_toggle.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  var params = '';
  // Parameters to make this work!
  params += "&__a=1"; // Need this
  params += "&location=1"; // Need this
  params += "&fb_dtsg=" + fb_dtsg;
  params += "&__user=" + user_id;
  params += "&profile_id=" + profile_id;
  params += "&nctr[_mod]=pagelet_timeline_profile_actions";
  params += "&__req=65";  
  // params += "&confirmed=" + 1; // Keep this in the back pocket
  friendandpage_toggle.onreadystatechange = function() {
    if (friendandpage_toggle.readyState == 4) {
      var data = friendandpage_toggle.responseText;
      data = data.substr(data.indexOf('{'));
      data = JSON.parse(data);
      if (typeof data != 'undefined') {
        if (typeof data.error != 'undefined') {
          barChangeText("Something went wrong. Please try again in 24 hours" + ' (' + (option.j) + ' unfollowed out of ' + option.profiles.length + ")");
          return;
        }
        if (typeof data.onload != 'undefined' && data.onload[0] === (option.verifText.start + profile_id + option.verifText.end)) {
          option.j++;
          console.log(option.messages.success + name + ' (' + (option.j) + ' out of ' + option.profiles.length + ")");
          barChangeText(option.messages.success + name + ' (' + (option.j) + ' out of ' + option.profiles.length + ")");
          if (option.j < option.profiles.length && option.j < option.safetylock && !cancelled) {
            setTimeout(function () {
              friendAndPageToggler(option);
            }, randomTime(1,0.1));
          }
          if ((option.j) === option.profiles.length) {
            setTimeout(function() {
              barChangeText(option.messages.success + "all " + option.profiles.length + " friends, pages and groups");
            }, 2000);
            window.onbeforeunload = null;
          }
        } else {
          console.log(option.messages.fail + name);
          barChangeText(option.messages.fail + name);
          console.log(friendandpage_toggle);
          // need to remove that friend from the list of people to unfollow. or reload all that data.
        }
      }  
    }
  };
  friendandpage_toggle.send(params);
}

// want to make clear that person can do something else in other tabs
// want to make clear where you go to refollow
// want to make clear how much time it's going to take