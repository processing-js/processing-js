class A {
    String type = "a";
    String toString() { return "{" + type + "}"; }}

class B extends A { public B() { type = "b"; }}
class C extends B { public C() { type = "c"; }}

String s = "";
A a = new A();
s += a.toString();

B b = new B();
s += b.toString();

C c = new C();
s += c.toString();

_checkEqual(s, "{a}{b}{c}");
