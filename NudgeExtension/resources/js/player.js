// Copyright 2016, Nudge, All rights reserved.

// Modal default messages
var modal_test = 'You&rsquo;ve scrolled <div id="m_message1_box">180 screens</div> down <div id="m_message1_favicon" style="background: url(https://assets.guim.co.uk/images/favicons/79d7ab5a729562cebca9c6a13c324f0e/32x32.ico) 32px/32px"></div>.<div id="m_message1_cog"></div>';
var modal_earn_nothing = '<div id="m_message2_contents">Close tab to escape this site</div>';
var modal_hide = 'Press &rsquo;Esc&rsquo; or click outside Nudge to hide';

// For setting domain
var domain = extractDomain(window.location.href);

// For updating options
function optionsUpdater() {
  var settingObj = {};
  settingObj.scroll_s_setting = init.scroll_s_setting;
  settingObj.scroll_b_setting = init.scroll_b_setting;
  chrome.storage.sync.get(settingObj, function(items) {
    scroll_s_setting = items.scroll_s_setting;
    scroll_b_setting = items.scroll_b_setting;
  });
}

// For making some options there initially, just in case
init = {
  scroll_s_setting: 10,
  scroll_b_setting: 2,
};

// Scroll options
var scroll_s_setting = 0;
var scroll_b_setting = 0;
var last_scroll_screens_hit = 0;
var domain = "";

// Scroll caller
$(window).scroll(function() {
  chrome.runtime.sendMessage({ scroll: true });
  var scrollPixels = $(window).scrollTop();
  scrollScreens = Math.round(scrollPixels / screen.height);
  if ((scrollScreens % scroll_s_setting === 0) && (scrollScreens > last_scroll_screens_hit)) {
    var modal = false;
    if (scrollScreens >= (scroll_s_setting * scroll_b_setting)) {
      modal = true;
    }
    var scrollData = {
      "time_loaded": timeNow(),
      "type": "scroll",
      "domain": domain,
      "status": "pending",
      "amount": scrollScreens,
      "send_fails": 0,
      "modal": modal
    };
    nudgeSender(scrollData);
    last_scroll_screens_hit = scrollScreens;
  }
});

// Nudge sender
function nudgeSender(nudge) {
  chrome.runtime.sendMessage(nudge);
}

// Testing UI elements
function uiPlayer(type) {
  if (type === "drawer") {
    drawerNudge.domain = extractDomain(window.location.href);
    nudgeSender(drawerNudge);
  } else {
    modalNudge.domain = extractDomain(window.location.href);    
    nudgeSender(modalNudge);
  }
}

// The two test nudges
var drawerNudge = {
  "time_loaded": timeNow(),
  "type": "visit",
  "domain": domain,
  "status": "executed",
  "amount": 15,
  "send_fails": 0,
  "modal": false,
  "favicon": ""
};

var modalNudge = {
  "time_loaded": timeNow(),
  "type": "time",
  "domain": domain,
  "status": "executed",
  "amount": 20,
  "send_fails": 0,
  "modal": true,
  "favicon": ""
};

// Keyboard shortcuts for testing
// if (window.addEventListener && config.debug) {
//         var letters = [], prompt1 = ["z","x"], prompt2 = ["c","v"];
//         window.addEventListener("keydown", function(e) {
//                 letters.push(e.key);
//                 if ([letters.slice(-2)[0],letters.slice(-1)[0]].toString() === prompt1.toString()) {
//                     uiPlayer("drawer");
//                 } else if ([letters.slice(-2)[0],letters.slice(-1)[0]].toString() === prompt2.toString()) {
//                     uiPlayer("modal");
//                 }
//         }, true);
// }

// Default message
var defaultMessage = 'This is the <div id="d_message_box">default message</div> <div id="d_message_favicon"></div>';

