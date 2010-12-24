// RE: ticket 840

String s = "ababababa";
String sub1 = s.replace("bab", "xyz");
_checkEqual(sub1, "axyzaxyza");

String sub2 = "abc".replace("a", "xx").replace("bc", "y");
_checkEqual(sub2, "xxy");

String sub3 = s.replaceFirst("(bab)", "#$1#");
_checkEqual(sub3, "a#bab#ababa");

String sub3a = s.replace("(bab)", "#$1#");
_checkEqual(sub3a, "ababababa");

char[] c = "test".toCharArray();
_checkEqual(c[1].toString(), "e");
