float[] a = { 3.4, 3.6, 2, 0, 7.1 };
a = sort(a);

_checkEqual(a, [0, 2, 3.4, 3.6, 7.1]);

String[] s = { "deer", "elephant", "bear", "aardvark", "cat" };
s = sort(s, 3);

_checkEqual(s, ["bear", "deer", "elephant", "aardvark", "cat"] );
