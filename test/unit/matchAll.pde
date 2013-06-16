String[][] res1 = matchAll("ttt", "t");
_checkEqual(3, res1.length);
String[][] res2 = matchAll("ttt", "p");
_checkIsNull(res2);
String[][] res3 = matchAll("ttt", "");
_checkEqual(4, res3.length);
