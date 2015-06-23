/* This test taken from processingjs.org reference page
*
* http://processingjs.org/reference/lerpColor%28%29
*/

color from, to, interA, interB;

// Grayscale

from = color(10);
to = color(250);
interA = lerpColor(from, to, .33);
interB = lerpColor(from, to, .66);

// converted to array for simplicity and to uncouple it from color (don't deal with bits)
_checkEqual(color.toArray(interA), [89, 89, 89, 255]);
_checkEqual(color.toArray(interB), [168, 168, 168, 255]);


// Grayscale with alpha

from = color(10, 200);
to = color(250, 30);
interA = lerpColor(from, to, .33);
interB = lerpColor(from, to, .66);

_checkEqual(color.toArray(interA), [89, 89, 89, 144]);
_checkEqual(color.toArray(interB), [168, 168, 168, 88]);


// RGB

from = color(204, 102, 0);
to = color(0, 102, 153);
interA = lerpColor(from, to, .33);
interB = lerpColor(from, to, .66);

_checkEqual(color.toArray(interA), [137, 102, 50, 255]);
_checkEqual(color.toArray(interB), [69, 102, 101, 255]);


// RGB with alpha

from = color(204, 102, 0, 180);
to = color(0, 102, 153, 72);
interA = lerpColor(from, to, .33);
interB = lerpColor(from, to, .66);

_checkEqual(color.toArray(interA), [137, 102, 50, 144]);
_checkEqual(color.toArray(interB), [69, 102, 101, 109]);


// HSB

colorMode(HSB, 255);
  
from = color(204, 102, 0);
to = color(0, 102, 153);
interA = lerpColor(from, to, .33);
interB = lerpColor(from, to, .66);

_checkEqual(color.toArray(interA), [50, 44, 44, 255]);
_checkEqual(color.toArray(interB), [101, 74, 74, 255]);

// HSB with alpha

from = color(70, 102, 80, 145);
to = color(200, 10, 58, 28);
interA = lerpColor(from, to, .33);
interB = lerpColor(from, to, .66);

_checkEqual(color.toArray(interA), [52, 73, 65, 106]);
// p5 estimates a little bit different values
// _checkEqual(color.toArray(interB), [54, 58, 65, 67]);
_checkEqual(color.toArray(interB), [55, 60, 65, 68]);

