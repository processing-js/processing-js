// INTEGER
int i1_32 = 0;
String si1_32 = "0";

int i2_32 = 1;
String si2_32 = "1";

int i3_32 = 5;
String si3_32 = "101";

int i4_32 = 2;
String si4_32 ="10";

int i5_32 = 255;
String si5_32 = "11111111";

int i6_32 = -5;
String si6_32 = "11111111111111111111111111111011";

int i7_32 = -255;
String si7_32 = "11111111111111111111111100000001";

int i8_32 = -452343;
String si8_32 = "11111111111110010001100100001001";

int i9_25 = 23847192;
String si9_25 = "1011010111110000100011000";

int i10_31 = 1431655765;
String si10_31 = "1010101010101010101010101010101";

_checkEqual(binary(i1_32), si1_32);
_checkEqual(binary(i2_32), si2_32);
_checkEqual(binary(i3_32), si3_32);
_checkEqual(binary(i4_32), si4_32);
_checkEqual(binary(i5_32), si5_32);
_checkEqual(binary(i6_32), si6_32);
_checkEqual(binary(i7_32), si7_32);
_checkEqual(binary(i8_32), si8_32);
_checkEqual(binary(i9_25,25), si9_25);
_checkEqual(binary(i10_31,31), si10_31);

// COLORS
color cr1 = color(0,0,0);
String scr1 = "11111111000000000000000000000000";

color cr2 = color(0,0,0,0);
String scr2 = "0";

color cr3_24 = color(0,0,0);
String scr3_24 = "000000000000000000000000";

color cr4 = color(0,0,0,1);
String scr4 = "1000000000000000000000000";

color cr5 = color(0,0,0,255);
String scr5 = "11111111000000000000000000000000";

color cr6_32 = color(255,0,0,255);
String scr6_32 = "11111111111111110000000000000000";

color cr7_32 = color(127,127,127,127);
String scr7_32 = "1111111011111110111111101111111";

color cr8 = color(0,127,0,127);
String scr8 = "1111111000000000111111100000000";

color cr9_32 = color(128,128,128,128);
String scr9_32 = "10000000100000001000000010000000";

color cr10 = color(255,128,64,8);
String scr10 = "1000111111111000000001000000";

color cr11_13 = color(255,128,64,8);
String scr11_13 = "0000001000000";  

color cr12_25 = color(0,0,0);
String scr12_25 = "1000000000000000000000000";

color cr13_32 = color(0,0,0,0);
String scr13_32 = "00000000000000000000000000000000";

color cr14_1 = color(0,0,0,0);
String scr14_1 = "0";

color cr15_2 = color(0,0,2,0);
String scr15_2 = "10";

color cr16 = color(255,204,0);
String scr16 = "11111111111111111100110000000000";

color cr17_16 = color(255,204,0);
String scr16_16 = "1100110000000000";

_checkEqual(binary(cr1), scr1);
//_checkEqual(binary(cr2), scr2);
_checkEqual(binary(cr3_24,24), scr3_24);
//_checkEqual(binary(cr4), scr4);
_checkEqual(binary(cr5), scr5);
_checkEqual(binary(cr6_32,32), scr6_32);
//_checkEqual(binary(cr7_32,32), scr7_32);

//_checkEqual(binary(cr8), scr8);
_checkEqual(binary(cr9_32,32), scr9_32);
//_checkEqual(binary(cr10), scr10);
//_checkEqual(binary(cr11_13,13), scr13_32);
//_checkEqual(binary(cr12_25,25), cr12_25);
_checkEqual(binary(cr13_32,32), scr13_32);
_checkEqual(binary(cr14_1,1), scr14_1);
_checkEqual(binary(cr15_2,2), scr15_2);
_checkEqual(binary(cr16), scr16);
//_checkEqual(binary(cr15_2,2), scr15_2);

// BYTE
byte b1_32 = 0;
String sb1_32 = "00000000000000000000000000000000";

byte b2_8 = 1;
String sb2_8 = "00000001";

byte b3_3 = 5;
String sb3_3 = "101";

byte b4_8 = -1;
String sb4_8 = "11111111";

byte b5_8 = -5;
String sb5_8 = "11111011";

byte b6_5 = -5;
String sb6_5 = "11011";

byte b7_8 = 127;
String sb7_8 = "01111111";

byte b8_8 = -127;
String sb8_8 = "10000001";  

byte b9_8 = 42;
String sb9_8 = "00101010";

byte b10_4 = 42;
String sb10_4 = "1010";

_checkEqual(binary(b1_32,32), sb1_32);
_checkEqual(binary(b2_8,8), b2_8);
_checkEqual(binary(b3_3,3), sb3_3);
_checkEqual(binary(b4_8,8), sb4_8);
_checkEqual(binary(b5_8,8), sb5_8);
_checkEqual(binary(b6_5,5), sb6_5);
_checkEqual(binary(b7_8,8), sb7_8);
_checkEqual(binary(b8_8,8), sb8_8);
_checkEqual(binary(b9_8,8), sb9_8);
_checkEqual(binary(b10_4,4),sb10_4);


// CHAR
char c1_17 = '0';
String sc1_17 = "00000000000110000";
  
char c2_32 = '0';
String sc2_32 = "00000000000000000000000000110000";

char c3_32 = 'a';
String sc3_32 = "00000000000000000000000001100001";

char c4_32 = 'A';
String sc4_32 = "00000000000000000000000001000001";

char c5_15 = ' ';
String sc5_15 = "000000000100000";
  
char c6_32 = ' ';
String sc6_32 = "00000000000000000000000000100000";

char c7 = '!';
String sc7 = "0000000000100001";
  
char c8 = char(255);
String sc8 = "00000000000000000000000011111111";
  
char c9_32 = char(127);
String sc9_32 = "00000000000000000000000001111111";
  
char c10_30 = 42;
String sc10_30 = "000000000000000000000000101010";
  
char c11_12 = 42;
String sc11_12 = "000000101010";
  
char c12_32 = char(-1);
String sc12_32 = "00000000000000001111111111111111"; 

_checkEqual(binary(c1_17,17), sc1_17);
_checkEqual(binary(c2_32,32), sc2_32);
_checkEqual(binary(c3_32,32), sc3_32);
_checkEqual(binary(c4_32,32), sc4_32);
_checkEqual(binary(c5_15,15), sc5_15);
_checkEqual(binary(c6_32,32), sc6_32);
_checkEqual(binary(c7), sc7);
//_checkEqual(binary(c8), sc8);
_checkEqual(binary(c9_32,32), sc9_32);
_checkEqual(binary(c10_30,30), sc10_30);
_checkEqual(binary(c11_12,12), sc11_12);
//_checkEqual(binary(c12_32,32), sc12_32);
