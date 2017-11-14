// Copyright 2016, Nudge, All rights reserved.

$(document).ready(function() {
  try {
    ad();
  } catch (error) {
    // Error catching
  }
});

console.log('shit running');

var container = null;

// Load the UI
function ad() {
  if (!document.getElementById('container') && document.getElementById('pagelet_composer')) {
    var existingElement = document.getElementById('pagelet_composer');
    container = createEl(existingElement, 'div', 'container');
    console.log('created element')
    container.innerHTML = '<div id="close"></div><div id="logo"></div><div id="off">Save a friend from the News Feed:<br><b>nudgeware.io</b>' +
  '</div>';
    console.log('set inner html');
    styleAdder(pageletObj.name, pageletShowStyle);
    $(container).on('click', '#close', function() {
      styleAdder(pageletObjbefore.name, pageletBeforeDelete);
      deleteEl(container);
    });
  }
}

// function for adding a link. includes:
// the text of the link
// what the link does
// text to change the link to once done
// styling? needs to be a default lnk style that you always use. hover, pointer etc., no underline

var pageletHideStyle = "{ opacity: 1; }";
var pageletShowStyle = "{ opacity: 1; }";

var pageletObjbefore = {name: 'pagelet_composer:before', type: 'id', domain: 'facebook.com'};
var pageletBeforeStyle = `
{
  opacity: 1;
  content: "";
  display: block;
  position: absolute;
  z-index: 1;
  width: 100%;
  height: 155px;
  background-color: #ffffff;
  text-align: center;
  border: 1px solid;
  border-color: #e5e6e9 #dfe0e4 #d0d1d5;
  border-radius: 4px;
  top: -1px;
  bottom: -1px;
  left: -1px;
  right: -1px; }
`;

var pageletBeforeDelete = '{ content: none; }';

var pageletObj = {name: 'pagelet_composer', type: 'id', domain: 'facebook.com'};

function modifyElFromStart(object, style) {
  var loc = document.location.href;
  document.addEventListener('DOMSubtreeModified', injectCSS, false);
  function injectCSS() {
    if(document.head) {
      document.removeEventListener('DOMSubtreeModified', injectCSS, false);
      console.log('here1');
      styleAdder(object.name, style);
    }
  }
}

modifyElFromStart(pageletObjbefore, pageletBeforeStyle);
modifyElFromStart(pageletObj, pageletHideStyle);

// for (var i = 0; i < arrayOfIds.length; i++) {
//   modifyElFromStart(arrayOfIds[i]);
// }

// need image caching to make sure the nudge logo is there from the start. :) 


// probably need to do stylesheet reset here.
// position the question mark relative to the original div, using similar techniques to the close button above
// overflow allowed.