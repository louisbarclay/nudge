// Copyright 2016, Nudge, All rights reserved.

// Load the UI
var messageContents = false;
var fb_dtsg = '';
// Create user_id variable
var user_id = '';
// Store profile data here (friends and pages)
var profileData = [];

friendAndPageToggler(selectRandomFromArray(profileData));

console.log(selectRandomFromArray(profileData));

$(document).ready(function() {
  // Get the fb_dtsg token that must be passed to get a successful response to an XMLHttpRequest from Facebook
  try {
    fb_dtsg = document.getElementsByName("fb_dtsg")[0].value;
    console.log(fb_dtsg);
    // var el = document.createElement("div");
    //   el.innerText = el.textContent = fb_dtsg;
    //   fb_dtsg = el.innerHTML; 
    // Get user_id (1 method)
    if (document.cookie.match(/c_user=(\d+)/)) {
      if (document.cookie.match(/c_user=(\d+)/)[1]) {
        user_id = document.cookie.match(document.cookie.match(/c_user=(\d+)/)[1]);
        user_id = user_id[0];
        console.log(user_id);
      }
    }
    if (!document.getElementById('uf_message_contents')) {
      bar();  
    }
    barChangeText('Getting friend and page list...');
    friendAndPageListGenerator(i, unfollowList);
  } catch (error) {
    // Error catching
  }
});

// Load the UI
function bar() {
  var nudge_uf = createEl(document.body, 'div', 'nudge_uf');
  nudge_uf.innerHTML =
  '<div id="uf_container">' +
      '<div id="uf_message">' +
        '<div id="uf_message_contents">' +
          'Loading...' +
        '</div>' +
      '</div>' +
  '</div>';
}

// Change the UI text
function barChangeText(newText) {
  messageContents = document.getElementById('uf_message_contents');
  messageContents.innerHTML = newText;    
}


// Keyboard shortcuts for testing
if (window.addEventListener) {
  var letters = [], prompt1 = ["z","x"];
  window.addEventListener("keydown", function(e) {
          letters.push(e.key);
          if ([letters.slice(-2)[0],letters.slice(-1)[0]].toString() === prompt1.toString()) {
            friendAndPageToggler(profileData, selectRandomFromArray(profileData));
          }
  }, true);
}

// TODO: test first. try unfollowing 1 profile then refollowing. If it works, offer the feature

// URLs to do XMLHttpRequests to:

// unfollow show profile url

var unfollowList = "https://www.facebook.com/feed_preferences/profile_list_more/?card_type=unfollow&filter=all&page=";
var refollowList = 'https://www.facebook.com/feed_preferences/profile_list_more/?card_type=refollow&filter=all&page=';

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


function selectRandomFromArray(array) {
  var randomNumber = Math.floor(Math.random() * array.length);
  return randomNumber;
}

