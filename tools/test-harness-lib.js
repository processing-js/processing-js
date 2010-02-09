// A Processing.js lib version of the unit test code
(function() {

  Processing.lib.UnitTests = function() {
    var _passCount   = 0,
        _failCount   = 0;

    this._pass = function() {
      _passCount++;
    };

    this._fail = function(msg) {
      print(msg);
      _failCount++;
    };

    this._checkEqual = function(a, b) {
      if (a != b)
        this._fail(a + " != " + b);
      else
        this._pass();
    };

    this._checkNotEqual = function(a, b) {
      if (a == b)
        this._fail(a + " == " + b);
      else
        this._pass();
    };

    this._checkTrue = function(a) {
      this._checkEqual(a, true);
    };

    this._checkFalse = function(a) {
      this._checkEqual(a, false);
    };

    this._checkThrows = function(f) {
      try {
        f();
        this._fail(f + " didn't throw as expected.");
      } catch (e) {
        this._pass();
      }
    };

    this._printTestSummary = function() {
      print('TEST-SUMMARY: ' + _passCount + '/' + _failCount);
    };
  }

})();
