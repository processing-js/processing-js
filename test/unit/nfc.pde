int a=200, b=-40000, c=1901024;

String sa = nfc(a); 
_checkEqual(sa, "200");

String sb = nfc(b); 
_checkEqual(sb, "-40,000"); 

String sc = nfc(c); 
_checkEqual(sc, "1,901,024"); 
 
float d = 200.94, e = 40000, f = -1901024.012; 

String sd = nfc(d, 2); 
_checkEqual(sd, "200.94"); 

String se = nfc(e, 2); 
_checkEqual(se, "40,000.00"); 

String sf = nfc(f, 2); 
_checkEqual(sf, "-1,901,024.01");

// test to see if we can trim a long fractional number down to 2 decimal places
_checkEqual(nfc(1000.56789, 2), "1,000.57");

// does rounding work correctly
_checkEqual(nfc(-1234.99, 1), "-1,235.0");
_checkEqual(nfc(-1234.994, 2), "-1,234.99");

