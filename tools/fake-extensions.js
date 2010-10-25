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

  // Constructors not included in many parser tests to allow them to run
  this.Table = __noop_func__;
  this.Table.prototype.getRowCount = __noop_func__;
  this.Table.prototype.getTableMax = __noop_func__;
   
  this.FloatTable = __noop_func__;
  this.FloatTable.prototype.getRowCount = __noop_func__;
  this.FloatTable.prototype.getColumnCount = __noop_func__;
  this.FloatTable.prototype.getColumnName = function() { return "name"; };
  this.FloatTable.prototype.getRowNames = function() { return ["2004","2005", "2006", "2007", "2008", "2009", "2010"]; };
  this.FloatTable.prototype.getTableMax = function() { return 4; };

  this.WordMap         = __noop_func__;
  this.WordMap.prototype.addWord = __noop_func__;
  this.WordMap.prototype.finishAdd = __noop_func__;

  this.Treemap         = __noop_func__;
  this.Treemap.prototype.draw = __noop_func__;

  this.FixedSpring     = __noop_func__;
  this.Spring2D        = __noop_func__;
  this.Particle        = __noop_func__;
  this.ArrowParticle   = __noop_func__;
  this.LimitedParticle = __noop_func__;
  this.GenParticle = __noop_func__;
  this.DragButton = __noop_func__;
  this.Button = __noop_func__;
  this.Check = __noop_func__;
  this.Radio = __noop_func__;
  this.Scrollbar = __noop_func__;
  this.SpinArm = __noop_func__;
  this.EggRing = __noop_func__;
  this.OverRect = __noop_func__;
  this.OverCircle = __noop_func__;
  this.SpinSpots = __noop_func__;
  this.ModuleA = __noop_func__;
  this.ModuleB = __noop_func__;

  this.Branch = function() {
    this.checkForParents = __noop_func__;
  };
  this.Segment = function() {
    this.setBranch = __noop_func__;
    this.setParamsFromBranch = __noop_func__;
    this.adjustAngle = __noop_func__;
    this.adjustDepth = __noop_func__;
    this.setFutureToOrigin = __noop_func__;
    this.setLength = __noop_func__;
    this.scaleFutureLength = __noop_func__;
  };

  this.SearchClient = __noop_func__;
  this.WebSearchRequest = __noop_func__;

  this.Integrator = this.ColorIntegrator = this.BoundsIntegrator = function() {
    this.target = __noop_func__;
    this.update = __noop_func__;
  };
  this.Place  = function() {
  };
  this.Slurper  = function() {
  };
  this.RankedLongArray = function() {
  };
  this.FolderItem = function() {
  };
  this.FileItem = function() {
  };
  this.SwingUtilities = {};
  this.SwingUtilities.invokeLater = __noop_func__;
  this.File = function() {
  };
  this.Node = function() {
    this.increment = __noop_func__;
  };
  this.Edge = function() {
    this.increment = __noop_func__;
  };
};

Processing.lib.MockExtensions.exports = [
  "OBJModel",
  "INPUT", "OUTPUT", "HIGH", "BYTE", "pinMode", "digitalRead", "Serial", "Servo",
  "softkey", "multitap", "PClient", "Sound", "Phone",
  "Client", "Server", "Log", "CarnivoreP5",
  "beginRecord", "endRecord",
  "AudioStream", "SineWave", "TriangleWave", "FadeIn", "FadeOut", "Envelope", "EPoint", "Ess", "AudioChannel", "Reverb", "Normalize", "FFT",
  "Capture",
  "Table", "FloatTable", "WordMap", "Treemap", 
  "FixedSpring", "Spring2D", "Particle", "ArrowParticle", "LimitedParticle", "GenParticle", "DragButton", "Button", "Check", "Radio", "Scrollbar", "SpinArm", "EggRing", "OverRect", "OverCircle", "SpinSpots", "ModuleA", "ModuleB", "Branch", "Segment", "Mass", "Spring", "Control", 
  "SearchClient", "WebSearchRequest",
  "Integrator", "ColorIntegrator", "Place", "Slurper",
  "RankedLongArray", "BoundsIntegrator", "FolderItem", "FileItem", "SwingUtilities",
  "File", "Node", "Edge"
];

})();

