String result = "fail";

class A {
  void split(double d) {
    result = "" + d;
  }
}

A a = new A();
a.split(0.5);

_checkEqual(result, "0.5");
