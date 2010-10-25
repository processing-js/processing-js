// Instance libraries are useful in case if there is a need
// in knowing the processing instance

// Registering browser utility library
Processing.registerLibrary("browser", {
  attach: function(p) {
    p.clientWidth = 0;
    p.clientHeight = 0;

    p.windowResized = function() { };

    function updateSize() {
      p.clientWidth = document.body.clientWidth;
      p.clientHeight = document.body.clientHeight;
    }

    p.externals.onresize = function() { 
      updateSize(); 
      p.windowResized(); 
    };
 
    window.addEventListener("resize", p.externals.onresize, false);
    updateSize();
  },
  detach: function(p) {
    window.removeEventListener("resize", p.externals.onresize, false);
    delete p.externals.onresize;
  },
  exports : [ "clientWidth", "clientHeight", "windowResized" ]
});
