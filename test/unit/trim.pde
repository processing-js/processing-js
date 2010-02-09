String s = "  Somerville MA ";
String s2 = trim(s);

String[] a = { " inconsistent ", " spacing" };
String[] a2 = trim(a);

_checkEqual(s2, "Somerville MA");
_checkEqual(a2[0], "inconsistent");
_checkEqual(a2[1], "spacing");
