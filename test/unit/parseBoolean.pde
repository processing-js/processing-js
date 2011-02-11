//	parseBoolean Example

int intVar = 0;
boolean intBool = parseBoolean(intVar);

int[] intArray = {0, 1, 5};
boolean[] intBoolArray = parseBoolean(intArray); 
  
string strVar = "true";
boolean strBool = parseBoolean(strVar);
  
string[] strArray = {"false", "TRUE", "True"};
boolean[] strBoolArray = parseBoolean(strArray);
  
byte byteVar = 0;
boolean byteBool = parseBoolean(byteVar);
  
byte[] byteArray = {0, 1};
boolean[] byteBoolArray = parseBoolean(byteArray);

_checkEqual(intBool, false);
_checkEqual(intBoolArray, {false, true, true});
_checkEqual(strBool, true);
_checkEqual(strBoolArray, {false, true, true});
_checkEqual(byteBool, false);
_checkEqual(byteBoolArray, {false, true});
