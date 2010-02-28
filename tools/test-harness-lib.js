// A Processing.js lib version of the unit test code
(function() {

Processing.lib.UnitTests = function() {
  this.UnitTests = function() {
    var _passCount   = 0,
        _failCount   = 0;

    this._pass = function() {
      _passCount++;
    };

    this._fail = function(msg) {
      print(msg);
      _failCount++;
    };

    // compareArrays() used under MIT License -- http://code.google.com/p/jqcommons/
    Array.prototype.compareArrays = function(arr) {
      if (this.length != arr.length)
        return false;

      for (var i = 0; i < arr.length; i++) {
        if (this[i].compareArrays) { // nested array?
          if (!this[i].compareArrays(arr[i]))
            return false;
          else
            continue;
        }
        if (this[i] != arr[i]) return false;
      }
      return true;
    };

    this._checkEqual = function(a, b) {
      if (a.compareArrays && b.compareArrays) {
        if (a.compareArrays(b))
          this._pass();
        else
          this._fail(a + " != " + b);
      } else {
        if (a != b)
          this._fail(a + " != " + b);
        else
          this._pass();
      }
    };

    this._checkNotEqual = function(a, b) {
      if (a.compareArrays && b.compareArrays) {
        if (a.compareArrays(b))
          this._fail(a + " == " + b);
        else
          this._pass();
      } else {
        if (a == b)
          this._fail(a + " == " + b);
        else
          this._pass();
      }
    };

    this._checkIsNaN = function(a) {
      if (a != a) // better check than isNaN()
        this._pass();
      else
        this._fail(a + " expected to be NaN.");
    };

    this._checkIsNull = function(a) {
      if (a == undefined) // == will cause check of undefined and null
        this._pass();
      else
        this._fail(a + " expected to be null (or undefined).");
    }

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
}

})();
