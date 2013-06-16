// interfaces

interface Flier
{
  void fly();
}

interface Runner
{
  void run();
}

// classes

class Animal
{
  int legs;
  Animal(int _legs) { legs=_legs; }
  String toString() { return "I has "+legs+" walk things."; }
}

// let's mix it up

class Bird extends Animal implements Flier
{
  Bird() { super(2); }
  void fly() { println("flying!"); }
}

class Penguin extends Bird
{
  void fly() { println("flying! UNDERWATER!"); }
}

class Horse extends Animal implements Runner
{
  Horse() { super(4); }
  void run() { println("running!"); }
}

class Sleipnir extends Animal implements Flier, Runner
{
  Sleipnir() { super(8); }
  void fly() { println("running!"); }
  void run() { println("running!"); }
}

class Snake extends Animal
{
  Snake() { super(0); }
}

void test()
{
  Object b = new Bird();
  Object p = new Penguin();
  Object h = new Horse();
  Object i = new Sleipnir();
  Object s = new Snake();
  
  boolean t01 = b instanceof Animal;
  boolean t02 = b instanceof Flier;
  boolean t03 = b instanceof Runner;
  boolean t04 = b instanceof Bird;
  boolean t05 = b instanceof Penguin;

  _checkequals(t01, true);
  _checkequals(t02, true);
  _checkequals(t03, false);
  _checkequals(t04, true);
  _checkequals(t05, false);

  boolean t06 = p instanceof Animal;
  boolean t07 = p instanceof Flier;
  boolean t08 = p instanceof Runner;
  boolean t09 = p instanceof Bird;
  boolean t10 = p instanceof Penguin;

  _checkequals(t06, true);
  _checkequals(t07, true);
  _checkequals(t08, false);
  _checkequals(t09, true);
  _checkequals(t10, true);

  boolean t11 = h instanceof Animal;
  boolean t12 = h instanceof Flier;
  boolean t13 = h instanceof Runner;
  boolean t14 = h instanceof Bird;
  boolean t15 = h instanceof Horse;
  boolean t16 = h instanceof Sleipnir;

  _checkequals(t11, true);
  _checkequals(t12, false);
  _checkequals(t13, true);
  _checkequals(t14, false);
  _checkequals(t15, true);
  _checkequals(t16, false);

  boolean t17 = i instanceof Animal;
  boolean t18 = i instanceof Flier;
  boolean t19 = i instanceof Runner;
  boolean t20 = i instanceof Bird;
  boolean t21 = i instanceof Horse;
  boolean t22 = i instanceof Sleipnir;

  _checkequals(t17, true);
  _checkequals(t18, true);
  _checkequals(t19, true);
  _checkequals(t20, false);
  _checkequals(t21, false);
  _checkequals(t22, true);

  boolean t23 = s instanceof Animal;
  boolean t24 = s instanceof Flier;
  boolean t25 = s instanceof Runner;
  boolean t26 = s instanceof Bird;
  boolean t27 = s instanceof Horse;
  boolean t28 = s instanceof Snake;

  _checkequals(t23, true);
  _checkequals(t24, false);
  _checkequals(t25, false);
  _checkequals(t26, false);
  _checkequals(t27, false);
  _checkequals(t28, true);
}

int checknum=1;
void _checkequals(boolean a, boolean b) {
  if (a != b) { _fail("Test #" + checknum + " failed"); }
  checknum++; _checkTrue(true);
}

test();
