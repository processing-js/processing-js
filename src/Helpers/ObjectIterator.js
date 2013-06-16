/**
* A ObjectIterator is an iterator wrapper for objects. If passed object contains
* the iterator method, the object instance will be replaced by the result returned by
* this method call. If passed object is an array, the ObjectIterator instance iterates
* through its items.
*
* @param {Object} obj The object to be iterated.
*/
module.exports = function ObjectIterator(obj) {
  if (obj instanceof Array) {
    // iterate through array items
    var index = -1;
    this.hasNext = function() {
      return ++index < obj.length;
    };
    this.next = function() {
      return obj[index];
    };
  } else if (obj.iterator instanceof Function) {
    return obj.iterator();
  } else {
    throw "Unable to iterate: " + obj;
  }
};
