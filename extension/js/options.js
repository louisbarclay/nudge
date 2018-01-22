var addDomain = document.getElementById("addDomain");
var tags = document.getElementById("domainList");
var id_button = document.getElementById("id");
var domains = {};
var facebookNotif = document.getElementById("facebookNotif");

sendHTMLRequest(getUrl("html/welcome.html"), storeForUse);

getSettings(execSettings);

var settingsLocal = {};

function execSettings(settings) {
  settingsLocal = settings;
  populateDomains(settings.domains);
  populateBooleans(settings);
  // Reset
  changeSettingRequest(0, "show_intro");
  if (settingsLocal.show_intro < 4) {
    // el("welcome").innerHTML = tempStorage["welcome.html"];
    console.log("yeah");
    var increaseCounter = settingsLocal.show_intro++;
    // changeSettingRequest(increaseCounter, "show_intro");
  }
  id_button.innerHTML = settings.userId;
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
    var passedCheck = true;
    // Existing domain check
    Object.keys(settingsLocal.domains).forEach(function(key) {
      if (newDomain.includes(key)) {
        console.log("already exists there");
        passedCheck = false;
        var listElements = document.getElementsByTagName('li');
        for (var i = 0; i < listElements.length; i++) {
          console.log(listElements[i].innerHTML, key);
          if (listElements[i].innerHTML === key) {
            console.log(listElements[i]);
            toggleClass(listElements[i], 'options-flash');
            break;
          }
        }
      }
    });
    // Regex check
    if (domainCheck.test(newDomain) && passedCheck) {
      addLi(newDomain);
      changeSettingRequest(true, "domains", newDomain, "add");
      addDomain.value = "";
    } else {
      console.log("wrong format");
    }
  }
});

function addLi(domain) {
  var li = document.createElement("li");
  li.innerHTML = domain;
  li.id = "li" + getRandomInt(1000, 10000);
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
  var bgStyle =
    '{ color: red; border: 3px; background: url("http://www.google.com/s2/favicons?domain=www.' +
    domain +
    '") 16px 16px; }';
  styleAdder("#" + elementId + ":before", bgStyle);
}
