// Copyright 2016, Nudge, All rights reserved.

var t = document.querySelector(".custom-slider-button");
var tc = document.querySelector(".custom-slider-button-centre");

console.log(t,tc);

var slidertext = document.querySelector(".slider-text");

t.addEventListener('mousedown', sliderdown, true);

function sliderdown(e) {
  t.classList.remove("returning");
  t.classList.add("active");
  tc.classList.add("active");
  // bind late
  document.addEventListener('mouseup', sliderup, true);
  document.addEventListener('mousemove', slidermove, true);
}

function sliderup(e) {
  var newpos = e.clientX - t.parentElement.offsetLeft - (t.offsetWidth/2);
  t.classList.remove("active");
  tc.classList.remove("active");
  // unbind
  document.removeEventListener('mousemove', slidermove, true);
  document.removeEventListener('mouseup', sliderup, true);
  if ( newpos > (t.parentElement.offsetWidth - t.offsetWidth)) {
    t.style.left = t.parentElement.offsetWidth - t.offsetWidth +'px';
    tc.classList.add("done");
  } else {
    t.style.left = 0 +'px';
    t.classList.add("returning");
  }
}

function slidermove(e) {
  var newpos = e.clientX - t.parentElement.offsetLeft - (t.offsetWidth/2);
  if (newpos < 0) {
    newpos = 0; 
  } else if ( newpos >= (t.parentElement.offsetWidth - t.offsetWidth)) {
    newpos = t.parentElement.offsetWidth - t.offsetWidth;
    slidertext.classList.remove("h3");
    slidertext.classList.add("h4");
    slidertext.innerHTML = "Release mouse to turn Facebook back on";
  } else if ( newpos < (t.parentElement.offsetWidth - t.offsetWidth)) {
    slidertext.classList.remove("h4");
    slidertext.classList.add("h3");
    slidertext.innerHTML = "Slide right to turn Facebook back on";    
  }
  t.style.left = newpos +'px';
}