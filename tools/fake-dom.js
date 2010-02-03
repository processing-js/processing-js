// Processing works with a canvas and the DOM, fake it.
var __empty_func__ = function () {};

var canvas = {
  attachEvent: __empty_func__,
  addEventListener: __empty_func__,
  getContext:  function() {
                 return {
                   translate: __empty_func__,
                   attachEvent: __empty_func__,
                   getImageData: __empty_func__,
                   fillRect: __empty_func__,
                   beginPath: __empty_func__,
                   moveTo: __empty_func__,
                   lineTo: __empty_func__,
                   rect: __empty_func__,
                   save: __empty_func__,
                   stroke: __empty_func__,
                   fill: __empty_func__,
                   rotate: __empty_func__,
                   closePath: __empty_func__,
                   arc: __empty_func__,
                   scale: __empty_func__,
                   restore: __empty_func__,
                   bezierCurveTo: __empty_func__
                 };
  }
};

// This is enough of the DOM to allow the parser work.
var document = {
  attachEvent: __empty_func__,
  body: {
    style: {
      cursor: {}
    }
  },
  getElementByTagName: function() { return canvas; },
  createElement: function () { return canvas },
  addEventListener: __empty_func__
};

var addEventListener = __empty_func__;

var setInterval = __empty_func__;

var XMLHttpRequest = __empty_func__;

var window = {
  setInterval: __empty_func__,
  XMLHttpRequest: __empty_func__
};
