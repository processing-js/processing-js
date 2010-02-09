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

function _checkEqual(a, b) {
  if (a != b)
    _fail(a + " != " + b);
  else
    _pass();
}

function _checkNotEqual(a, b) {
  if (a == b)
    _fail(a + " == " + b);
  else
    _pass();
}

function _checkTrue(a) {
  _checkEqual(a, true);
}

function _checkFalse(a) {
  _checkEqual(a, false);
}

function _checkThrows(f) {
  try {
    f();
    _fail(f + " didn't throw as expected.");
  } catch (e) {
    _pass();
  }
}

// Parser tests are automatically generated from Processing files to call this.
function _checkParser() {
  eval(Processing(canvas, parserTest.body));
  _pass();
}

function _doSetup() {
  // Build a Processing environment we can test against.
  this._pctx = Processing(canvas, '');

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
};

_testRunnerMain();
