module.exports = (function testHarness() {

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

  var UnitTests = {
    _passCount: 0,
    _failCount: 0,
    _curTest: "",
    _checkCount: 0,

    prep: function(testName) {
      this._passCount = 0;
      this._failCount = 0;
      this._checkCount = 0;
      this._curTest = testName;
    },

    _print: function(msg) {
      console.log("    [" + this._curTest + "/" + this._checkCount + "] " + msg);
    },

    _pass: function() {
      this._passCount++;
    },

    _fail: function(msg) {
      this._print(msg);
      this._failCount++;
    },

    _checkEqual: function(a, b) {
      this._checkCount++;
      // If user passed a third arg (Epsilon) use it for ~=
      var eps = arguments[2] || 0;
      if(typeof a === "object" && typeof b === "object" && a.constructor === b.constructor && "toArray" in a && "toArray" in b) {
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
    },

    _checkNotEqual: function(a, b) {
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
    },

    _checkIsNaN: function(a) {
      if (a != a) // better check than isNaN()
        this._pass();
      else
        this._fail(a + " expected to be NaN.");
    },

    _checkIsNull: function(a) {
      if (a === null || a === undefined)
        this._pass();
      else
        this._fail(a + " expected to be null (or undefined).");
    },

    _checkTrue: function(a) {
      this._checkEqual(!!a, true);
    },

    _checkFalse: function(a) {
      this._checkEqual(!!a, false);
    },

    _checkThrows: function(f) {
      var shouldThrow = (arguments.length === 2) ? !!arguments[1] : true,
          result;
      try {
        f();
        result = shouldThrow ? this._fail(f + " didn't throw as expected.") : this._pass();
      } catch (e) {
        result = shouldThrow ? this._pass() : this._fail(f + " should not have thrown exception, but did.");
      }
    },

    _printTestSummary: function() {
      this._print('TEST-SUMMARY: ' + this._passCount + '/' + this._failCount);
      try
      {
        var numbers = [];
        for(var i in __pjsCalledLines) {
          if(0|i > 0 && __pjsCalledLines[i]) { numbers.push(i); }
        }
        this._print('LINES-CALLED: ' + numbers.join(","));
      } catch(e) {}
    }
  };

  return UnitTests;

}());
