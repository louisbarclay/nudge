var addDomain = document.getElementById("addDomain");
var tags = document.getElementById("domainList");
var id_button = document.getElementById("id");
var domains = {};
var facebookNotif = document.getElementById("facebookNotif");
var blankFaviconString = "";

imgSrcToDataURL(chrome.runtime.getURL("img/favicon/blankfavicon.png"), function(
  dataUrl
) {
  blankFaviconString = dataUrl;
  console.log(blankFaviconString);
});

sendHTMLRequest(getUrl("html/pages/welcome.html"), function(url, response) {
  storeForUse(url, response);
  getSettings(execSettings);
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log(request);
  if (request.type === "send_settingsLocal") {
    settingsLocal = request.settingsLocal;
    console.log(settingsLocal);
  }
});

var settingsLocal = {};

function execSettings(settings) {
  settingsLocal = settings;
  populateDomains(settings.domains);
  populateBooleans(settings);
  // Reset
  // changeSettingRequest(0, "show_intro");
  console.log(settingsLocal.show_intro);
  if (settingsLocal.show_intro < 2) {
    el("welcome").innerHTML = tempStorage["welcome.html"];
    handleWelcomeBoolean(settings);
    var increaseCounter = settingsLocal.show_intro + 1;
    changeSettingRequest(increaseCounter, "show_intro");
  }
  id_button.innerHTML = settings.userId;
}

function updateLocalSettings(settings) {
  settingsLocal = settings;
}

function populateDomains(domains) {
  Object.keys(domains).forEach(function(key) {
    if (domains[key].nudge) {
      addLi(key);
    }
  });
}

function populateBooleans(settings) {
  var booleans = document.getElementsByClassName("boolean");
  Array.from(booleans).forEach(function(item) {
    if (keyDefined(settings, item.id)) {
      handleBoolean(item.id);
      // If not already on the right setting, change it
      if (!settings[item.id]) {
        toggleBoolean(item.id);
      }
    }
  });
}

function handleBoolean(id) {
  var div = document.getElementById(id);
  var button = div.childNodes[1];
  button.onclick = function() {
    toggleBoolean(id);
    changeSettingRequest("toggle", id);
  };
}

function handleWelcomeBoolean(settings) {
  if (!settings["share_data"]) {
    toggleBoolean("share_data2");
  }
  var welcomeBoolean = el("share_data2");
  console.log(welcomeBoolean);
  var button = welcomeBoolean.childNodes[1];
  button.onclick = function() {
    toggleBoolean("share_data2");
    toggleBoolean("share_data");
    changeSettingRequest("toggle", "share_data");
  };
}

function toggleBoolean(id) {
  var div = document.getElementById(id);
  var button = div.childNodes[1];
  var left = button.childNodes[0];
  var right = button.childNodes[1];
  toggleClass(left, "on");
  toggleClass(right, "on");
}

addDomain.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    var newDomain = addDomain.value;
    var domainCheck = new RegExp(
      "^(([a-zA-Z]{1})|([a-zA-Z]{1}[a-zA-Z]{1})|([a-zA-Z]{1}[0-9]{1})|([0-9]{1}[a-zA-Z]{1})|([a-zA-Z0-9][a-zA-Z0-9-_]{1,61}[a-zA-Z0-9])).([a-zA-Z]{2,6}|[a-zA-Z0-9-]{2,30}.[a-zA-Z]{2,3})(/(([a-zA-Z]{1})|([a-zA-Z]{1}[a-zA-Z]{1})|([a-zA-Z]{1}[0-9]{1})|([0-9]{1}[a-zA-Z]{1})|([a-zA-Z0-9][a-zA-Z0-9-_]{1,200}[a-zA-Z0-9]))?)?(/)?$"
    );
    var isInDomainList = false;
    var nudge = true;
    if (domainCheck.test(newDomain)) {
      Object.keys(settingsLocal.domains).forEach(function(key) {
        if (newDomain.includes(key)) {
          isInDomainList = true;
          nudge = settingsLocal.domains[key].nudge;
          newDomain = key;
        }
      });
      if (isInDomainList && nudge) {
        console.log("in domain list and is nudge");
        var listElements = document.getElementsByTagName("li");
        for (var i = 0; i < listElements.length; i++) {
          if (listElements[i].innerHTML === newDomain) {
            toggleClass(listElements[i], "options-flash");
            break;
          }
        }
        addDomain.value = "";
      } else if (isInDomainList && !nudge) {
        console.log("in domain list and is not nudge");
        addLi(newDomain);
        changeSettingRequest(true, "domains", newDomain, "nudge");
        addDomain.value = "";
      } else if (!isInDomainList) {
        console.log("not in domain list");
        addLi(newDomain);
        changeSettingRequest(true, "domains", newDomain, "add");
        addDomain.value = "";
      }
    }
  }
});

function addLi(domain) {
  var li = document.createElement("li");
  li.innerHTML = domain;
  li.id = "li" + getRandomInt(1000, 10000000000000);
  tags.appendChild(li);
  loadFavicon(li.id, domain);
  removeDomainOnClick(li, domain);
}

function removeDomainOnClick(li, domain) {
  li.onclick = function() {
    deleteEl(li);
    changeSettingRequest(false, "domains", domain, "nudge");
  };
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

var items = tags.getElementsByTagName("li");

function styleAdder(id, style) {
  var styleText = id + style;
  style = document.createElement("style");
  style.innerHTML = styleText;
  document.head.appendChild(style);
}

function loadFavicon(elementId, domain) {
  var faviconUrl = `http://www.google.com/s2/favicons?domain=${domain}`;
  imgSrcToDataURL(faviconUrl, function(dataUrl) {
    if (dataUrl === blankFaviconString) {
      console.log(domain);
    }
  });
  function updateFavicon() {
    var bgStyle = `{ color: red; border: 3px; background: url("http://www.google.com/s2/favicons?domain=${domain}") 16px 16px; }`;
    styleAdder("#" + elementId + ":before", bgStyle);
  }
  updateFavicon();
}

// Disabling auto-complete for now because pressing 'Enter' shows strange behaviour
// because the field is already waiting for an 'Enter' hit
// $(function() {
//   $("#addDomain").suggest(suggestDomains, {
//     suggestionColor: "#cccccc",
//     moreIndicatorClass: "suggest-more",
//     moreIndicatorText: "&hellip;"
//   });
// });