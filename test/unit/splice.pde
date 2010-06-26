String[] a1 = {"a"};
String[] b1 = {"a","b","c"};
String[] c1 = {"a","a","b","c"};

String[] a2 = {"OH", "NY", "CA"};
String[] b2 = {"KY"};
String[] c2 = {"OH", "KY", "NY", "CA"};

String[] a3 = {"OH", "KY", "NY", "CA" };
String[] b3 = {"VA", "CO", "IL"};
String[] c3 = {"OH", "KY", "VA", "CO", "IL", "NY", "CA"};

int[] a4 = {1, 2, 3, 4};
int[] b4 = {0};
int[] c4 = {0, 1, 2, 3,4};

int[] a5 = {1, 2, 3, 4};
int[] b5 = {5};
int[] c5 = {1,2,3,4,5};

float[] a6 = {1.1, 2.2, 3.3};
float b6 = 4.4;
float[] c6 = {1.1, 2.2, 3.3, 4.4};

char[] a7 = {'a','e','f'};
char[] b7 = {'b','c','d'};
char[] c7 = {'a','b','c','d','e','f'};

String[] a8 = {};
String[] b8 = {"A","B","C"};
String[] c8 = {"A","B","C"};

int[] a9 = {1, 2, 3};
int[] b9 = {};
int[] c9 = {1, 2, 3};

String[] a10 = {"AA", "BB"};
String b10 = "CC";
String[] c10 = {"AA","BB","CC"};

String[] a10 = {"AA", "BB"};
String b10 = "CC";
String[] c10 = {"AA","BB","CC"};

color[] a12 = {color(0,0,0),color(128,255,0)};
color[] b12 = {color(255,255,255)};
color[] c12 = {color(255,255,255),color(0,0,0),color(128,255,0)};

byte[] a13 = {0, 50, 120};
byte[] b13 = {1,2,3};
byte[] c13 = {0,50,1,2,3,120};

int[][] a14 ={
              {4,5,6},
              {7,8,9}
            };
    
int[] b14 = {1,2,3};
int[] c14 = {1,2,3,4,5,6};

String[][] a15 =  {
                   {"the", "quick", "brown"},
                   {"fox", "jumped", "over"},
                   {"all", "the", "lazy", "dogs"}
                 };

String[][] b15 = {
                   {"a","b","c"},
                   {"I", "keep", "six", "honest", "serving-men"}
                };

String[] c15 =  {"fox", "jumped", "a","b","c","over"};

String[][] a16 = {{}};
String[][] b16 = {{"K"}};
String[] c16 = {"K"};

float[] a17 = {1.2, 3.4, 5.6};
float[][] b17 = {{0.0,1.1,2.2}};
float[] c17 = {1.2, 0.0, 1.1, 2.2, 3.4, 5.6};

char[][] a18 = {{}};
char[][] b18 = {{}};
char[] c18 = {};

int[] a19 = {1,2,3,4};
int[] b19 = {4,5,6,7};
int[] c19 = {0,9,0,9};
int[] d19 = {1,2,0,9,0,9,3,4,5,6,7,4};

_checkEqual(splice(a1, b1, 1), c1);
_checkEqual(splice(a2, b2, 1), c2);
_checkEqual(splice(a3, b3, 2), c3);
_checkEqual(splice(a4, b4, 0), c4);
_checkEqual(splice(a5, b5, 4), c5);
_checkEqual(splice(a6, b6, 3), c6);
_checkEqual(splice(a7, b7, 1), c7);
_checkEqual(splice(a8, b8, 0), c8);
_checkEqual(splice(a9, b9, 0), c9);
_checkEqual(splice(a12, b12, 0), c12);
_checkEqual(splice(a13, b13, 2), c13);
_checkEqual(splice(a14[0], b14, 0), c14);
_checkEqual(splice(a15[1], b15[0], 2), c15);
_checkEqual(splice(a16[0], b16[0], 0), c16);
_checkEqual(splice(a17, b17[0], 1), c17);
_checkEqual(splice(a18[0], b18[0], 0), c18);
_checkEqual(splice(splice(a19, b19, 3), c19, 2), d19);
