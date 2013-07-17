// Tests for Processing str() function - http://processingjs.org/reference/str%28%29

boolean b = false;
byte y = -28;
char c = 'R';
float f = -32.6;
int i = 1024;

_checkEqual("false", str(b));
_checkEqual("-28", str(y));

// See #312 Char arguments indistinguishable from numbers
// https://processing-js.lighthouseapp.com/projects/41284/tickets/312-char-arguments-indistinguishable-from-numbers#ticket-312-1
//_checkEqual("R", str(c));

_checkEqual("-32.6", str(f));
_checkEqual("1024", str(i));

boolean[] boolArr=new boolean[4];
boolArr[0]=true;
boolArr[1]=false;
boolArr[2]=true;
boolArr[3]=true;
String[] boolExp=new String[4];
boolExp[0]="true";
boolExp[1]="false";
boolExp[2]="true";
boolExp[3]="true";
_checkEqual(boolExp, str(boolArr));

byte[] byteArr=new byte[4];
byteArr[0]=-128;
byteArr[1]=-127;
byteArr[2]=-2;
byteArr[3]=-1;
String[] byteExp=new String[4];
byteExp[0]="-128";
byteExp[1]="-127";
byteExp[2]="-2";
byteExp[3]="-1";
_checkEqual(byteExp, str(byteArr));

// See #312 Char arguments indistinguishable from numbers
// https://processing-js.lighthouseapp.com/projects/41284/tickets/312-char-arguments-indistinguishable-from-numbers#ticket-312-1
char[] charArr=new char[4];
charArr[0]='@';
charArr[1]='M';
charArr[2]='a';
charArr[3]='t';
String[] charExp=new String[4];
charExp[0]="@";
charExp[1]="M";
charExp[2]="a";
charExp[3]="t";
_checkEqual(charExp, str(charArr));

stringTest = "false-28R-32.61024";
_checkEqual(stringTest, (str(false) + str(-28) + str('R') + str(-32.6) + str(1024)));

float[] floatArr=new float[4];
floatArr[0]=10.5;
floatArr[1]=-11.5;
floatArr[2]=12.5;
floatArr[3]=543.21;
String[] floatExp=new String[4];
floatExp[0]="10.5";
floatExp[1]="-11.5";
floatExp[2]="12.5";
floatExp[3]="543.21";
_checkEqual(floatExp, str(floatArr));

int[] intArr=new int[4];
intArr[0]=-11;
intArr[1]=-1;
intArr[2]=23;
intArr[3]=45;
String[] intExp=new String[4];
intExp[0]="-11";
intExp[1]="-1";
intExp[2]="23";
intExp[3]="45";
_checkEqual(intExp, str(intArr));

String[] stringArr=new String[4];
stringArr[0]="@";
stringArr[1]="M";
stringArr[2]="a";
stringArr[3]="t";
String[] stringExp=new String[4];
stringExp[0]="@";
stringExp[1]="M";
stringExp[2]="a";
stringExp[3]="t";
_checkEqual(stringExp, str(stringArr));
