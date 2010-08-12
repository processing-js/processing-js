/*
 * This code searches for all the <script type="application/processing" target="canvasid">
 * in your page and loads each script in the target canvas with the proper id.
 * It is useful to smooth the process of adding Processing code in your page and starting
 * the Processing.js engine.
 */

if (window.addEventListener) {
  window.addEventListener("load", function() {
    var scripts = document.getElementsByTagName("script");
    var canvasArray = Array.prototype.slice.call(document.getElementsByTagName("canvas"));
    var canvas;
    for (var i = 0, j = 0; i < scripts.length; i++) {
      if (scripts[i].type == "application/processing") {
        var src = scripts[i].getAttribute("target");
        if (src && src.indexOf("#") > -1) {
          canvas = document.getElementById(src.substr(src.indexOf("#") + 1));
          if (canvas) {
            new Processing(canvas, scripts[i].text);
            for (var k = 0; k< canvasArray.length; k++)
            {
              if (canvasArray[k] === canvas) {
                // remove the canvas from the array so we dont override it in the else
                canvasArray.splice(k,1);
              }
            }
          }
        } else {    
          if (canvasArray.length >= j) {
            new Processing(canvasArray[j], scripts[i].text);          
          }
          j++;
        }       
      }
    }
  }, false);
}
