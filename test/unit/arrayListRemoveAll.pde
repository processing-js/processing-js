one = new ArrayList();
one.add(1);
one.add(2);
one.add(3);
one.add(4);
one.add(5);

two = new ArrayList();
two.add(1412);
two.add("hello");
two.add(5);
two.add(1);
two.add(13);

//removes the elements from one which exist in two
one.removeAll(two);
_checkEqual(one.get(0), 2);
_checkEqual(one.get(1), 3);
_checkEqual(one.get(2), 4);