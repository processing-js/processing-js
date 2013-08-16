var fs = require("fs"),
    compressor = require("node-minify");

fs.readFile("processing.js", "utf8", function (err, data) {
  if (err) {
    return console.error("Error reading processing.js", err);
  }
  var fileSize = (new Buffer(data,"utf8")).length;
  if (fileSize > 0) {
    console.log("Minifying to processing.min.js");
    new compressor.minify({
      type: 'gcc',
      fileIn: 'processing.js',
      fileOut: 'processing.min.js'
    });
  }
});
