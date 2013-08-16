/**
* A HashMap stores a collection of objects, each referenced by a key. This is similar to an Array, only
* instead of accessing elements with a numeric index, a String  is used. (If you are familiar with
* associative arrays from other languages, this is the same idea.)
*
* @param {int} initialCapacity          defines the initial capacity of the map, it's 16 by default
* @param {float} loadFactor             the load factor for the map, the default is 0.75
* @param {Map} m                        gives the new HashMap the same mappings as this Map
*/
module.exports = function(options) {
  var virtHashCode = options.virtHashCode,
      virtEquals = options.virtEquals;

  /**
  * @member HashMap
  * A HashMap stores a collection of objects, each referenced by a key. This is similar to an Array, only
  * instead of accessing elements with a numeric index, a String  is used. (If you are familiar with
  * associative arrays from other languages, this is the same idea.)
  *
  * @param {int} initialCapacity          defines the initial capacity of the map, it's 16 by default
  * @param {float} loadFactor             the load factor for the map, the default is 0.75
  * @param {Map} m                        gives the new HashMap the same mappings as this Map
  */
  function HashMap() {
    if (arguments.length === 1 && arguments[0] instanceof HashMap) {
      return arguments[0].clone();
    }

    var initialCapacity = arguments.length > 0 ? arguments[0] : 16;
    var loadFactor = arguments.length > 1 ? arguments[1] : 0.75;
    var buckets = [];
    buckets.length = initialCapacity;
    var count = 0;
    var hashMap = this;

    function getBucketIndex(key) {
      var index = virtHashCode(key) % buckets.length;
      return index < 0 ? buckets.length + index : index;
    }
    function ensureLoad() {
      if (count <= loadFactor * buckets.length) {
        return;
      }
      var allEntries = [];
      for (var i = 0; i < buckets.length; ++i) {
        if (buckets[i] !== undefined) {
          allEntries = allEntries.concat(buckets[i]);
        }
      }
      var newBucketsLength = buckets.length * 2;
      buckets = [];
      buckets.length = newBucketsLength;
      for (var j = 0; j < allEntries.length; ++j) {
        var index = getBucketIndex(allEntries[j].key);
        var bucket = buckets[index];
        if (bucket === undefined) {
          buckets[index] = bucket = [];
        }
        bucket.push(allEntries[j]);
      }
    }

    function Iterator(conversion, removeItem) {
      var bucketIndex = 0;
      var itemIndex = -1;
      var endOfBuckets = false;
      var currentItem;

      function findNext() {
        while (!endOfBuckets) {
          ++itemIndex;
          if (bucketIndex >= buckets.length) {
            endOfBuckets = true;
          } else if (buckets[bucketIndex] === undefined || itemIndex >= buckets[bucketIndex].length) {
            itemIndex = -1;
            ++bucketIndex;
          } else {
            return;
          }
        }
      }

      /*
      * @member Iterator
      * Checks if the Iterator has more items
      */
      this.hasNext = function() {
        return !endOfBuckets;
      };

      /*
      * @member Iterator
      * Return the next Item
      */
      this.next = function() {
        currentItem = conversion(buckets[bucketIndex][itemIndex]);
        findNext();
        return currentItem;
      };

      /*
      * @member Iterator
      * Remove the current item
      */
      this.remove = function() {
        if (currentItem !== undefined) {
          removeItem(currentItem);
          --itemIndex;
          findNext();
        }
      };

      findNext();
    }

    function Set(conversion, isIn, removeItem) {
      this.clear = function() {
        hashMap.clear();
      };

      this.contains = function(o) {
        return isIn(o);
      };

      this.containsAll = function(o) {
        var it = o.iterator();
        while (it.hasNext()) {
          if (!this.contains(it.next())) {
            return false;
          }
        }
        return true;
      };

      this.isEmpty = function() {
        return hashMap.isEmpty();
      };

      this.iterator = function() {
        return new Iterator(conversion, removeItem);
      };

      this.remove = function(o) {
        if (this.contains(o)) {
          removeItem(o);
          return true;
        }
        return false;
      };

      this.removeAll = function(c) {
        var it = c.iterator();
        var changed = false;
        while (it.hasNext()) {
          var item = it.next();
          if (this.contains(item)) {
            removeItem(item);
            changed = true;
          }
        }
        return true;
      };

      this.retainAll = function(c) {
        var it = this.iterator();
        var toRemove = [];
        while (it.hasNext()) {
          var entry = it.next();
          if (!c.contains(entry)) {
            toRemove.push(entry);
          }
        }
        for (var i = 0; i < toRemove.length; ++i) {
          removeItem(toRemove[i]);
        }
        return toRemove.length > 0;
      };

      this.size = function() {
        return hashMap.size();
      };

      this.toArray = function() {
        var result = [];
        var it = this.iterator();
        while (it.hasNext()) {
          result.push(it.next());
        }
        return result;
      };
    }

    function Entry(pair) {
      this._isIn = function(map) {
        return map === hashMap && (pair.removed === undefined);
      };

      this.equals = function(o) {
        return virtEquals(pair.key, o.getKey());
      };

      this.getKey = function() {
        return pair.key;
      };

      this.getValue = function() {
        return pair.value;
      };

      this.hashCode = function(o) {
        return virtHashCode(pair.key);
      };

      this.setValue = function(value) {
        var old = pair.value;
        pair.value = value;
        return old;
      };
    }

    this.clear = function() {
      count = 0;
      buckets = [];
      buckets.length = initialCapacity;
    };

    this.clone = function() {
      var map = new HashMap();
      map.putAll(this);
      return map;
    };

    this.containsKey = function(key) {
      var index = getBucketIndex(key);
      var bucket = buckets[index];
      if (bucket === undefined) {
        return false;
      }
      for (var i = 0; i < bucket.length; ++i) {
        if (virtEquals(bucket[i].key, key)) {
          return true;
        }
      }
      return false;
    };

    this.containsValue = function(value) {
      for (var i = 0; i < buckets.length; ++i) {
        var bucket = buckets[i];
        if (bucket === undefined) {
          continue;
        }
        for (var j = 0; j < bucket.length; ++j) {
          if (virtEquals(bucket[j].value, value)) {
            return true;
          }
        }
      }
      return false;
    };

    this.entrySet = function() {
      return new Set(

      function(pair) {
        return new Entry(pair);
      },

      function(pair) {
        return (pair instanceof Entry) && pair._isIn(hashMap);
      },

      function(pair) {
        return hashMap.remove(pair.getKey());
      });
    };

    this.get = function(key) {
      var index = getBucketIndex(key);
      var bucket = buckets[index];
      if (bucket === undefined) {
        return null;
      }
      for (var i = 0; i < bucket.length; ++i) {
        if (virtEquals(bucket[i].key, key)) {
          return bucket[i].value;
        }
      }
      return null;
    };

    this.isEmpty = function() {
      return count === 0;
    };

    this.keySet = function() {
      return new Set(
        // get key from pair
        function(pair) {
          return pair.key;
        },
        // is-in test
        function(key) {
          return hashMap.containsKey(key);
        },
        // remove from hashmap by key
        function(key) {
          return hashMap.remove(key);
        }
      );
    };

    this.values = function() {
      return new Set(
        // get value from pair
        function(pair) {
          return pair.value;
        },
        // is-in test
        function(value) {
          return hashMap.containsValue(value);
        },
        // remove from hashmap by value
        function(value) {
          return hashMap.removeByValue(value);
        }
      );
    };

    this.put = function(key, value) {
      var index = getBucketIndex(key);
      var bucket = buckets[index];
      if (bucket === undefined) {
        ++count;
        buckets[index] = [{
          key: key,
          value: value
        }];
        ensureLoad();
        return null;
      }
      for (var i = 0; i < bucket.length; ++i) {
        if (virtEquals(bucket[i].key, key)) {
          var previous = bucket[i].value;
          bucket[i].value = value;
          return previous;
        }
      }
      ++count;
      bucket.push({
        key: key,
        value: value
      });
      ensureLoad();
      return null;
    };

    this.putAll = function(m) {
      var it = m.entrySet().iterator();
      while (it.hasNext()) {
        var entry = it.next();
        this.put(entry.getKey(), entry.getValue());
      }
    };

    this.remove = function(key) {
      var index = getBucketIndex(key);
      var bucket = buckets[index];
      if (bucket === undefined) {
        return null;
      }
      for (var i = 0; i < bucket.length; ++i) {
        if (virtEquals(bucket[i].key, key)) {
          --count;
          var previous = bucket[i].value;
          bucket[i].removed = true;
          if (bucket.length > 1) {
            bucket.splice(i, 1);
          } else {
            buckets[index] = undefined;
          }
          return previous;
        }
      }
      return null;
    };

    this.removeByValue = function(value) {
      var bucket, i, ilen, pair;
      for (bucket in buckets) {
        if (buckets.hasOwnProperty(bucket)) {
          for (i = 0, ilen = buckets[bucket].length; i < ilen; i++) {
            pair = buckets[bucket][i];
            // removal on values is based on identity, not equality
            if (pair.value === value) {
              buckets[bucket].splice(i, 1);
              return true;
            }
          }
        }
      }
      return false;
    };

    this.size = function() {
      return count;
    };
  }

  return HashMap;
};
