char[] chars = "hello".toCharArray();

_checkEqual(chars[0].toString(), "h");
_checkEqual(chars[1], 101);
_checkEqual(chars[chars.length-1].toString(), "o");
