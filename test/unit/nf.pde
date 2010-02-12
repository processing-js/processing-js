int a=200, b=40, c=90;
String sa = nf(a, 10);
_checkEqual(sa, "0000000200");
String sb = nf(b, 5);
_checkEqual(sb, "00040");
String sc = nf(c, 3);
_checkEqual(sc, "090");

float d = 200.94, e = 40.2, f = 9.012;
String sd = nf(d, 10, 4);
_checkEqual(sd, "0000000200.9400");
String se = nf(e, 5, 3);
_checkEqual(se, "00040.200");
String sf = nf(f, 3, 5);
_checkEqual(sf, "009.01200");
