module.exports = function(virtHashCode, virtEquals, undef) {

  return function withProxyFunctions(p, removeFirstArgument) {
    /**
     * The contains(string) function returns true if the string passed in the parameter
     * is a substring of this string. It returns false if the string passed
     * in the parameter is not a substring of this string.
     *
     * @param {String} The string to look for in the current string
     *
     * @return {boolean} returns true if this string contains
     * the string passed as parameter. returns false, otherwise.
     *
     */
    p.__contains = function (subject, subStr) {
      if (typeof subject !== "string") {
        return subject.contains.apply(subject, removeFirstArgument(arguments));
      }
      //Parameter is not null AND
      //The type of the parameter is the same as this object (string)
      //The javascript function that finds a substring returns 0 or higher
      return (
        (subject !== null) &&
        (subStr !== null) &&
        (typeof subStr === "string") &&
        (subject.indexOf(subStr) > -1)
      );
    };

    /**
     * The __replaceAll() function searches all matches between a substring (or regular expression) and a string,
     * and replaces the matched substring with a new substring
     *
     * @param {String} subject    a substring
     * @param {String} regex      a substring or a regular expression
     * @param {String} replace    the string to replace the found value
     *
     * @return {String} returns result
     *
     * @see #match
     */
    p.__replaceAll = function(subject, regex, replacement) {
      if (typeof subject !== "string") {
        return subject.replaceAll.apply(subject, removeFirstArgument(arguments));
      }

      return subject.replace(new RegExp(regex, "g"), replacement);
    };

    /**
     * The __replaceFirst() function searches first matche between a substring (or regular expression) and a string,
     * and replaces the matched substring with a new substring
     *
     * @param {String} subject    a substring
     * @param {String} regex      a substring or a regular expression
     * @param {String} replace    the string to replace the found value
     *
     * @return {String} returns result
     *
     * @see #match
     */
    p.__replaceFirst = function(subject, regex, replacement) {
      if (typeof subject !== "string") {
        return subject.replaceFirst.apply(subject, removeFirstArgument(arguments));
      }

      return subject.replace(new RegExp(regex, ""), replacement);
    };

    /**
     * The __replace() function searches all matches between a substring and a string,
     * and replaces the matched substring with a new substring
     *
     * @param {String} subject         a substring
     * @param {String} what         a substring to find
     * @param {String} replacement    the string to replace the found value
     *
     * @return {String} returns result
     */
    p.__replace = function(subject, what, replacement) {
      if (typeof subject !== "string") {
        return subject.replace.apply(subject, removeFirstArgument(arguments));
      }
      if (what instanceof RegExp) {
        return subject.replace(what, replacement);
      }

      if (typeof what !== "string") {
        what = what.toString();
      }
      if (what === "") {
        return subject;
      }

      var i = subject.indexOf(what);
      if (i < 0) {
        return subject;
      }

      var j = 0, result = "";
      do {
        result += subject.substring(j, i) + replacement;
        j = i + what.length;
      } while ( (i = subject.indexOf(what, j)) >= 0);
      return result + subject.substring(j);
    };

    /**
     * The __equals() function compares two strings (or objects) to see if they are the same.
     * This method is necessary because it's not possible to compare strings using the equality operator (==).
     * Returns true if the strings are the same and false if they are not.
     *
     * @param {String} subject  a string used for comparison
     * @param {String} other  a string used for comparison with
     *
     * @return {boolean} true is the strings are the same false otherwise
     */
    p.__equals = function(subject, other) {
      if (subject.equals instanceof Function) {
        return subject.equals.apply(subject, removeFirstArgument(arguments));
      }

      return virtEquals(subject, other);
    };

    /**
     * The __equalsIgnoreCase() function compares two strings to see if they are the same.
     * Returns true if the strings are the same, either when forced to all lower case or
     * all upper case.
     *
     * @param {String} subject  a string used for comparison
     * @param {String} other  a string used for comparison with
     *
     * @return {boolean} true is the strings are the same, ignoring case. false otherwise
     */
    p.__equalsIgnoreCase = function(subject, other) {
      if (typeof subject !== "string") {
        return subject.equalsIgnoreCase.apply(subject, removeFirstArgument(arguments));
      }

      return subject.toLowerCase() === other.toLowerCase();
    };

    /**
     * The __toCharArray() function splits the string into a char array.
     *
     * @param {String} subject The string
     *
     * @return {Char[]} a char array
     */
    p.__toCharArray = function(subject) {
      if (typeof subject !== "string") {
        return subject.toCharArray.apply(subject, removeFirstArgument(arguments));
      }

      var chars = [];
      for (var i = 0, len = subject.length; i < len; ++i) {
        chars[i] = new Char(subject.charAt(i));
      }
      return chars;
    };

    /**
     * The __split() function splits a string using the regex delimiter
     * specified. If limit is specified, the resultant array will have number
     * of elements equal to or less than the limit.
     *
     * @param {String} subject string to be split
     * @param {String} regexp  regex string used to split the subject
     * @param {int}    limit   max number of tokens to be returned
     *
     * @return {String[]} an array of tokens from the split string
     */
    p.__split = function(subject, regex, limit) {
      if (typeof subject !== "string") {
        return subject.split.apply(subject, removeFirstArgument(arguments));
      }

      var pattern = new RegExp(regex);

      // If limit is not specified, use JavaScript's built-in String.split.
      if ((limit === undef) || (limit < 1)) {
        return subject.split(pattern);
      }

      // If limit is specified, JavaScript's built-in String.split has a
      // different behaviour than Java's. A Java-compatible implementation is
      // provided here.
      var result = [], currSubject = subject, pos;
      while (((pos = currSubject.search(pattern)) !== -1) && (result.length < (limit - 1))) {
        var match = pattern.exec(currSubject).toString();
        result.push(currSubject.substring(0, pos));
        currSubject = currSubject.substring(pos + match.length);
      }
      if ((pos !== -1) || (currSubject !== "")) {
        result.push(currSubject);
      }
      return result;
    };

    /**
     * The codePointAt() function returns the unicode value of the character at a given index of a string.
     *
     * @param  {int} idx         the index of the character
     *
     * @return {String} code     the String containing the unicode value of the character
     */
    p.__codePointAt = function(subject, idx) {
      var code = subject.charCodeAt(idx),
          hi,
          low;
      if (0xD800 <= code && code <= 0xDBFF) {
        hi = code;
        low = subject.charCodeAt(idx + 1);
        return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
      }
      return code;
    };

    /**
     * The matches() function checks whether or not a string matches a given regular expression.
     *
     * @param {String} str      the String on which the match is tested
     * @param {String} regexp   the regexp for which a match is tested
     *
     * @return {boolean} true if the string fits the regexp, false otherwise
     */
    p.__matches = function(str, regexp) {
      return (new RegExp(regexp)).test(str);
    };

    /**
     * The startsWith() function tests if a string starts with the specified prefix.  If the prefix
     * is the empty String or equal to the subject String, startsWith() will also return true.
     *
     * @param {String} prefix   the String used to compare against the start of the subject String.
     * @param {int}    toffset  (optional) an offset into the subject String where searching should begin.
     *
     * @return {boolean} true if the subject String starts with the prefix.
     */
    p.__startsWith = function(subject, prefix, toffset) {
      if (typeof subject !== "string") {
        return subject.startsWith.apply(subject, removeFirstArgument(arguments));
      }

      toffset = toffset || 0;
      if (toffset < 0 || toffset > subject.length) {
        return false;
      }
      return (prefix === '' || prefix === subject) ? true : (subject.indexOf(prefix) === toffset);
    };

    /**
     * The endsWith() function tests if a string ends with the specified suffix.  If the suffix
     * is the empty String, endsWith() will also return true.
     *
     * @param {String} suffix   the String used to compare against the end of the subject String.
     *
     * @return {boolean} true if the subject String starts with the prefix.
     */
    p.__endsWith = function(subject, suffix) {
      if (typeof subject !== "string") {
        return subject.endsWith.apply(subject, removeFirstArgument(arguments));
      }

      var suffixLen = suffix ? suffix.length : 0;
      return (suffix === '' || suffix === subject) ? true :
        (subject.indexOf(suffix) === subject.length - suffixLen);
    };

    /**
     * The returns hash code of the.
     *
     * @param {Object} subject The string
     *
     * @return {int} a hash code
     */
    p.__hashCode = function(subject) {
      if (subject.hashCode instanceof Function) {
        return subject.hashCode.apply(subject, removeFirstArgument(arguments));
      }
      return virtHashCode(subject);
    };

    /**
     * The __printStackTrace() prints stack trace to the console.
     *
     * @param {Exception} subject The error
     */
    p.__printStackTrace = function(subject) {
      p.println("Exception: " + subject.toString() );
    };
  };

};
