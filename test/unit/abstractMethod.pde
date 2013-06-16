int checkWasCalled = 0;

abstract class A {
  abstract void check();
}

class B extends A {
  void check() {
    ++checkWasCalled;
  }
}

A b = new B();

b.check();

_checkEqual(checkWasCalled, 1);
