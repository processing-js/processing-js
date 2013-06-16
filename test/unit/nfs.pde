int a=200, b=-40, c=90; 

String sa = nfs(a, 10); 
_checkEqual(sa, " 0000000200");

String sb = nfs(b, 5); 
_checkEqual(sb, "-00040"); 

String sc = nfs(c, 3); 
_checkEqual(sc, " 090"); 
 
float d = -200.94, e = 40.2, f = -9.012; 

String sd = nfs(d, 10, 4); 
_checkEqual(sd, "-0000000200.9400"); 

String se = nfs(e, 5, 3); 
_checkEqual(se, " 00040.200"); 

String sf = nfs(f, 3, 5); 
_checkEqual(sf, "-009.01200");

// test to see if we can trim a long fractional number down to 2 decimal places
_checkEqual(nfs(1.56789, 1, 2), " 1.57");

// does rounding work correctly
_checkEqual(nfs(-123.99, 1, 1), "-124.0");
_checkEqual(nfs(-123.994, 4, 2), "-0123.99");


// P5 will always add 1 decimal place when calling nfs(float, left, right) even if 0 places to the left of the decimal are requested
_checkEqual(nfs(-5.1, 1, 0), "-5.1");

// should be the same results as requesting 1 decimal place
_checkEqual(nfs(-5.1, 1, 1), "-5.1"); 

// if a negative value for the right position is requested it will strip the decimal
_checkEqual(nfs(-5.1, 1, -1), "-5");
_checkEqual(nfs(5.1, 1, -273), " 5");
