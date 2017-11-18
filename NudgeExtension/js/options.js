var addDomain = document.getElementById("addDomain");
var tags = document.getElementById("domainList");
var domains = [
  "amazon.co.uk",
  "amazon.com",
  "bbc.co.uk",
  "bbc.com",
  "buzzfeed.com",
  "dailymail.co.uk",
  "diply.com",
  "facebook.com",
  "imgur.com",
  "instagram.com",
  "iwastesomuchtime.com",
  "linkedin.com",
  "mailonline.com",
  "messenger.com",
  "netflix.com",
  "pinterest.com",
  "reddit.com",
  "telegraph.co.uk",
  "theguardian.co.uk",
  "theguardian.com",
  "theladbible.com",
  "thesportbible.com",
  "tumblr.com",
  "twitter.com",
  "youtube.com"
];

addDomain.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    var newDomain = addDomain.value;
    addLi(newDomain);
    addDomain.value = '';
  }
});

function addLi(domain) {
  var li = document.createElement("li");
  li.innerHTML = domain;
  li.id = "li" + getRandomInt(1000, 10000);
  tags.appendChild(li);
  loadFavicon(li.id, domain);
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

for (var i = 0; i < domains.length; i++) {
  addLi(domains[i]);
}

function loadFavicon(elementId, domain) {
  var bgStyle =
    '{ color: red; border: 3px; background: url("http://www.google.com/s2/favicons?domain=www.' +
    domain +
    '") 16px 16px; }';
  styleAdder("#" + elementId + ":before", bgStyle);
}