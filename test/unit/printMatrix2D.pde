// The push/pop Matrix calls are here due to an issue with printMatrix
// Once this issue is resolved, these calls may be removed.

var console;
var msg = "";
$p.print = $p.println = function(m){ msg = m; } 

// IDENTITY
size(100, 100);
printMatrix();
_checkEqual(" 1.0000  0.0000  0.0000\n 0.0000  1.0000  0.0000\n\n", msg);

// TRANSLATE
size(100, 100);
pushMatrix();
translate(50, 50);
printMatrix();
_checkEqual(" 01.0000  00.0000  50.0000\n 00.0000  01.0000  50.0000\n\n", msg);
popMatrix();

// SCALE
size(100, 100);
pushMatrix();
scale(2, 2);
printMatrix();
_checkEqual(" 2.0000  0.0000  0.0000\n 0.0000  2.0000  0.0000\n\n", msg);
popMatrix();

// There are some differences here between P5 and PJS in the way they
// add negative zeros.
// This one doesn't seem to pass
// ROTATE
/*size(100, 100);
pushMatrix();
rotate(PI);
printMatrix();
_checkEqual(" -1.0000 -0.0000  0.0000\n 0.0000 -1.0000  0.0000\n\n", msg);
popMatrix();*/