void setup()
{
  noLoop();

  println("testing static functionality");
  A a1 = new A(Floater.getB());
  A a2 = new A(Floater.getB());
  A a3 = new A(Floater.getB());
  
  println("a1.a == 1 ? " + (a1.getA()==1));
  println("a1.a == 2 ? " + (a2.getA()==2));
  println("a1.a == 3 ? " + (a3.getA()==3));
}

class A {
  float a;
  float getA() { return a; }
  A(float value) { a = value; }}

static class Floater{
  static float b = 1.0;
  static float getB() { return b++; }}