// Safeguard: amounts should be high enough
// TODO: should always call sendMessage with SOMETHING
function listener() {
  domain = extractDomain(window.location.href); // This is clumsy
  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.type === "ready_check") {
        sendResponse({ type: true });
        return;
      }
      if (request.type === "scroll_update") {
        scrollSArray = request.scrollS;
        scrollBArray = request.scrollB;
        console.log(request);
        scrollCheckerUpdater(scrollSArray, scrollScreens);
        return;
      }
      if (domainChecker(domain, [request.domain])) {
        $(document).ready(function() { // TODO: This is where you could wait for no running processes
          if (request.type === "title") {
            // https://stackoverflow.com/questions/27847616/making-document-title-untouchable-for-javascript
            document.title = titleConstantizer(request.domain);
            Object.defineProperty(document, 'title', {
              enumerable: false,
              configurable: false,
              writable: false,
              value: document.title
            });
          } else {
            messageCompiler(request); // Wow, this is running way too often. FIXME:!!!!!!! (because you're not actually checking for nudges)
          }
        });
      } else {
        sendResponse({ "time_executed": timeNow(), "status": "url_mismatch" });
      }
      sendResponse({ "time_executed": timeNow(), "status": "succeeded" });
      return; //updated 25 march 2017 by ExtFo
    }
  );
  // AM READY FOR STUFF!!!!!!!!!!!!!!!!!!!! TODO: send message from here
}

listener();
optionsUpdater();

// =================================================================

var thisSiteTesting = false;

// Message compiler
function messageCompiler(request) {
  // Define helper variables
  // TODO: logic for if no favicon
  if (request.type == 'favicon') { //updated 25 march 2017 by ExtFo
    return;
  }
  box_m = '<div id="m_message1_box">';
  box_d = '<div id="d_message_box">';
  ord_amount = ordinal(request.amount);
  min_amount = minutes(request.amount);
  amount = request.amount;
  end_div = '</div>';
  if (faviconUrl === "" || thisSiteTesting) {
    favicon_m = 'this site';
    favicon_d = 'this site<div id="d_message_favicon" style="margin: 0;width: 0;height: 32px"></div>';
  } else {
    bg = 'background: url(' + faviconUrl + ') 32px/32px';
    favicon_m = '<div id="m_message1_favicon" style="' + bg + '"></div>';
    favicon_d = '<div id="d_message_favicon" style="' + bg + '"></div>';
  }
  cog_m = '<div id="m_message1_cog"></div>';
  cog_d = '<div id="d_message_cog"></div>';
  // Set up false message variable
  var message = false;
  // Define cases
  if (!request.modal) {
    switch (request.type) {
      case "visit":
        message = box_d + ord_amount + ' visit' + end_div + ' to ' + favicon_d + ' today. ' + cog_d;
        break;
      case "time":
        message = box_d + min_amount + end_div + ' on ' + favicon_d + ' today. ' + cog_d;
        break;
      case "scroll":
        message = 'Scrolled ' + box_d + amount + " screens" + end_div + ' down ' + favicon_d + '.' + cog_d;
        break;
      case "compulsive":
        message = 'Quit ' + favicon_d + ' ' + box_d + min_amount + end_div + ' ago. ' + cog_d;
        break;
      default:
        // console.log("nothing matched"); // FIXME: receiving all these messages which it can't do anything with
    }
    if (message) {
      drawer(request.domain, message, request.type);
    }
  } else {
    switch (request.type) {
      case "visit":
        message = "This is your " + box_m + ord_amount + ' visit' + end_div + ' to ' + favicon_m + ' today.' + cog_m;
        break;
      case "time":
        message = "You&rsquo;ve been on " + favicon_m + ' for ' + box_m + min_amount + end_div + ' today.' + cog_m;
        break;
      case "scroll":
        message = "You&rsquo;ve scrolled " + box_m + amount + " screens" + end_div + ' down ' + favicon_m + '.' + cog_m;
        break;
      default:
        // console.log("nothing matched");
    }
    if (message) {
      modal(request.domain, message, modal_earn_nothing, modal_hide, request.type);
    }
  }
}

// TODO: scroll needs to inform of a nudge, or rather check before it does it what the most recent nudge was. and also inform. both things
// TODO: need to inform the nudge register every time there is a scroll nudge.

