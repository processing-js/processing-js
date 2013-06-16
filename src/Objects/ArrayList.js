/**
 * An ArrayList stores a variable number of objects.
 *
 * @param {int} initialCapacity optional defines the initial capacity of the list, it's empty by default
 *
 * @returns {ArrayList} new ArrayList object
 */
module.exports = function(options) {
  var virtHashCode = options.virtHashCode,
      virtEquals = options.virtEquals;

  function Iterator(array) {
    var index = -1;
    this.hasNext = function() {
      return (index + 1) < array.length;
    };

    this.next = function() {
      return array[++index];
    };

    this.remove = function() {
      array.splice(index--, 1);
    };
  }

  function ArrayList(a) {
    var array = [];

    if (a && a.toArray) {
      array = a.toArray();
    }

    /**
     * @member ArrayList
     * ArrayList.get() Returns the element at the specified position in this list.
     *
     * @param {int} i index of element to return
     *
     * @returns {Object} the element at the specified position in this list.
     */
    this.get = function(i) {
      return array[i];
    };
    /**
     * @member ArrayList
     * ArrayList.contains() Returns true if this list contains the specified element.
     *
     * @param {Object} item element whose presence in this List is to be tested.
     *
     * @returns {boolean} true if the specified element is present; false otherwise.
     */
    this.contains = function(item) {
      return this.indexOf(item)>-1;
    };
    /**
     * @member ArrayList
     * ArrayList.indexOf() Returns the position this element takes in the list, or -1 if the element is not found.
     *
     * @param {Object} item element whose position in this List is to be tested.
     *
     * @returns {int} the list position that the first match for this element holds in the list, or -1 if it is not in the list.
     */
    this.indexOf = function(item) {
      for (var i = 0, len = array.length; i < len; ++i) {
        if (virtEquals(item, array[i])) {
          return i;
        }
      }
      return -1;
    };
    /**
     * @member ArrayList
     * ArrayList.lastIndexOf() Returns the index of the last occurrence of the specified element in this list,
     * or -1 if this list does not contain the element. More formally, returns the highest index i such that
     * (o==null ? get(i)==null : o.equals(get(i))), or -1 if there is no such index.
     *
     * @param {Object} item element to search for.
     *
     * @returns {int} the index of the last occurrence of the specified element in this list, or -1 if this list does not contain the element.
     */
    this.lastIndexOf = function(item) {
      for (var i = array.length-1; i >= 0; --i) {
        if (virtEquals(item, array[i])) {
          return i;
        }
      }
      return -1;
    };
    /**
     * @member ArrayList
     * ArrayList.add() Adds the specified element to this list.
     *
     * @param {int}    index  optional index at which the specified element is to be inserted
     * @param {Object} object element to be added to the list
     */
    this.add = function() {
      if (arguments.length === 1) {
        array.push(arguments[0]); // for add(Object)
      } else if (arguments.length === 2) {
        var arg0 = arguments[0];
        if (typeof arg0 === 'number') {
          if (arg0 >= 0 && arg0 <= array.length) {
            array.splice(arg0, 0, arguments[1]); // for add(i, Object)
          } else {
            throw(arg0 + " is not a valid index");
          }
        } else {
          throw(typeof arg0 + " is not a number");
        }
      } else {
        throw("Please use the proper number of parameters.");
      }
    };
    /**
     * @member ArrayList
     * ArrayList.addAll(collection) appends all of the elements in the specified
     * Collection to the end of this list, in the order that they are returned by
     * the specified Collection's Iterator.
     *
     * When called as addAll(index, collection) the elements are inserted into
     * this list at the position indicated by index.
     *
     * @param {index} Optional; specifies the position the colletion should be inserted at
     * @param {collection} Any iterable object (ArrayList, HashMap.keySet(), etc.)
     * @throws out of bounds error for negative index, or index greater than list size.
     */
    this.addAll = function(arg1, arg2) {
      // addAll(int, Collection)
      var it;
      if (typeof arg1 === "number") {
        if (arg1 < 0 || arg1 > array.length) {
          throw("Index out of bounds for addAll: " + arg1 + " greater or equal than " + array.length);
        }
        it = new ObjectIterator(arg2);
        while (it.hasNext()) {
          array.splice(arg1++, 0, it.next());
        }
      }
      // addAll(Collection)
      else {
        it = new ObjectIterator(arg1);
        while (it.hasNext()) {
          array.push(it.next());
        }
      }
    };
    /**
     * @member ArrayList
     * ArrayList.set() Replaces the element at the specified position in this list with the specified element.
     *
     * @param {int}    index  index of element to replace
     * @param {Object} object element to be stored at the specified position
     */
    this.set = function() {
      if (arguments.length === 2) {
        var arg0 = arguments[0];
        if (typeof arg0 === 'number') {
          if (arg0 >= 0 && arg0 < array.length) {
            array.splice(arg0, 1, arguments[1]);
          } else {
            throw(arg0 + " is not a valid index.");
          }
        } else {
          throw(typeof arg0 + " is not a number");
        }
      } else {
        throw("Please use the proper number of parameters.");
      }
    };

    /**
     * @member ArrayList
     * ArrayList.size() Returns the number of elements in this list.
     *
     * @returns {int} the number of elements in this list
     */
    this.size = function() {
      return array.length;
    };

    /**
     * @member ArrayList
     * ArrayList.clear() Removes all of the elements from this list. The list will be empty after this call returns.
     */
    this.clear = function() {
      array.length = 0;
    };

    /**
     * @member ArrayList
     * ArrayList.remove() Removes an element either based on index, if the argument is a number, or
     * by equality check, if the argument is an object.
     *
     * @param {int|Object} item either the index of the element to be removed, or the element itself.
     *
     * @returns {Object|boolean} If removal is by index, the element that was removed, or null if nothing was removed. If removal is by object, true if removal occurred, otherwise false.
     */
    this.remove = function(item) {
      if (typeof item === 'number') {
        return array.splice(item, 1)[0];
      }
      item = this.indexOf(item);
      if (item > -1) {
        array.splice(item, 1);
        return true;
      }
      return false;
    };

     /**
     * @member ArrayList
     * ArrayList.removeAll Removes from this List all of the elements from
     * the current ArrayList which are present in the passed in paramater ArrayList 'c'.
     * Shifts any succeeding elements to the left (reduces their index).
     *
     * @param {ArrayList} the ArrayList to compare to the current ArrayList
     *
     * @returns {boolean} true if the ArrayList had an element removed; false otherwise
     */
    this.removeAll = function(c) {
      var i, x, item,
          newList = new ArrayList();
      newList.addAll(this);
      this.clear();
      // For every item that exists in the original ArrayList and not in the c ArrayList
      // copy it into the empty 'this' ArrayList to create the new 'this' Array.
      for (i = 0, x = 0; i < newList.size(); i++) {
        item = newList.get(i);
        if (!c.contains(item)) {
          this.add(x++, item);
        }
      }
      if (this.size() < newList.size()) {
        return true;
      }
      return false;
    };

    /**
     * @member ArrayList
     * ArrayList.isEmpty() Tests if this list has no elements.
     *
     * @returns {boolean} true if this list has no elements; false otherwise
     */
    this.isEmpty = function() {
       return !array.length;
    };

    /**
     * @member ArrayList
     * ArrayList.clone() Returns a shallow copy of this ArrayList instance. (The elements themselves are not copied.)
     *
     * @returns {ArrayList} a clone of this ArrayList instance
     */
    this.clone = function() {
      return new ArrayList(this);
    };

    /**
     * @member ArrayList
     * ArrayList.toArray() Returns an array containing all of the elements in this list in the correct order.
     *
     * @returns {Object[]} Returns an array containing all of the elements in this list in the correct order
     */
    this.toArray = function() {
      return array.slice(0);
    };

    this.iterator = function() {
      return new Iterator(array);
    };
  }

  return ArrayList;
};
