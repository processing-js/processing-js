// Unit tests for splitTokens(str,tokens)

String s = "testing string\nwith\twhite space\rthings";
String[] sub = splitTokens(s);
_checkEqual(sub, ["testing","string","with","white","space","things"]);

s = "testing [bracketing] (characters) <for> {additional} safety";
sub = splitTokens(s, " []()<>{}");
_checkEqual(sub, ["testing","bracketing","characters","for","additional","safety"]);

s = "testing string\nwith\twhite space\rthings\fexplicitly";
sub = splitTokens(s," \n\t\r\f");
_checkEqual(sub, ["testing","string","with","white","space","things","explicitly"]);

s = "testing.*,+,.*+,+..-,,-,.,long.-,,-,.*.+..?,.*,.token,+,.\\,*+.+,-.*,string";
sub = splitTokens(s,",.*-+\\?");
_checkEqual(sub, ["testing","long","token","string"]);

s = "xxxxxxxxxxxxx This string starts on a token list";
sub = splitTokens(s,"x");
_checkEqual(sub, [" This string starts on a token list"]);

s = "This string ends on a token list xxxxxxxxxxxxx";
sub = splitTokens(s,"x");
_checkEqual(sub, ["This string ends on a token list "]);