// change id of the element so that the popup only works on the friend one :)
// need to pass 'domain' into here
function modal(domain, message1, message2, message3, type) {
  var previous_nudge_m = document.getElementById('nudge_m');
  if (previous_nudge_m) {
    deleteEl(previous_nudge_m);
  }
  var clickNumber = 1;
  var nudge_m = createEl(document.body, 'div', 'nudge_m');
  nudge_m.innerHTML = '<div id="m_background"></div>' +
    '<div id="m_container">' +
    '<div id="m_wrapper">' +
    '<div id="m_contents">' +
    '<div id="m_icon" style="background: ' + bgPicker(type) + '"></div>' +
    '<div id="m_message1">' +
    '<div id="m_message1_contents">' + message1 + '</div>' +
    '</div>' +
    '<div id="m_message2">' + message2 + '</div>' +
    '</div>' +
    '<div id="m_message3">' + message3 + '</div>' +
    '</div>' +
    '</div>';
  $("#nudge_m").on('click', '#m_wrapper #m_contents #m_message1_cog', function() {
    modalMessagePlayer(document.getElementById('m_message2_contents'), clickNumber, domain);
    clickNumber++;
  });

  function closekey(e) {
    if (e.keyCode === 27) {
      deleteEl(nudge_m);
      $(document).unbind('keyup', closekey);
      $(document).off('click', handler);
    }
  }

  function handler(e) {
    if (!$(e.target).is("#m_contents, #m_contents *")) {
      deleteEl(nudge_m);
      $(document).unbind('keyup', closekey);
      $(document).off('click', handler);
    }
  }

  // listenters for closing
  $(document).keyup(closekey);
  $(document).on('click', handler);
}

// need to pass 'domain' in here
function drawer(domain, message, type) {
  bouncer();
  var clickNumber = 1;
  var canDelete = true;
  // Create all divs
  var nudge_d = createEl(document.body, 'div', 'nudge_d');
  nudge_d.innerHTML = '<div id="d_wrapper" class="d_wrapper_in">' +
    '<div id="d_container">' +
    '<div id="d_close" class="d_close_fade_in"></div>' +
    '<div id="d_message">' +
    '<div id="d_icon_lhs" style="background: ' + bgPicker(type) + '"></div>' +
    '<div id="d_message_bottom"><div id="d_message_bottom_contents">Try <a href="#" id="d_link_switch">switching off this site</a> if you want a break</div></div>' +
    '<div id="d_message_rhs">' + message + '</div>' +
    '</div>' +
    '</div>' +
    '</div>';
  // Tell me if I can delete
  $(nudge_d)
    .mouseenter(function() {
      canDelete = false;
    })
    .mouseleave(function() {
      canDelete = true;
    });
  // Add listener on cog icon
  $(nudge_d).on('click', '#d_message_cog', function() {
    drawerMessagePlayer(document.getElementById('d_message_bottom_contents'), clickNumber, domain);
    clickNumber++;
  });
  // Add listener to close btn
  $(nudge_d).on('click', '#d_close', function() {
    remover();
  });
  // Add listener to switch btn
  $(nudge_d).on('click', '#d_link_switch', function() {
    initOff();
  });
  // Add listener to escape key 
  // Esc delete TODO: should probably set canDelete to false
  // TODO: Not violent enough, should take shit out harder :)       
  $(document).keyup(function(key) {
    if (key.keyCode === 27) {
      remover();
    }
  });

  // Remove function
  function remover() {
    if (!nudge_d) {
      return;
    }
    classList(document.getElementById('d_wrapper')).remove('d_wrapper_in').add('d_wrapper_out');
    classList(document.getElementById('d_close')).remove('d_close_fade_in').add('contents_fade_out');
    classList(document.getElementById('d_message_rhs')).add('contents_fade_out');
    classList(document.getElementById('d_message_bottom')).add('contents_fade_out');
    setTimeout(function() {
      deleteEl(nudge_d);
      nudge_d = undefined;
    }, 2000);
  }
  // Delete function
  function deleter() {
    if (canDelete) {
      remover();
    } else {
      setTimeout(function() {
        deleter();
      }, 3000);
    }
  }
  // Auto delete
  setTimeout(function() {
    deleter();
  }, 8000);
}

// Helper function class changer
function classChanger(element, classOut, classIn, message, callback) {
  classList(element).remove(classIn).add(classOut);

  function messageIntroducer(message) {
    element.innerHTML = message;
    classList(element).add(classIn);
  }
  setTimeout(function() {
    messageIntroducer(message);
    if (callback) {
      callback();
    }
  }, 300);
}

var d_message_options = '<div id="d_link_domain">Don&rsquo;t nudge this site</div> (<div id="d_link_options">more options</div>)';
var m_message_options = '<div id="m_link_domain">Don&rsquo;t nudge this site</div> (<div id="m_link_options">more options</div>)';

