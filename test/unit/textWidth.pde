// Andor Salga

size(100,100);

_checkEqual(0.0, textWidth(""));
_checkEqual(8.0, textWidth("X"));
_checkEqual(16.0, textWidth("XX"));

_checkEqual(4.0, textWidth(" "));
_checkEqual(8.0, textWidth("  "));
_checkEqual(12.0, textWidth("   "));

_checkEqual(3.0, textWidth("i"));
_checkEqual(4.0, textWidth("."));
_checkEqual(4.0, textWidth(","));
_checkEqual(4.0, textWidth("("));
_checkEqual(6.0, textWidth("_"));
_checkEqual(8.0, textWidth("~"));
_checkEqual(8.0, textWidth("#"));
_checkEqual(10.0, textWidth("W"));
_checkEqual(10.0, textWidth("@"));
