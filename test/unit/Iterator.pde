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

Iterator it = list1.iterator();

_checkEqual(it.hasNext(), true);
_checkEqual(it.next(), "George");
_checkEqual(it.next(), "Jim");

var str;

for (Iterator it2 = list1.iterator(); it2.hasNext();) {
  str = it2.next();
  _checkEqual(typeof str, "string");
}
_checkEqual(str, "Kevin");

