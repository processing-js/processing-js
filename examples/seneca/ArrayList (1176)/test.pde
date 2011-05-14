// class that allows us to avoid "instanceof" checks for now,
// since that operator is not yet fixed in the version of PJS
// this test is for
class Typed
{
  String type = "";
  String toString() { return type; }
  boolean equals(Object o)
  {
    if(this==o) return true;
    Typed other = (Typed) o;
    return (type.equals(other.type));
  }
}

class A extends Typed
{
  A() { type="A"; }
}

class B extends Typed
{
  B() { type="B"; }
}

class C extends B
{
  // any B.equals(C), so removing C from a list with B may remove B.
  String toString() { return "C"; }
}

void setup()
{
  // some list elements
  A a = new A();
  B b = new B();
  C c = new C();
  String d = "lalala";

  // the list
  ArrayList alist = new ArrayList();

  // fill list, and pad with some extra elements
  alist.add(a);
  alist.add(b);
  alist.add(c);
  alist.add(d);
  alist.add("five");
  alist.add("six");
  alist.add("seven");

  // check whether the pjs in question has toString patched
  boolean fixed = a.toString().equals("A");

  int errors = 0;
  // attempt removals
  println("removing d from list: "+alist.remove(d)+" list: "+listToString(alist));
  if (!listToString(alist).equals(fixed ? "[A, B, C, five, six, seven]" : "[[object Object], [object Object], C, five, six, seven]"))
  {
    println("FAILED");
    errors++;
  }
  
  println("removing c from list: "+alist.remove(c)+" list: "+listToString(alist));
  if (!listToString(alist).equals(fixed ? "[A, C, five, six, seven]" : "[[object Object], C, five, six, seven]"))
  {
    println("FAILED");
    errors++;
  }

  println("removing b from list: "+alist.remove(b)+" list: "+listToString(alist));
  if (!listToString(alist).equals(fixed ? "[A, five, six, seven]" : "[[object Object], five, six, seven]"))
  {
    println("FAILED");
    errors++;
  }

  println("removing a from list: "+alist.remove(a)+" list: "+listToString(alist));
  if (!listToString(alist).equals("[five, six, seven]"))
  {
    println("FAILED");
    errors++;
  }

  println("removing 0 from list: "+alist.remove(0)+" list: "+listToString(alist));
  if (!listToString(alist).equals("[six, seven]"))
  {
    println("FAILED");
    errors++;
  }

  println("removing last element from list: "+alist.remove(alist.size()-1)+" list: "+listToString(alist));
  if (!listToString(alist).equals("[six]"))
  {
    println("FAILED");
    errors++;
  }

  if(errors==0) { println("PASSED"); }
  else { println(errors + " failed"); }
  noLoop();
}

String listToString(ArrayList alist)
{
  String str = "[";
  for(int e=0; e<alist.size(); e++)
  {
    str += alist.get(e).toString();
    if(e<alist.size()-1) { str += ", "; }
  }
  return str + "]";
}
