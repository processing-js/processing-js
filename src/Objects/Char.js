module.exports = (function(charMap, undef) {

  var Char = function(chr) {
    if (typeof chr === 'string' && chr.length === 1) {
      this.code = chr.charCodeAt(0);
    } else if (typeof chr === 'number') {
      this.code = chr;
    } else if (chr instanceof Char) {
      this.code = chr;
    } else {
      this.code = NaN;
    }
    return (charMap[this.code] === undef) ? charMap[this.code] = this : charMap[this.code];
  };

  Char.prototype.toString = function() {
    return String.fromCharCode(this.code);
  };

  Char.prototype.valueOf = function() {
    return this.code;
  };

  return Char;
}({}));
