color c = #ffcc00;
_checkEqual(hex(c), "FFFFCC00"); 
_checkEqual(hex(c, 6), "FFCC00");

color c = color(255, 204, 0);
_checkEqual(hex(c), "FFFFCC00");
_checkEqual(hex(c, 6), "FFCC00");
