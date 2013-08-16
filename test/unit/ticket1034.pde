int j=0, width=0, i=0;

loadPixels();
pixels[j*width + i] = (i % 2 == 0) ? color(128) : color(255);
updatePixels();

var expected = 0xFF808080 | 0; // making it 32-bit integer
_checkEqual(expected, pixels[0]);

