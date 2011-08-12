String s = "aBcDeFgHiJkLmNoP";
String s1 = s.toLowerCase();
String s2 = s.toUpperCase();
_checkTrue(s.equalsIgnoreCase(s1));
_checkTrue(s.equalsIgnoreCase(s2));
_checkTrue(s1.equalsIgnoreCase(s));
_checkTrue(s2.equalsIgnoreCase(s));
_checkTrue(s1.equalsIgnoreCase(s2));
_checkTrue(s2.equalsIgnoreCase(s1));

class SClass {
  int equalsIgnoreCase(SClass other) {
    return 10;
  }
}

SClass sc1 = new SClass();
SClass sc2 = new SClass();

_checkEqual(sc1.equalsIgnoreCase(sc2), 10);
