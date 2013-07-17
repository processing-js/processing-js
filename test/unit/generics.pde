// simple generics tests
ArrayList<String> strings = new ArrayList();
strings.add("some string");
_checkEqual(strings.get(0), "some string");

// nested
ArrayList<ArrayList<ArrayList<?>>> test = new ArrayList();


// declaration
class CustomList<AnonymousType>
{
  private ArrayList<AnonymousType> items = new ArrayList();
  void add(AnonymousType a) { items.add(a); }
  AnonymousType get(int index) { return items.get(index); }
}

CustomList<Integer> c1 = new CustomList();
c1.add(1);
c1.add(2);
_checkEqual(c1.get(1), 2);

// extends tests
class A {
}

class B extends A {
}

// (?) there is no super in p5
class C <T super B, S extends A, V> {
  <X super B> void method1(X x, CustomList<? extends A> list) {}
  public <Y extends A> void method2(Y y) {}
  void method3(ArrayList<?> a) {}
}

A a = A();
B b = B();
C<B,A,CustomList<A> > c = new C();
c.method1(b);
c.method2(a);
CustomList<A> list = new CustomList();
list.add(a);
c.method3(list);
A a = new A();
B b = new B();
CustomList<A> list = new CustomList();
list.add(a);
ArrayList<String> list2 = new ArrayList();
C<B,A,CustomList<A> > c = new C();
c.method1(b, list);
c.method2(a);
c.method3(list2);

// anti-generics
int i = 1, j = 2, q = 3;
if(j<<q>0) { i = 22; } _checkEqual(i, 22);
 if(0<j>=false) { i = 44; } _checkEqual(i, 44);

// next lines will fail, trade-off?
// if(0<j>>q) { i = 33; } _checkEqual(i, 33);
// void func1(boolean a, boolean b) {} func1(0<j,q> 0);


// test array notation
String[] strarr = {"a","b","c"};
HashMap<String, String[]> hms1 = new HashMap<String, String[]>();
hms1.put("a",strarr);
_checkEqual(hms1.get("a"), strarr);

HashMap<String[], String> hms2 = new HashMap<String[], String>();
hms2.put(strarr,"a");
_checkEqual(hms2.get(strarr),"a");

HashMap<String[], String[]> hms3 = new HashMap<String[], String[]>();
hms3.put(strarr,strarr);
_checkEqual(hms3.get(strarr),strarr);

String[][] strarr2 = {{"a","b","c"}};
HashMap<String, String[][]> hms4 = new HashMap<String, String[][]>();
hms4.put("a",strarr2);
_checkEqual(hms4.get("a"), strarr2);

HashMap<String[][], String> hms5 = new HashMap<String[][], String>();
hms5.put(strarr2,"a");
_checkEqual(hms5.get(strarr2),"a");

HashMap<String[][], String[][]> hms6 = new HashMap<String[][], String[][]>();
hms5.put(strarr2,strarr2);
_checkEqual(hms5.get(strarr2),strarr2);
