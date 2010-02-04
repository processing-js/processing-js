// This is a simple set of unit tests to demonstrate
// how to write unit tests for Processing.js code.

// The _setup() function is optional, and if defined is
// called once before _runTest().
function _setup() {
  // do your setup here, maybe initializing test data...
}

// The _finished() function, like _setup() is optional
// and if defined, is called once _runTest() is done.
function _finished() {
  // do whatever clean-up you need to here...
}

// This is the main entry point for your test.  This
// function will be called once.
function _runTest() {
  // Your test can include many small checks.  Each of the
  // various types of checks you can do are demonstrated.

  _checkEqual(2, add(1, 1));
  _checkNotEqual(3, add(1, 1));
  _checkTrue(true);
  var t = true;
  _checkTrue(t);
  _checkFalse(false);

  // Checking that a function throws, give the function name
  _checkThrows(thisThrows);
}

function add(a, b) {
  return a + b;
}

// demonstrating a function that throws
function thisThrows() {
  throw "Error";
}
