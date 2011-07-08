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

_checkEqual(color.toArray(interA), [89, 89, 89, 143]);
_checkEqual(color.toArray(interB), [168, 168, 168, 87]);


// RGB

from = color(204, 102, 0);
to = color(0, 102, 153);
interA = lerpColor(from, to, .33);
interB = lerpColor(from, to, .66);

_checkEqual(color.toArray(interA), [136, 102, 50, 255]);
_checkEqual(color.toArray(interB), [69, 102, 100, 255]);


// RGB with alpha

from = color(204, 102, 0, 180);
to = color(0, 102, 153, 72);
interA = lerpColor(from, to, .33);
interB = lerpColor(from, to, .66);

_checkEqual(color.toArray(interA), [136, 102, 50, 144]);
_checkEqual(color.toArray(interB), [69, 102, 100, 108]);
