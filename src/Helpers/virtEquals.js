/**
 * Returns Java equals() result for two objects. If the first object
 * has the "equals" function, it preforms the call of this function.
 * Otherwise the method uses the JavaScript === operator.
 *
 * @param {Object} obj          The first object.
 * @param {Object} other        The second object.
 *
 * @returns {boolean}           true if the objects are equal.
 */
module.exports = function virtEquals(obj, other) {
  if (obj === null || other === null) {
    return (obj === null) && (other === null);
  }
  if (typeof (obj) === "string") {
    return obj === other;
  }
  if (typeof(obj) !== "object") {
    return obj === other;
  }
  if (obj.equals instanceof Function) {
    return obj.equals(other);
  }
  return obj === other;
};
