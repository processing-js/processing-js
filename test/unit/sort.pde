float[] a = { 3.4, 3.6, 2, 0, 7.1 };
a = sort(a);

_checkEqual(a[0], 0);
_checkEqual(a[4], 7.1);

String[] s = { "deer", "elephant", "bear", "aardvark", "cat" };
s = sort(s, 3);

_checkEqual(s[0], "bear");
_checkEqual(s[2], "elephant");
_checkEqual(s[4], "cat");
