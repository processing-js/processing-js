// 	arrayCopy example
String[] north = { "OH", "IN", "MI"};
String[] south = { "GA", "FL", "NC"}; 
arrayCopy(north, 1, south, 0, 2); // South is now IN, MI, NC
_checkEqual(south[0], "IN");  
_checkEqual(south[1], "MI"); 
_checkEqual(south[2], "NC"); 

int[] numbers = new int[3];
numbers[0] = 90;
numbers[1] = 150;
numbers[2] = 30;
int[] added = new int[3];
arrayCopy(numbers,added);
added[1] = added[0] + added[1]; // Sets added[1] to 240
added[2] = added[1] + added[2]; // Sets added[2] to 270
_checkEqual(added[0], 90);  
_checkEqual(added[1], 240); 
_checkEqual(added[2], 270); 


String[][] codes = {{"ON", "QC", "PE", "NB"}, {"FL", "NY", "TX", "CA"}};

String[][] codes2 = {{"NS", "MN", "BC", "NF"}, {"IL", "NJ", "WY", "OH"}};

String[][] combined = new String[4][4];
arrayCopy(codes, combined); // combined is now ON,QC,PE,NB,FL,NY,TX,CA,0,0,0,0,0,0,0,0
_checkEqual(combined[0][0], "ON");  
_checkEqual(combined[0][1], "QC"); 
_checkEqual(combined[1][0], "FL");  
_checkEqual(combined[1][1], "NY");
_checkIsNull(combined[2][0]);  
_checkIsNull(combined[2][1]);
arrayCopy(codes2, 0, combined, 2, 2); //combined is now ON,QC,PE,NB,FL,NY,TX,CA,NS,MN,BC,NF,IL,NJ,WY,OH
_checkEqual(combined[2][0], "NS");  
_checkEqual(combined[2][1], "MN");
_checkEqual(combined[3][0], "IL");  
_checkEqual(combined[3][1], "NJ");

String[] temp = {"hello", "world"};
String[][] src = {temp};
String[][] dst = {{"good", "day"}};

_checkEqual(dst[0][0], "good"); // should print "good"
_checkEqual(dst[0][1], "day"); // should print "day"

arrayCopy(src, dst);

_checkEqual(dst[0][0], "hello"); // should print "hello", "world"
_checkEqual(dst[0][1], "world"); // should print "hello", "world"

temp[1] = "planet";

_checkEqual(dst[0][0], "hello"); // should print "hello", "world"
_checkEqual(dst[0][1], "planet"); // should print "planet"
