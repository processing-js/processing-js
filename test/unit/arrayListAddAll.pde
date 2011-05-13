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

ArrayList three = new ArrayList();
three.add("five");
three.add("six");

one.addAll(2,three);

String[] elements2 = one.toArray();
String[] match2 = {"one", "two", "five", "six", "three", "four"};
_checkEqual(elements2, match2);

one = new ArrayList();
two = new ArrayList();
two.add("t");
one.addAll(0, two);
_checkEqual(one.get(0), "t");