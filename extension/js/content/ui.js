// // Stuff for test page
if (document.getElementById("nudge-test-input")) {
  // Switch this on to always have something showing
  cornerInit(4000, 16, "facebook.com");
  // Or switch this on to control it
  // document.getElementById("nudge-test-input").oninput = function () {
  //   cornerInit(
  //     parseInt(document.getElementById("nudge-test-input").value),
  //     19,
  //     "guardian.co.uk"
  //   );
  // };
  insertScroll();
}

if (document.getElementById("show")) {
  document.getElementById("show").onclick = function () {
    var scrollValue = 15;


    if (document.getElementById("nudge-test-input").value.length > 0) {
      scrollValue = parseInt(document.getElementById("nudge-test-input").value)
    }

    scrollCycle(scrollValue)
  }
}