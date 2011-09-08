function _checkEqual(a, b) {
  if (a === b) {
    print("test passes");
  } else {
    print(a + " !== " + b);
  }
}

var Foo = function() {
  this.blah = true;
};
Foo.prototype = {
  test: function(test) {
    _checkEqual(test instanceof Foo, true);
  }
};

var baz = new Foo();
var buz = new Foo();
_checkEqual(baz instanceof Foo, true);
baz.test(buz);
