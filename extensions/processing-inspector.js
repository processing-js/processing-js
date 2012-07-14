/*

    I N S P E C T O R   F O R   P R O C E S S I N G . J S

    Part of the Processing.js project

    License       : MIT
    Web Site      : http://processingjs.org
    Github Repo.  : http://github.com/jeresig/processing-js
    Bug Tracking  : http://processing-js.lighthouseapp.com

*/
if(typeof ProcessingInspector === "undefined") {
  ProcessingInspector = (function() {
    return {

      /**
       * Get the top-level object that actually holds
       * the attribute we're interested in.
       */
      getOwner: function(object, attr) {
        if(object.$super) {
          var prev = object;
          while(object && typeof object[attr] !== "undefined") { 
            prev = object;
            object = object.$super; }
          return prev;
        } else if (object[attr]) {
          return object;
        }
        return false;
      },
    
      /**
       * Start monitoring a specific property on a Pjs object for changes.
       *
       * @param object The object to monitor
       * @param attr the property to monitor changes for
       * @param callback a callback function with signature (obj,attr,val) that gets called on changes
       */
      monitor: function(object, attr, callback) {
        object = this.getOwner(object, attr);
        if(object === false) {
          return false;
        }

        // kill off property
        var _cached = object[attr];
        delete(object[attr]);

        // Lift up this property using a closure
        props = (function(attr, v) {
           var lifted_value = v;
           props = {
             get : function() { return lifted_value; },
             set : function(v) {
                     if (v!=lifted_value) {
                       lifted_value = v;
                       callback(object, attr, v);
                     }
                   },
             configurable : true,
             enumerable : true };
           return props;
         }(attr, _cached));

        Object.defineProperty(object, attr, props);

        // make sure there's an unmonitor function
        object["__unmonitor__"] = function(attr) {
                                  // remove getter/setter again
                                  var _cached = object[attr];
                                  delete(this[attr]);
                                  var props = {
                                    configurable: true,
                                    enumerable: true,
                                    writable: true,
                                    value: _cached };
                                  Object.defineProperty(this, attr, props);
                                };
      },
      
      /**
       * We should be able to release monitored objects
       * at will, provided they can be released.
       */
      release: function(object, attr) {
        object = this.getOwner(object, attr);
        if(object["__unmonitor__"]) {
          object["__unmonitor__"](attr);
        }
      }
    };
  }());
}
else if(window && window.console && window.console.log) {
  window.console.log("ERROR: ProcessingInspector already exists.");
}