// Tests for Processing char() function - http://processing.org/reference/char_.html

int i = 65;
byte b = 65;

_checkEqual('A', char(i));
_checkEqual('A', char(b));

int[] intArr=new int[3];
intArr[0]=70;
intArr[1]=117;
intArr[2]=98;
char[] intExp=new char[3];
intExp[0]='F';
intExp[1]='u';
intExp[2]='b';
_checkEqual(intExp, char(intArr));

byte[] byteArr=new byte[3];
byteArr[0]=98;
byteArr[1]=97;
byteArr[2]=114;
char[] byteExp=new char[3];
byteExp[0]='b';
byteExp[1]='a';
byteExp[2]='r';
_checkEqual(byteExp, char(byteArr));

_checkThrows(function(){char("NoStringsAllowed");});
_checkThrows(function(){char(true);});

String[] strArr=new String[3];
strArr[0]="No";
strArr[1]="Strings";
strArr[2]="Allowed";
for (var i = 0; i < strArr.length; i++)
  _checkThrows(function(){char(strArr[i]);});

boolean[] boolArr=new boolean[3];
boolArr[0]=false;
boolArr[1]=true;
boolArr[2]=false;
for (var i = 0; i < boolArr.length; i++)
  _checkThrows(function(){char(boolArr[i]);});
  
