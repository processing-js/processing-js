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
pushMatrix();
translate(50, 50);
printMatrix();
_checkEqual(" 01.0000  00.0000  50.0000\n 00.0000  01.0000  50.0000\n\n", msg);
popMatrix();

// SCALE
pushMatrix();
scale(2, 2);
printMatrix();
_checkEqual(" 2.0000  0.0000  0.0000\n 0.0000  2.0000  0.0000\n\n", msg);
popMatrix();

// RESET MATRIX
printMatrix();
_checkEqual(" 1.0000  0.0000  0.0000\n 0.0000  1.0000  0.0000\n\n", msg);

translate(1, 2);
rotate(3);
scale(4);
printMatrix();
_checkEqual("-3.9600 -0.5645  1.0000\n 0.5645 -3.9600  2.0000\n\n", msg);

resetMatrix();
printMatrix();
_checkEqual(" 1.0000  0.0000  0.0000\n 0.0000  1.0000  0.0000\n\n", msg);
