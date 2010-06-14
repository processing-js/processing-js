// Tests multidimensional arrays greater than three

ArrayList list1 = new ArrayList();
list1.add("George");
list1.add("Jim");
list1.add("John");
list1.add("Blake");
list1.add("Kevin");
String[] list1Clone = (ArrayList)list1.toArray(String[0]);

_checkEqual(list1, list1Clone);

