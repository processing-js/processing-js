// Tests multidimensional arrays greater than three

ArrayList list1 = new ArrayList();
list1.add("George");
list1.add("Jim");
list1.add("John");
list1.add("Blake");
list1.add("Kevin");
Object[] list1Clone = list1.toArray();

_checkEqual(list1Clone, ["George", "Jim", "John", "Blake", "Kevin"]);

