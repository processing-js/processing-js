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
                   bezierCurveTo: __empty_func__,
                   viewport: __empty_func__,
                   clearColor: __empty_func__,
                   enable: __empty_func__,
                   createShader: __empty_func__,
                   shaderSource: __empty_func__,
                   compileShader: __empty_func__,
                   getShaderParameter: function() { return true; },
                   getShaderInfoLog: __empty_func__,
                   createProgram: __empty_func__,
                   attachShader: __empty_func__,
                   linkProgram: __empty_func__,
                   getProgramParameter: function() { return true; }, 
                   useProgram: __empty_func__,
                   createBuffer: __empty_func__,
                   bindBuffer: __empty_func__,
                   bufferData: __empty_func__
                 };
  }
};

var WebGLFloatArray = __empty_func__;

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
var XMLHttpRequest = __empty_func__;
var setInterval = __empty_func__;
var clearInterval = __empty_func__;

var window = {
  setInterval: __empty_func__,
  XMLHttpRequest: __empty_func__
};

// Constructors not included in many parser tests to allow them to run
var Table = __empty_func__;
Table.prototype.getRowCount = __empty_func__;
Table.prototype.getTableMax = __empty_func__;

var FloatTable = __empty_func__;
FloatTable.prototype.getRowCount = __empty_func__;
FloatTable.prototype.getColumnCount = __empty_func__;
FloatTable.prototype.getRowNames = __empty_func__;
FloatTable.prototype.getTableMax = __empty_func__;

var FixedSpring     = __empty_func__;
var Spring2D        = __empty_func__;
var Particle        = __empty_func__;
var ArrowParticle   = __empty_func__;
var LimitedParticle = __empty_func__;
var GenParticle     = __empty_func__;
var DragButton      = __empty_func__;
var Button          = __empty_func__;
var Check           = __empty_func__;
var Radio           = __empty_func__;
var Scrollbar       = __empty_func__;
var SpinArm         = __empty_func__;
var EggRing         = __empty_func__;
var OverRect        = __empty_func__;
var OverCircle      = __empty_func__;
var SpinSpots       = __empty_func__;
