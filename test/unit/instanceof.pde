class A {
  void T() {}
}

interface I {
  void U() {}
}

class B extends A implements I {
  void U() {}
}

A a = new A();
B b = new B();

boolean r1 = a instanceof A;
boolean r2 = b instanceof A;
boolean r3 = a instanceof B;
boolean r4 = b instanceof B;
boolean r5 = a instanceof I;
boolean r6 = b instanceof I;

_checkEqual(
  [r1, r2, r3, r4, r5, r6],
  [true, true, false, true, false, true]);

// primitives
String s = "t", u;

boolean p1 = null instanceof A;
boolean p2 = null instanceof I;
boolean p3 = s instanceof B;
boolean p4 = s instanceof String;
boolean p5 = s instanceof Object;
boolean p6 = u instanceof Object; 

_checkEqual(
  [p1, p2, p3, p4, p5, p6],
  [false, false, false, true, true, false]);
