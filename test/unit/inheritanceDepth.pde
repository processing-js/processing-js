int checkWasCalled = 0;

class Drawable {
  int sr;
  void checkItem() {
    _checkEqual(sr, checkWasCalled);
    checkWasCalled++;
  }
  void setItem(int r) {
    sr =r; 
  }
}

class A extends Drawable {
  A() { 
    setItem(2);
  }
  void checkItem() {
    super.checkItem();
  }
}

class B extends A {
  B() {
    setItem(1);
  }
  void checkItem() {
    super.checkItem();
  }
}

class C extends B {
  C() { 
    setItem(0);
  }
  void checkItem() {
    super.checkItem();
  }
}

C c; B b; A a;


c = new C();
b = new B();
a = new A(); 


c.checkItem();
b.checkItem();
a.checkItem();
_checkEqual(checkWasCalled, 3);
