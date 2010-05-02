/* This test taken from processingjs.org reference page
*
* http://processingjs.org/reference/lerpColor%28%29
*/

color from, to, interA, interB;

color from = color(204, 102, 0);
color to = color(0, 102, 153);
color interA = lerpColor(from, to, .33);
color interB = lerpColor(from, to, .66);

// converted to array for simplicity and to uncouple it from color (don't deal with bits)
_checkEqual(color.toArray(interA), [136, 102, 50, 255]);
_checkEqual(color.toArray(interB), [69, 102, 100, 255]);
