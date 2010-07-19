// ArrayList.set(index, item)
// Replaces the element at the specified position in this list with the specified element.

ArrayList l;

l = new ArrayList();
l.add("1");
l.add("2");

l.set(0,"0");

_checkEqual(l[0], 0);
_checkEqual(l[1], 2);

