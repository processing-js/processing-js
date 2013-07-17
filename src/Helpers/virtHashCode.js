/**
 * Returns Java hashCode() result for the object. If the object has the "hashCode" function,
 * it preforms the call of this function. Otherwise it uses/creates the "$id" property,
 * which is used as the hashCode.
 *
 * @param {Object} obj          The object.
 * @returns {int}               The object's hash code.
 */
module.exports = function virtHashCode(obj, undef) {
  if (typeof(obj) === "string") {
    var hash = 0;
    for (var i = 0; i < obj.length; ++i) {
      hash = (hash * 31 + obj.charCodeAt(i)) & 0xFFFFFFFF;
    }
    return hash;
  }
  if (typeof(obj) !== "object") {
    return obj & 0xFFFFFFFF;
  }
  if (obj.hashCode instanceof Function) {
    return obj.hashCode();
  }
  if (obj.$id === undef) {
      obj.$id = ((Math.floor(Math.random() * 0x10000) - 0x8000) << 16) | Math.floor(Math.random() * 0x10000);
  }
  return obj.$id;
};
