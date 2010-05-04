// Tests multidimensional arrays greater than three
int[][][][] testData = new int[2][2][3][3];

testData[1][1][1][1] = 1;

_checkEqual(testData[1][1][1][1], 1);
_checkEqual(testData[0][1][1][1], 0); // This test makes sure it's copied by value and not reference
