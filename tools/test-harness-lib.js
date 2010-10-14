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

    this._checkEqual = function(a, b) {
      // If user passed a third arg (Epsilon) use it for ~=
      var eps = arguments[2] || 0;
      if(typeof a === "object" && typeof b === "object" && a.constructor === b.constructor
        && "toArray" in a && "toArray" in b) {
        a = a.toArray(); b = b.toArray();
      }
      if (a.compareArrays && b.compareArrays) {
        if (a.compareArrays(b, eps))
          this._pass();
        else
          this._fail(a + " != " + b);
      } else {
        if ((!eps && a != b) || (eps && (Math.abs(a - b) > eps)))
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
    };

    this._checkTrue = function(a) {
      this._checkEqual(!!a, true);
    };

    this._checkFalse = function(a) {
      this._checkEqual(!!a, false);
    };

    this._checkThrows = function(f) {
      var shouldThrow = (arguments.length === 2) ? !!arguments[1] : true;
      try {
        f();
        shouldThrow ? this._fail(f + " didn't throw as expected.") : this._pass();
      } catch (e) {
        shouldThrow ? this._pass() : this._fail(f + " should not have thrown exception, but did.");
      }
    };

    this._printTestSummary = function() {
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
  };
};

Processing.lib.UnitTests.exports = ["UnitTests", "__sketch",
  "_pass","_fail","_checkEqual","_checkNotEqual","_checkIsNaN","_checkIsNull",
  "_checkTrue","_checkFalse","_checkThrows","_printTestSummary"];

})();

