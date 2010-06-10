// checks for word boundries on variable names containing "interface" and "class"

String _interface = 7;
String _class = 8;

String interface_ = 7;
String class_ = 8;

_checkNotEqual(_class, _interface);
_checkNotEqual(class_, interface_);

