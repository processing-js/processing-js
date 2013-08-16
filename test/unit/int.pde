// Test that we do NOT convert hex and octal numbers
// NOTE: p5 does not convert these and returns the values stated below
// We want int to work exactly like p5
_checkEqual(int("0xFF"), 0);
_checkEqual(int("010"), 10);

byte b1=12;
_checkEqual(int(b1),12);
_checkEqual(int(10),10);
_checkEqual(int(10.49),10);
_checkEqual(int(10.5),10);
_checkEqual(int(11.49),11);
_checkEqual(int(11.5),11);
_checkEqual(int(65.0),65);

_checkEqual(int('E'),69);
_checkEqual(int("aa"),0);
_checkEqual(int("10.49"),10);
_checkEqual(int("10.5"),10);
_checkEqual(int("11.49"),11);
_checkEqual(int("11.5"),11);
_checkEqual(int("-10.5"),-10);
_checkEqual(int("-11.5"),-11);


float[] floatArr=new float[3];
floatArr[0]=10.5;
floatArr[1]=-11.5;
floatArr[2]=12.5;
int[] floatExp=new int[3];
floatExp[0]=10;
floatExp[1]=-11;
floatExp[2]=12;
_checkEqual(int(floatArr),floatExp);

char[] charArr=new char[4];
charArr[0]='@';
charArr[1]='M';
charArr[2]='a';
charArr[3]='t';
int[] charExp=new int[4];
charExp[0]=64;
charExp[1]=77;
charExp[2]=97;
charExp[3]=116;
_checkEqual(int(charArr),charExp);

// Known to fail. See:
// https://processing-js.lighthouseapp.com/projects/41284/tickets/310-int-does-not-handle-bytes-properly
byte[] byteArr=new byte[7];
byteArr[0]=-128;
byteArr[1]=-127;
byteArr[2]=-2;
byteArr[3]=-1;
byteArr[4]=0;
byteArr[5]=126;
byteArr[6]=127;
int[] byteExp=new int[7];
byteExp[0]=128;
byteExp[1]=129;
byteExp[2]=254;
byteExp[3]=255;
byteExp[4]=0;
byteExp[5]=126;
byteExp[6]=127;
//_checkEqual(int(byteArr),byteExp);
        
String[] stringArr=new String[4];
stringArr[0]="Won't work";
stringArr[1]="123 .45";
stringArr[2]="-123.45";
stringArr[3]="45";
int[] stringExp=new int[4];
stringExp[0]=0;
stringExp[1]=0;
stringExp[2]=0;
stringExp[3]=45;
_checkEqual(int(stringArr),stringExp);
