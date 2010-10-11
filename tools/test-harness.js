// Requires fake-dom.js, processing.js, and all generated tests in all_processing_tests
var _passCount   = 0,
    _failCount   = 0;

function _pass() {
  _passCount++;
}

function _fail(msg) {
  print(msg);
  _failCount++;
}

// compareArrays() used under MIT License -- based on http://code.google.com/p/jqcommons/
Array.prototype.compareArrays = function(arr, eps) {
  if (this.length != arr.length)
    return false;

  for (var i = 0; i < arr.length; i++) {
    if (this[i].compareArrays) { // nested array?
      if (!this[i].compareArrays(arr[i], eps))
        return false;
      else
        continue;
    }
    if ((!eps && this[i] != arr[i]) || (eps && (Math.abs(this[i] - arr[i]) > eps)))
      return false;
  }
  return true;
};

Array.prototype.toString = function () {
  var stringified = "";
  for (var i = 0; i < this.length; i++) {
    if (this[i].compareArrays) { //nested array?
      stringified += this[i].toString() + ",";
    }
    else {
      stringified += this[i] + ",";
    }
  }
  return ("[" +stringified.slice(0,-1) + "]");
};

function _checkEqual(a, b) {
  // If user passed a third arg (Epsilon) use it for ~=
  var eps = arguments[2] || 0;
  if(typeof a === "object" && typeof b === "object" && a.constructor === b.constructor
    && "toArray" in a && "toArray" in b) {
    a = a.toArray(); b = b.toArray();
  }
  if (a.compareArrays && b.compareArrays) {
    if (a.compareArrays(b, eps))
      _pass();
    else
      _fail(a + " != " + b);
  } else {
    if ((!eps && a != b) || (eps && (Math.abs(a - b) > eps)))
      _fail(a + " != " + b);
    else
      _pass();
  }
}

function _checkNotEqual(a, b) {
  if (a.compareArrays && b.compareArrays) {
    if (a.compareArrays(b))
      _fail(a + " == " + b);
    else
      _pass();
  } else {
    if (a == b)
      _fail(a + " == " + b);
    else
      _pass();
  }
}

function _checkTrue(a) {
  _checkEqual(a, true);
}

function _checkFalse(a) {
  _checkEqual(a, false);
}

function _checkIsNaN(a) {
  if (a != a) // better check than isNaN()
    _pass();
  else
    _fail(a + " expected to be NaN.");
}

function _checkIsNull(a) {
  if (a == undefined) // == will cause check of undefined and null
    _pass();
  else
    _fail(a + " expected to be null (or undefined).");
}

function _checkThrows(f) {
  var shouldThrow = (arguments.length === 2) ? !!arguments[1] : true;
  try {
    f();
    shouldThrow ? this._fail(f + " didn't throw as expected.") : this._pass();
  } catch (e) {
    shouldThrow ? this._pass() : this._fail(f + " should not have thrown exception, but did.");
  }
}

// Parser tests are automatically generated from Processing files to call this.
function _checkParser() {
  eval(new Processing(canvas, parserTest.body));
  _pass();
}

function _doSetup() {
  // Build a Processing environment we can test against.
  this._pctx = new Processing(canvas, '');

  if (this._setup)
    this._setup();
}

// Call the supplied test functions
function _testRunnerMain() {
  _doSetup();

  // if there's no _runTest, assume we need to test the parser. Pass Processing env.
  if (this._testWrapper)
    this._testWrapper(this._pctx);
  else
    _checkParser();

  if (this._finished)
    this._finished();

  print('TEST-SUMMARY: ' + _passCount + '/' + _failCount);
  try
  {
    var numbers = [];
    for(var i in __pjsCalledLines) {
      if(0|i > 0 && __pjsCalledLines[i]) { numbers.push(i); }
    }
    print('LINES-CALLED: ' + numbers.join(","));
  } catch(e) {}
};

_testRunnerMain();
