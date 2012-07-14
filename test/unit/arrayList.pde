// Tests multidimensional arrays greater than three
int[][][][] testData = new int[2][2][3][3];

testData[1][1][1][1] = 1;

_checkEqual(testData[1][1][1][1], 1);
_checkEqual(testData[0][1][1][1], 0); // This test makes sure it's copied by value and not reference

ArrayList list1 = new ArrayList();
list1.add("George");
list1.add("Jim");
list1.add("John");
list1.add("Blake");
list1.add("Kevin");
ArrayList list1Clone = (ArrayList)list1.clone();

_checkEqual(list1, list1Clone);

list1Clone.remove(0);

ArrayList list2 = new ArrayList(list1);

_checkEqual(list1, list2);

ArrayList list3 = new ArrayList(5);
_checkEqual(list3.size(), 5);
