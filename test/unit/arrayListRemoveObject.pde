
class Something {
  public Something() {
  }
}

ArrayList a1 = new ArrayList();
ArrayList a2 = new ArrayList();

Something s1 = new Something();
Something s2 = new Something();

a1.add(s1);
a1.add(s2);

a2.add(s1);

a1.remove(s2);

_checkEqual(a1, a2);


a1.add(s2);
a2.add(s2);

_checkEqual(a1, a2);

_checkEqual(a1.remove(s1), a2.remove(s1));

_checkEqual(a1.remove(s2), a2.remove(s2));
