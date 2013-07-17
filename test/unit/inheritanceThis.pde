String result = "fail";

class A {
  void setB(B b){
    b.a = this;
  }
  void p() {
    result = "A";
  }
}

class A1 extends A {
  void p(){
    result = "A1";
  }
}

class B {
  A a;
  void p2(){
    a.p();
  }
}

A1 a1 = new A1();
B b = new B();
a1.setB(b);
b.p2();

_checkEqual(result, "A1");
