ArrayList one = new ArrayList();
one.add("one");
one.add("two");

ArrayList two = new ArrayList();
two.add("three");
two.add("four");

one.addAll(two);

String[] elements = one.toArray();
String[] match = {"one", "two", "three", "four"};
_checkEqual(elements, match);
