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
//alist.add(d);
alist.add("five");
alist.add("six");
alist.add("seven");

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

// check whether the pjs in question has toString patched
boolean fixed = a.toString().equals("A");

alist.remove(d);
_checkTrue(listToString(alist).equals(fixed ? "[A, B, C, five, six, seven]" : "[[object Object], [object Object], C, five, six, seven]"));

alist.remove(c);
_checkTrue(listToString(alist).equals(fixed ? "[A, C, five, six, seven]" : "[[object Object], C, five, six, seven]"));

alist.remove(b);
_checkTrue(listToString(alist).equals(fixed ? "[A, five, six, seven]" : "[[object Object], five, six, seven]"));

alist.remove(a);
_checkTrue(listToString(alist).equals("[five, six, seven]"));

alist.remove(0);
_checkTrue(listToString(alist).equals("[six, seven]"));

alist.remove(alist.size()-1);
_checkTrue(listToString(alist).equals("[six]"));