// Get friend and page IDs
function friendAndPageListGenerator(i, whichList) {
  console.log(i);
  // Define params variable for passing with the XMLHttpRequest send
  var params = '';
  // Create new XMLHttpRequest
  friendandpagelist_get = new XMLHttpRequest();
  // Set the url etc. - note that 'i' will change as we load more pages worth of data
  friendandpagelist_get.open("POST", whichList + i + "&dpr=1", true);
  // Tweak to get headers in right format
  friendandpagelist_get.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  // Listener for when it has worked
  friendandpagelist_get.onreadystatechange = function() {
    if (friendandpagelist_get.readyState == 4) {
      // Get data in the right format
      console.log(friendandpagelist_get);
      var data = friendandpagelist_get.responseText;
      data = data.substr(data.indexOf('{'));
      data = JSON.parse(data);
      data = data.payload.profiles;
      console.log(data);
      // Set keepGoing to false if you reach a stage where you get less than 24 
      for (var j = 0; j < data.length; j++) {
        profileData.push(data[j]);
        if (j === data.length - 1) {
          console.log(profileData);
        }
      }
      if (data.length < 24) { // This is weak
        keepGoing = false;
        console.log(profileData[selectRandomFromArray(profileData)]);
        barChangeText("Friend and page list loaded");
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
  friendandpagelist_get.send(params);
}

// add up from unfollow and refollow . see if matches that figure you got earlier. if that makes sense.

function friendAndPageToggler(profiledataarray, index) {
  console.log(profiledataarray);
  console.log(index);  
  var profile_id_obj = profiledataarray[index];
  if (typeof profile_id_obj === 'undefined') {
    console.log('couldnt find profile');
    return;
  }
  else {
    var profile_id = profile_id_obj.id;
  }
  var startMessage = "Trying to unfollow " + profile_id_obj.name;
  console.log(startMessage);
  barChangeText(startMessage);
  friendandpage_toggle = new XMLHttpRequest();
  friendandpage_toggle.open("POST", "https://www.facebook.com/ajax/follow/unfollow_profile.php?dpr=1", true);
  friendandpage_toggle.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  var params = '';
  // Parameters to make this work!
  params += "&__a=1"; // done
  params += "&__be=1"; // done 
  params += "&location=100"; // done 
  params += "&jazoest=265816973751091105452971171165865817088851118311068897554"; // done
  params += "&__spin_r=3122250"; // done
  params += "&__spin_b=trunk"; // done  
  params += "&__spin_t=1498669143"; // done    
  params += "&__rev=3122250"; // done
  params += "&__pc=PHASED:DEFAULT"; // done    
  params += "&__rev=3122994"; // done      
  params += "&__af=iw"; // done  
  // params+="&__req=12"; // don't need it
  params += "&fb_dtsg=" + fb_dtsg;
  params += "&__user=" + user_id;
  params += "&profile_id=" + profile_id;
  friendandpage_toggle.onreadystatechange = function() {
    if (friendandpage_toggle.readyState == 4) {
      var data = friendandpage_toggle.responseText;
      data = data.substr(data.indexOf('{'));
      data = JSON.parse(data);
      if (typeof data != 'undefined' && data.onload[0] === ('Arbiter.inform("UnfollowUser", {"profile_id":' + profile_id + '});')) {
        var successMessage = "Unfollowed " + profile_id_obj.name;
        console.log(successMessage);
        barChangeText(successMessage);
        profileData.splice(index, 1); // error handling here?
      } else {
        var failMessage = "Couldn't unfollow " + profile_id_obj.name;
        console.log(failMessage);
        barChangeText(failMessage);
        console.log(friendandpage_toggle);
        // need to remove that friend from the list of people to unfollow. or reload all that data.
      }
    }
  };
  friendandpage_toggle.send(params);
}

/*
profile_id:100000168534450
location:100
__user:1613880018
__a:1
__dyn:7AgNeUiFoF1t2u6aZGeFxqeCwKyaF3oyeqhf8267UKezob4q2i5U4e1FDxtu9wSwADK7HzErwHwTz9VoboGq2i58nUOfz8nxm1DADBwBx62q3O69LJ1aih1G7WwzwxUqU4Cu7oeoqAxxwICK68pUCbxyGzkfqwKxqm9Kl1qUKaxSiaDyES2Wq
__af:iw
__req:x
__be:1
__pc:PHASED:DEFAULT
__rev:3122250
fb_dtsg:AQEIKmn64aut:AQFXUoSnDYK6
jazoest:265816973751091105452971171165865817088851118311068897554
__spin_r:3122250
__spin_b:trunk
__spin_t:1498669143

profile_id:500088465
location:100
__user:1613880018
__a:1
__dyn:7AgNeUiFoF1t2u6aZGeFxqeCwKyaF3oyeqhf8267UKezob4q2i5U4e1FDxtu9wSwADK7HzErwHwTz9VoboGq2i58nUOfz8nxm1DADBwBx62q3O69LJ1aih1G7WwzwxUqU4Cu7oeoqAxxwICK68pUCbxyGzkfqwKxqm9Kl1qUKaxSiaDyES2Wq
__af:iw
__req:y
__be:1
__pc:PHASED:DEFAULT
__rev:3122250
fb_dtsg:AQEIKmn64aut:AQFXUoSnDYK6
jazoest:265816973751091105452971171165865817088851118311068897554
__spin_r:3122250
__spin_b:trunk
__spin_t:1498669143
*/


/*
__a:1
__be:1
__pc:PHASED:DEFAULT
__rev:3122994
__af:iw
fb_dtsg:AQGyZbKqpJPT:AQFa41lo2skS
__user:1613880018
profile_id:513688808

profile_id:513688808
location:100
__user:1613880018
__a:1
__dyn:7AgNeUiFoF1t2u6aZGeFxqeCwKyaGexvF4Yw8ovyUWdwIhE98nwgU6C7WUC3q2OUuK2G2K3ucDBwJx62i2PxOcxu5o6ucBwBx62q3O69LK3C7WwzwxxO1bDxS3C1DCK68pUCbxyE6OfwNwExuazodo
__af:iw
__req:u
__be:1
__pc:PHASED:DEFAULT
__rev:3122994
fb_dtsg:AQGyZbKqpJPT:AQFa41lo2skS
jazoest:2658171121909875113112748084586581709752491081115011510783
__spin_r:3122994
__spin_b:trunk
__spin_t:1498692398*/