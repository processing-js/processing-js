/*
 * This code searches for all the <script type="application/processing" target="canvasid">
 * in your page and loads each script in the target canvas with the proper id.
 * It is useful to smooth the process of adding Processing code in your page and starting
 * the Processing.js engine.
 */

if (window.addEventListener) {
  window.addEventListener("load", function() {
    var scripts = document.getElementsByTagName("script");
 
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].type == "application/processing") {
        var src = scripts[i].getAttribute("target");
        var canvas;
        if (src && src.indexOf("#") > -1) {
          canvas = document.getElementById(src.substr(src.indexOf("#") + 1));
          if (canvas) {
            new Processing(canvas, scripts[i].text);
          }
        } else {
          canvas =  document.getElementsByTagName("canvas");;
          for (var j =0; j< canvas.length; j ++) {
            new Processing(canvas[j], scripts[i].text);
          }
        }       
      }
    }
  }, false);
}
