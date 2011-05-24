// ticket 1025 check
// exception when start arg = stop arg

beginShape();
endShape();

_checkEqual(0,0); // register success

arc(100, 100, 50, 50, 0, 0);

_checkEqual(0,0); // register success