function shareClick(element, toolTip, link) {
  $(element).on('click', link, function() {
    copyText();
    toolTip.innerHTML = 'Link copied to clipboard! Go share.';
  });
}

function optionsClick(element, link) {
  $(element).on('click', link, function() {
    chrome.runtime.sendMessage({
      type: "options"
    });
  });
} 

function domainClick(element, link, domain) {
  $(element).on('click', '#' + link, function() {
    linkDiv = document.getElementById(link);
    domainChange('domains_remove', domain);
    linkDiv.innerHTML = 'Won&rsquo;t nudge this site';
  });
}

function drawerMessagePlayer(element, clickNumber, domain) {
  if (clickNumber % 2 === 1) {
    classChanger(element, 'd_fade_out_down', 'd_fade_in_down', d_message_options);
    optionsClick(element, '#d_link_options');
    domainClick(element, 'd_link_domain', domain);
  } else {
    funName('d_link_share', function(message) {
      classChanger(element, 'd_fade_out_down', 'd_fade_in_down', message + '<div id="d_hover_window">Click to copy Nudge link to clipboard</div>', function() {
        var toolTip = document.getElementById('d_hover_window');
        shareClick(element, toolTip, '#d_link_share');
      });
    });
  }
}

function modalMessagePlayer(element, clickNumber, domain) {
  if (clickNumber % 2 === 1) {
    if (clickNumber > 2) {
      deleteEl(toolTip);
    }
    classChanger(element, 'fade_out_down', 'fade_in_down', m_message_options);
    optionsClick(element, '#m_link_options');
    domainClick(element, 'm_link_domain', domain);
  } else {
    if (clickNumber > 1) {
      toolTip = createEl(element.parentNode.parentNode, 'div', 'm_hover_window');
      toolTip.innerHTML = 'Click to copy Nudge link to clipboard';
      shareClick(element, toolTip, '#m_link_share');
    }
    funName('m_link_share', function(message) {
      classChanger(element, 'fade_out_down', 'fade_in_down', message);
    });
  }
}

function funName(divId, callback) {
  chrome.runtime.sendMessage({ type: "fun_name" }, function(response) {
    a = '<div id="';
    b = divId;
    c = '">Share Nudge with ';
    d = response.name;
    e = '</div>';
    var message = a + b + c + d + e;
    callback(message);
  });
}

function bgPicker(type) {
  switch (type) {
    case "visit":
      return bgImageVisit;
    case "time":
      return bgImageTime;
    case "compulsive":
      return bgImageCompulsive;
    case "scroll":
      return bgImageScroll;
    default:
      return;
  }
}

// Background image variables
//updated 25 march 2017 by ExtFo
if (window.devicePixelRatio > 1) {
  var bgImageVisit = "url(" + chrome.extension.getURL("resources/images/retina-images/visit@2x.png") + ") center center no-repeat";
  var bgImageTime = "url(" + chrome.extension.getURL("resources/images/retina-images/time@2x.png") + ") center center no-repeat";
  var bgImageScroll = "url(" + chrome.extension.getURL("resources/images/retina-images/scroll@2x.png") + ") center center no-repeat";
  var bgImageCompulsive = "url(" + chrome.extension.getURL("resources/images/retina-images/compulsive@2x.png") + ") center center no-repeat";
} else {
  var bgImageVisit = "url(" + chrome.extension.getURL("resources/images/visit.png") + ") center center no-repeat";
  var bgImageTime = "url(" + chrome.extension.getURL("resources/images/time.png") + ") center center no-repeat";
  var bgImageScroll = "url(" + chrome.extension.getURL("resources/images/scroll.png") + ") center center no-repeat";
  var bgImageCompulsive = "url(" + chrome.extension.getURL("resources/images/compulsive.png") + ") center center no-repeat";
}



// Set titles constant on case by case basis (should be done with object really)
function titleConstantizer(domain) {
  switch (domain) {
    case "facebook.com":
      return "Facebook";
    case "twitter.com":
      return "Twitter";
    case "pinterest.com":
      return "Pinterest";
    case "mail.google.com":
      return "Gmail";
    default:
      return document.title;
  }
}

function domainChange(type, domain) {
  chrome.runtime.sendMessage({ type: type, domain: domain }, function(response) {
    console.log(response);
  });
}

// setInterval(changeTitle,10000);

// function changeTitle() {
//   console.log('attempted');
//   document.title = "Test";
// }
