// A Processing.js lib version of the unit test code
(function() {
var __noop_func__ = function() {};

Processing.lib.MockExtensions = function() {
  // 3D
  this.OBJModel = function() {
    this.load = __noop_func__;
    this.draw = __noop_func__;
    this.drawMode = __noop_func__;
  };

  // Electronics
  this.INPUT = 0;
  this.OUTPUT = 0;
  this.HIGH = 0;
  this.BYTE = 0;
  this.pinMode = __noop_func__;
  this.digitalRead = function () { return 0; };
  this.Serial = function() { };
  this.Serial.print = __noop_func__;
  this.Serial.begin = __noop_func__;
  this.Servo = function() {
    this.attach = __noop_func__;  
    this.write = __noop_func__;  
  };

  // Mobile
  this.softkey = __noop_func__;
  this.multitap = __noop_func__;
  this.PClient = function() {
    this.GET = __noop_func__;
  }
  this.Sound = function() { };
  this.Sound.supportedTypes = function() { return []; };
  this.Phone = function() { };

  // Network
  this.Client = function() {
    this.write = __noop_func__;
    this.available = function() { return 0; };
    this.readString = __noop_func__;
  };
  this.Server = function() {
    this.write = __noop_func__;
    this.available = function() { return null; };
  };
  this.Log = {};
  this.Log.setDebug = __noop_func__;
  this.CarnivoreP5 = function() {
  };
  // Print
  this.beginRecord = __noop_func__;
  this.endRecord = __noop_func__;
  // Sound
  this.Ess = {};
  this.Ess.start = __noop_func__;
  this.AudioStream = function() {
    this.start = __noop_func__;
    this.buffer2 = [];
  };
  this.SineWave = this.TriangleWave = function() {
    this.phase = 0;
    this.generate = __noop_func__;
  };
  this.FadeIn = this.FadeOut = function() {
  };
  this.Envelope = this.Reverb = this.Normalize = function() {
    this.filter = __noop_func__;
  };
  this.AudioChannel = function() {
    this.frames = function() { return []; };
    this.initChannel = __noop_func__;
    this.play = __noop_func__;
    this.pan = __noop_func__;
    this.panTo = __noop_func__;
  };
  this.EPoint = function() {
  };
  this.FFT = function() {
    this.getSpectrum = __noop_func__;
    this.maxSpectrum = this.spectrum = [];
  };

  // Vision
  this.Capture = function() {
    this.available = function() { return null; };
  }
};

Processing.lib.MockExtensions.exports = [
  "OBJModel",
  "INPUT", "OUTPUT", "HIGH", "BYTE", "pinMode", "digitalRead", "Serial", "Servo",
  "softkey", "multitap", "PClient", "Sound", "Phone",
  "Client", "Server", "Log", "CarnivoreP5",
  "beginRecord", "endRecord",
  "AudioStream", "SineWave", "TriangleWave", "FadeIn", "FadeOut", "Envelope", "EPoint", "Ess", "AudioChannel", "Reverb", "Normalize", "FFT",
  "Capture"
];

})();

