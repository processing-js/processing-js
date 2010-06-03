// Tests that a base class overloaded are inherited
// in a sub class

class A {
  int call(int x, int y) {
    return x * y;
  }
  
  int call(int x) {
    return call(x, 1);
  }
}

class B extends A {
  int call(int x, int y) {
    return x + y;
  }
}

B s = new B();
_checkEqual(4, s.call(3));
