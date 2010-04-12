// This is the main entry point for your test.  This
// function will be called once.
function _runTest() {
  // Your test can include many small checks.  Each of the
  // various types of checks you can do are demonstrated.

  _checkEqual(2, 2);
  _checkEqual("2", "2");
  _checkEqual(true, true);
  _checkEqual([1,2,3], [1,2,3]);
  _checkEqual([[1,2],[3,4]], [[1,2],[3,4]]);

  _checkNotEqual(3, 2);
  _checkNotEqual("3", "2");
  _checkNotEqual(true, false);
  _checkNotEqual([1,2,3], [4,5,6]);
  _checkNotEqual([[1,2],[3,4]], [[1,2],[3,5]]);

  _checkIsNaN(NaN);
  _checkIsNull(null);
  _checkIsNull(undefined); // null and undefined both return true

  // Checking that a function throws, give the function name
  _checkThrows(thisThrows);
  _checkThrows(function() { return; }, false); // this shouldn't throw 
}

// demonstrating a function that throws
function thisThrows() {
  throw "Error";
}

