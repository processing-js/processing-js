// Processing works with a canvas and the DOM, fake it.
// This is enough of the DOM to allow the parser work.

var __empty_func__ = function () {};
var __elem_func__ = function() { return elem };

var navigator = { useragent: true };

var canvas = {
  setAttribute: __empty_func__,
  attachEvent: __empty_func__,
  addEventListener: __empty_func__,
  appendChild: __elem_func__,
  removeChild: __empty_func__,
  getContext:  function() {
                 return {
                   translate: __empty_func__,
                   attachEvent: __empty_func__,
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
                   bufferData: __empty_func__,
                   blendFunc: __empty_func__,
                   getAttribLocation: __empty_func__,
                   vertexAttribPointer: __empty_func__,
                   enableVertexAttribArray: __empty_func__,
                   getUniformLocation: __empty_func__,
                   uniform1f: __empty_func__,
                   uniform2f: __empty_func__,
                   uniform3f: __empty_func__,
                   uniform4f: __empty_func__,
                   uniformfv: __empty_func__,
                   uniform2fv: __empty_func__,
                   uniform3fv: __empty_func__,
                   uniform1i: __empty_func__,
                   uniform2i: __empty_func__,
                   uniform3i: __empty_func__,
                   uniform4i: __empty_func__,
                   getImageData: function() { return {width:1, height: 1, data:[1,2,3,4]}; },
                   createImageData: function() { return {width:1, height: 1, data:[1,2,3,4]}; },
                   drawImage: __empty_func__,
                   putImageData: __empty_func__
                 };
  },
  style: {
    setProperty: __empty_func__
  }
};
 
var WebGLFloatArray = __empty_func__;
var HTMLImageElement = __empty_func__;

var document = {
  fake: true,
  attachEvent: __empty_func__,
  body: {
    style: {
      cursor: {}
    }
  },
  appendChild: __elem_func__,
  removeChild: __empty_func__,
  getElementById: __empty_func__,
  getElementByTagName: function() { return canvas; },
  createElement: function () { return canvas },
  addEventListener: __empty_func__,
  documentElement: {
    appendChild: __elem_func__,
    removeChild: __empty_func__,
    style: {
      paddingBottom: 0
    },
    insertBefore: __empty_func__
  },
  createTextNode: __empty_func__
};

var elem = {
  appendChild: __elem_func__,
  removeChild: __empty_func__,
  style: {}
};
 
var addEventListener = __empty_func__;
var XMLHttpRequest = __empty_func__;
var setInterval = __empty_func__;
var clearInterval = __empty_func__;
 
var window = {
  appendChild: __elem_func__,
  removeChild: __empty_func__,
  setInterval: __empty_func__,
  XMLHttpRequest: __empty_func__,
  print: print,
  document: document,
  createElement: function() { return elem; },
  setTimeout: __empty_func__
};

window.XMLHttpRequest.prototype.open = __empty_func__;
window.XMLHttpRequest.prototype.send = __empty_func__;
window.XMLHttpRequest.prototype.responseText = "some text";

var Image = __empty_func__;

// Constructors not included in many parser tests to allow them to run
var Table = __empty_func__;
Table.prototype.getRowCount = __empty_func__;
Table.prototype.getTableMax = __empty_func__;
 
var FloatTable = __empty_func__;
FloatTable.prototype.getRowCount = __empty_func__;
FloatTable.prototype.getColumnCount = __empty_func__;
FloatTable.prototype.getRowNames = function() { return ["2004","2005", "2006", "2007", "2008", "2009", "2010"]; };
FloatTable.prototype.getTableMax = function() { return 4; };

var OBJModel        = __empty_func__;
OBJModel.prototype.load = __empty_func__;

var Serial          = __empty_func__;
Serial.begin = __empty_func__;

var WordMap         = __empty_func__;
WordMap.prototype.addWord = __empty_func__;
WordMap.prototype.finishAdd = __empty_func__;

var Treemap         = __empty_func__;
Treemap.prototype.draw = __empty_func__;

var FixedSpring     = __empty_func__;
var Spring2D        = __empty_func__;
var Particle        = __empty_func__;
var ArrowParticle   = __empty_func__;
var LimitedParticle = __empty_func__;
var GenParticle = __empty_func__;
var DragButton = __empty_func__;
var Button = __empty_func__;
var Check = __empty_func__;
var Radio = __empty_func__;
var Scrollbar = __empty_func__;
var SpinArm = __empty_func__;
var EggRing = __empty_func__;
var OverRect = __empty_func__;
var OverCircle = __empty_func__;
var SpinSpots = __empty_func__;


var SearchClient = __empty_func__;
var WebSearchRequest = __empty_func__;
