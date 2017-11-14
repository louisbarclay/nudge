var arrows = document.getElementsByClassName("arrow");

console.log(arrows);

for (var i = 0; i < arrows.length; i++) {
  arrows[i].onclick = function() {
    window.scroll({
      top: 1000,
      left: 0,
      behavior: "smooth"
    });
  };
}
