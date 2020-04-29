var hiddenSections = el("js-dropdown-contents")
var hiddenSectionsToggle = el("js-dropdown-button")

let showHiddenSections = false
hiddenSectionsToggle.onclick = function () {
  toggleClass(hiddenSections, "display-none")
  toggleClass(hiddenSectionsToggle, "expanded")

  if (showHiddenSections) {
    showHiddenSections = false
  } else {
    showHiddenSections = true
  }
}
