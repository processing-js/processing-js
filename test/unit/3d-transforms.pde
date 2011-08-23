
var msg = "";
$p.println = function(m){ msg = m; } 

size(100, 100, OPENGL);

box(10);
translate(10, 10, 10);
scale(2, 0.5, 1);
rotateX(1);
rotateY(1);
rotateZ(1);

printMatrix();
_checkEqual(" 00.5839 -00.9093  01.6829 -40.0000\n 00.4186 -00.1519 -00.2273 -40.0000\n 00.4624  00.8372  00.2919 -76.6025\n 00.0000  00.0000  00.0000  01.0000\n\n", msg);
