ArrayList list = new ArrayList();
list.add("George");
list.add("Jim");
list.add("John");
list.add("Blake");
list.add("Kevin");
list.add("George");
list.add("Jim");
list.add("John");
list.add("Blake");
list.add("Kevin");
list.add("George");
list.add("Jim");
list.add("John");
list.add("Blake");
list.add("Kevin");
list.add("George");
list.add("Jim");
list.add("John");
list.add("Blake");
list.add("Kevin");

int firstKevin = list.indexOf("Kevin");
_checkEqual(firstKevin, 4);

int lastKevin = list.lastIndexOf("Kevin");
_checkEqual(lastKevin, 19);
