// Off elements that we care about
var off = "off-";
var js = "js-";
var dir = "img/bg/";
var dir_small = "small/";

var background = document.querySelector(`.${off}background`);
var backgroundEnhanced = document.querySelector(`.${off}background-enhanced`);

console.log(bgImages);

// Get the photos if exist in sync. Set them if not
function initOn() {
  chrome.runtime.sendMessage({
    type: "on",
    url,
    domain
  });
}

function randomiseBackground(array) {
  return array[Math.floor(Math.random() * array.length)];
}

var randomBackground = randomiseBackground(bgImages);

console.log(randomBackground);

function setBackground(element, image) {
  console.log('done');
  element.style.background = `url('${getUrl(
    `${dir}${image}`
  )}') center center/cover no-repeat`;
}

setBackground(background, `${dir_small}${randomBackground}`);

window.onload = function loadStuff() {
  img = new Image();

  console.log('asdf');
  // Assign an onload handler to the dummy image *before* assigning the src
  img.onload = function() {
    setBackground(backgroundEnhanced, `${randomBackground}`);
    toggleClass(background, `${off}background_animation`);
  };

  // Finally, trigger the whole preloading chain by giving source
  img.src = getUrl(`${dir}${randomBackground}`);
};

//   & background_no_filter
// // transition: filter 2s
// animation: fade_out 3s both
