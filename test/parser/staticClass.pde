
static class F extends A.B {
}


void setup() {
A.B.C c = new A.B.C();
F f = new F();
}

static class A {
  static class B {
    static class C {
    }
  }
}
