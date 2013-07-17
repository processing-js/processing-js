/**
 * Common functions traditionally on "p" that should be class functions
 * that get bound to "p" when an instance is actually built, instead.
 */
module.exports = (function commonFunctions(undef) {

  var CommonFunctions = {
    /**
     * Remove whitespace characters from the beginning and ending
     * of a String or a String array. Works like String.trim() but includes the
     * unicode nbsp character as well. If an array is passed in the function will return a new array not effecting the array passed in.
     *
     * @param {String} str    the string to trim
     * @param {String[]} str  the string array to trim
     *
     * @return {String|String[]} retrurns a string or an array will removed whitespaces
     */
    trim: function(str) {
      if (str instanceof Array) {
        var arr = [];
        for (var i = 0; i < str.length; i++) {
          arr.push(str[i].replace(/^\s*/, '').replace(/\s*$/, '').replace(/\r*$/, ''));
        }
        return arr;
      }
      return str.replace(/^\s*/, '').replace(/\s*$/, '').replace(/\r*$/, '');
    },

    /**
     * Converts a degree measurement to its corresponding value in radians. Radians and degrees are two ways of
     * measuring the same thing. There are 360 degrees in a circle and 2*PI radians in a circle. For example,
     * 90 degrees = PI/2 = 1.5707964. All trigonometric methods in Processing require their parameters to be specified in radians.
     *
     * @param {int|float} value        an angle in radians
     *
     * @returns {float}
     *
     * @see degrees
     */
    radians: function(aAngle) {
      return (aAngle / 180) * Math.PI;
    },

    /**
     * Number-to-String formatting function. Prepends "plus" or "minus" depending
     * on whether the value is positive or negative, respectively, after padding
     * the value with zeroes on the left and right, the number of zeroes used dictated
     * by the values 'leftDigits' and 'rightDigits'. 'value' cannot be an array.
     *
     * @param {int|float} value                 the number to format
     * @param {String} plus                     the prefix for positive numbers
     * @param {String} minus                    the prefix for negative numbers
     * @param {int} left                        number of digits to the left of the decimal point
     * @param {int} right                       number of digits to the right of the decimal point
     * @param {String} group                    string delimited for groups, such as the comma in "1,000"
     *
     * @returns {String or String[]}
     *
     * @see nfCore
     */
    nfCoreScalar: function (value, plus, minus, leftDigits, rightDigits, group) {
      var sign = (value < 0) ? minus : plus;
      var autoDetectDecimals = rightDigits === 0;
      var rightDigitsOfDefault = (rightDigits === undef || rightDigits < 0) ? 0 : rightDigits;

      var absValue = Math.abs(value);
      if (autoDetectDecimals) {
        rightDigitsOfDefault = 1;
        absValue *= 10;
        while (Math.abs(Math.round(absValue) - absValue) > 1e-6 && rightDigitsOfDefault < 7) {
          ++rightDigitsOfDefault;
          absValue *= 10;
        }
      } else if (rightDigitsOfDefault !== 0) {
        absValue *= Math.pow(10, rightDigitsOfDefault);
      }

      // Using Java's default rounding policy HALF_EVEN. This policy is based
      // on the idea that 0.5 values round to the nearest even number, and
      // everything else is rounded normally.
      var number, doubled = absValue * 2;
      if (Math.floor(absValue) === absValue) {
        number = absValue;
      } else if (Math.floor(doubled) === doubled) {
        var floored = Math.floor(absValue);
        number = floored + (floored % 2);
      } else {
        number = Math.round(absValue);
      }

      var buffer = "";
      var totalDigits = leftDigits + rightDigitsOfDefault;
      while (totalDigits > 0 || number > 0) {
        totalDigits--;
        buffer = "" + (number % 10) + buffer;
        number = Math.floor(number / 10);
      }
      if (group !== undef) {
        var i = buffer.length - 3 - rightDigitsOfDefault;
        while(i > 0) {
          buffer = buffer.substring(0,i) + group + buffer.substring(i);
          i-=3;
        }
      }
      if (rightDigitsOfDefault > 0) {
        return sign + buffer.substring(0, buffer.length - rightDigitsOfDefault) +
               "." + buffer.substring(buffer.length - rightDigitsOfDefault, buffer.length);
      }
      return sign + buffer;
    },

    /**
    * Number-to-String formatting function. Prepends "plus" or "minus" depending
    * on whether the value is positive or negative, respectively, after padding
    * the value with zeroes on the left and right, the number of zeroes used dictated
    * by the values 'leftDigits' and 'rightDigits'. 'value' can be an array;
    * if the input is an array, each value in it is formatted separately, and
    * an array with formatted values is returned.
    *
    * @param {int|int[]|float|float[]} value   the number(s) to format
    * @param {String} plus                     the prefix for positive numbers
    * @param {String} minus                    the prefix for negative numbers
    * @param {int} left                        number of digits to the left of the decimal point
    * @param {int} right                       number of digits to the right of the decimal point
    * @param {String} group                    string delimited for groups, such as the comma in "1,000"
    *
    * @returns {String or String[]}
    *
    * @see nfCoreScalar
    */
    nfCore: function(value, plus, minus, leftDigits, rightDigits, group) {
      if (value instanceof Array) {
        var arr = [];
        for (var i = 0, len = value.length; i < len; i++) {
          arr.push(CommonFunctions.nfCoreScalar(value[i], plus, minus, leftDigits, rightDigits, group));
        }
        return arr;
      }
      return CommonFunctions.nfCoreScalar(value, plus, minus, leftDigits, rightDigits, group);
    },

    /**
    * Utility function for formatting numbers into strings. There are two versions, one for
    * formatting floats and one for formatting ints. The values for the digits, left, and
    * right parameters should always be positive integers.
    * As shown in the above example, nf() is used to add zeros to the left and/or right
    * of a number. This is typically for aligning a list of numbers. To remove digits from
    * a floating-point number, use the int(), ceil(), floor(), or round() functions.
    *
    * @param {int|int[]|float|float[]} value   the number(s) to format
    * @param {int} left                        number of digits to the left of the decimal point
    * @param {int} right                       number of digits to the right of the decimal point
    *
    * @returns {String or String[]}
    *
    * @see nfs
    * @see nfp
    * @see nfc
    */
    nf: function(value, leftDigits, rightDigits) {
      return CommonFunctions.nfCore(value, "", "-", leftDigits, rightDigits);
    },

    /**
    * Utility function for formatting numbers into strings. Similar to nf()  but leaves a blank space in front
    * of positive numbers so they align with negative numbers in spite of the minus symbol. There are two
    * versions, one for formatting floats and one for formatting ints. The values for the digits, left,
    * and right parameters should always be positive integers.
    *
    * @param {int|int[]|float|float[]} value   the number(s) to format
    * @param {int} left                        number of digits to the left of the decimal point
    * @param {int} right                       number of digits to the right of the decimal point
    *
    * @returns {String or String[]}
    *
    * @see nf
    * @see nfp
    * @see nfc
    */
    nfs: function(value, leftDigits, rightDigits) {
      return CommonFunctions.nfCore(value, " ", "-", leftDigits, rightDigits);
    },

    /**
    * Utility function for formatting numbers into strings. Similar to nf()  but puts a "+" in front of
    * positive numbers and a "-" in front of negative numbers. There are two versions, one for formatting
    * floats and one for formatting ints. The values for the digits, left, and right parameters should
    * always be positive integers.
    *
    * @param {int|int[]|float|float[]} value   the number(s) to format
    * @param {int} left                        number of digits to the left of the decimal point
    * @param {int} right                       number of digits to the right of the decimal point
    *
    * @returns {String or String[]}
    *
    * @see nfs
    * @see nf
    * @see nfc
    */
    nfp: function(value, leftDigits, rightDigits) {
      return CommonFunctions.nfCore(value, "+", "-", leftDigits, rightDigits);
    },

    /**
    * Utility function for formatting numbers into strings and placing appropriate commas to mark
    * units of 1000. There are two versions, one for formatting ints and one for formatting an array
    * of ints. The value for the digits parameter should always be a positive integer.
    *
    * @param {int|int[]|float|float[]} value   the number(s) to format
    * @param {int} left                        number of digits to the left of the decimal point
    * @param {int} right                       number of digits to the right of the decimal point
    *
    * @returns {String or String[]}
    *
    * @see nf
    * @see nfs
    * @see nfp
    */
    nfc: function(value, rightDigits) {
      return CommonFunctions.nfCore(value, "", "-", 0, rightDigits, ",");
    },

    // used to bind all common functions to "p"
    withCommonFunctions: function withCommonFunctions(p) {
      ["trim", "radians", "nf", "nfs", "nfp", "nfc"].forEach(function(f){
        p[f] = CommonFunctions[f];
      });
    }
  };

  return CommonFunctions;
}());
