// ArrayList.add(index, item)
// Inserts the specified element at the specified position in this list.

ArrayList l;

l = new ArrayList();
l.add("1");
l.add(1, "2");
l.add(2, "3");
l.add(3,"4");
l.add("5");

_checkEqual(l.get(0), "1");
_checkEqual(l.get(1), "2");
_checkEqual(l.get(2), "3");
_checkEqual(l.get(3), "4");
_checkEqual(l.get(4), "5");

