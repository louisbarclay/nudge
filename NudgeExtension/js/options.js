var addDomain = document.getElementById("addDomain");
var tags = document.getElementById("domainList");
var id_button = document.getElementById("id");
var domains = {};
var facebookNotif = document.getElementById("facebookNotif");

console.log(facebookNotif.childNodes[1].childNodes);

change('facebookNotif');

function change(id) {
  var div = document.getElementById(id);
  var button = div.childNodes[1];
  var left = button.childNodes[0];
  var right = button.childNodes[1];
  button.onclick = function() {
    toggleClass(left, "on");
    toggleClass(right, "on");
    console.log('change option here');
    confirmSave();
  };
}

syncSettingsGet(populateDomains);

function confirmSave(element) {
  console.log("setting saved");
}

function populateDomains(item) {
  console.log(item);
  domains = item.settings.domains;
  Object.keys(domains).forEach(function(key) {
    if (domains[key].nudge) {
      addLi(key);
    }
  });
  var id = item.settings.userId;
  id_button.innerHTML = id;
}

addDomain.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    var newDomain = addDomain.value;
    addLi(newDomain);
    addDomain.value = "";
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
    sendMessage("domains_remove", { domain });
    confirmSave();
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
