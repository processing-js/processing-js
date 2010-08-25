// constructor calls virtual methods
// https://processing-js.lighthouseapp.com/projects/41284/tickets/770

String s = "";

class A {
  A() { a(); }
  void a() { s += "A"; }}

class B extends A {
  B() { super(); }
  void a() { s += "B"; }}

class C extends A {
  C() { super(); }
  void a() { s += "C"; }}

B b = new B(); C c = new C();

_checkEqual(s, "BC");

