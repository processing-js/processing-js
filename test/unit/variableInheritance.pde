// variable inheritance only defined for a single "extends" step
// https://processing-js.lighthouseapp.com/projects/41284/tickets/877

class A
{
  int x=0;
  int y=0;
  A(int x, int y) { this.x=x; this.y=y; }
  int getX() { return x; }
  int getY() { return y; }
  String abc() { return "x is "+x+", y is "+y+", x using getter is "+getX()+", and y using getting is "+getY(); }
}

class B extends A
{
  B(int x, int y) { super(x,y); }
  String bcd() { return "x is "+x+", y is "+y+", x using getter is "+getX()+", and y using getting is "+getY(); }
}

class C extends B
{
  C(int x, int y) { super(x,y); }
  String cde() { return "x is "+x+", y is "+y+", x using getter is "+getX()+", and y using getting is "+getY(); }
}

A a = new A(10,10);
_checkEqual(a.abc(), "x is 10, y is 10, x using getter is 10, and y using getting is 10");

B b = new B(10,10);
_checkEqual(b.bcd(), "x is 10, y is 10, x using getter is 10, and y using getting is 10");

C c = new C(10,10);
_checkEqual(c.cde(), "x is 10, y is 10, x using getter is 10, and y using getting is 10");

