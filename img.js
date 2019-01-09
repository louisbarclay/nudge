// Utility script to make smaller versions of backgrounds

var sharp = require("sharp");
var fs = require("fs");

var dir = "extension/img/bg";
const bgDir = fs.readdirSync(dir);
console.log(bgDir);

var bgImages = [];

bgDir.forEach(function(item) {
  if (item.includes(".jpg")) {
    bgImages.push(item);
    var originalImage = sharp(fs.readFileSync(`${dir}/${item}`))
      .resize(200)
      .toBuffer()
      .then(data =>
        fs.writeFile(`${dir}/small/${item}`, data, "binary", function(err) {})
      )
      .catch(err => console.log(err));
    // var newImage = sharp(fs.readFileSync(`${dir}/${item}`))
    //   .resize(1920)
    //   .toBuffer()
    //   .then(data =>
    //     fs.writeFile(`${dir}/big/${item}`, data, "binary", function (err) { })
    //   )
    //   .catch(err => console.log(err));
  }
});

// Output a JS array of all bg files
fs.writeFile(
  `extension/js/bgImages.js`,
  `var bgImages = ${JSON.stringify(bgImages)};`,
  "binary",
  function(err) {}
);
