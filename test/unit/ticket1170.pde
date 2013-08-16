// check if does not do __int_cast(t > 5)
float t = 5.5;
boolean b = (int)t > 5;
_checkEqual(b, false);

// parser check
float precision, ix, bounds_xmin;
boolean valid_xmin = (int)(precision * (ix-bounds_xmin)) >= -0.01;
