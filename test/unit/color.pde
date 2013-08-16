
color a,
      aa,
      b,
      bb,
      c,
      cc,
      d,
      e,
      f,
      g,
      h,
      i,
      j,
      k,
      l,
      m;

// 1 Arg: Grayscale
a = color(255);
b = color(300);
c = color(57);
d = color(0);  // Edge case against "0" being handled as JS boolean "False"

_checkEqual(color.toArray(a), [255, 255, 255, 255]);
_checkEqual(color.toArray(b), [0, 1, 44, 0]);
_checkEqual(color.toArray(c), [57, 57, 57, 255]);
_checkEqual(color.toArray(d), [0, 0, 0, 255]);

_checkEqual(color.toString(a), "rgba(255,255,255,1)");
_checkEqual(color.toString(b), "rgba(0,1,44,0)");
_checkEqual(color.toString(c), "rgba(57,57,57,1)");
_checkEqual(color.toString(d), "rgba(0,0,0,1)");


// 1 Arg: Hex
a = color(#FF00FF);
aa = color(255,000,255);
b = color(#000000);
bb = color(000,000,000);
c = color(#884422);
cc = color(136,68,34);

_checkEqual(color.toArray(a), [255, 0, 255, 255]);
_checkEqual(color.toArray(b), [0, 0, 0, 255]);
_checkEqual(color.toArray(c), [136, 68, 34, 255]);

_checkEqual(color.toString(a), "rgba(255,0,255,1)");
_checkEqual(color.toString(b), "rgba(0,0,0,1)");
_checkEqual(color.toString(c), "rgba(136,68,34,1)");

_checkEqual(a, aa);
_checkEqual(b, bb);
_checkEqual(c, cc);

// 2 Args: Grayscale, Alpha
a = color(255, 100);
b = color(300, 300);
c = color(57, 0);
d = color(0, 0);

_checkEqual(color.toArray(a), [255, 255, 255, 100]);
_checkEqual(color.toArray(b), [255, 255, 255, 255]);
_checkEqual(color.toArray(c), [57, 57, 57, 0]);
_checkEqual(color.toArray(d), [0, 0, 0, 0]);

_checkEqual(color.toString(a), "rgba(255,255,255,0.39215686274509803)");
_checkEqual(color.toString(b), "rgba(255,255,255,1)");
_checkEqual(color.toString(c), "rgba(57,57,57,0)");
_checkEqual(color.toString(d), "rgba(0,0,0,0)");


// 2 Args: Color, Alpha
a = color(255, 100, 200);
b = color(a, 128);

_checkEqual(color.toArray(b), [255, 100, 200, 128]);


// 3 Args: R, G, B
a = color(100, 200, 0);
b = color(500, 255, 255); // In this situation the overflowed red value should be normalized to 255
c = color(0, 0, 0);

_checkEqual(color.toArray(a), [100, 200, 0, 255]);
_checkEqual(color.toArray(b), [255, 255, 255, 255]);
_checkEqual(color.toArray(c), [0, 0, 0, 255]);

_checkEqual(color.toString(a), "rgba(100,200,0,1)");
_checkEqual(color.toString(b), "rgba(255,255,255,1)");
_checkEqual(color.toString(c), "rgba(0,0,0,1)");


// 4 Args: R, G, B, A
a = color(100, 200, 0, 200);
b = color(100, 300, 100, 300);
c = color(57, 128, 255, 0);
d = color(0, 0, 0, 0);

_checkEqual(color.toArray(a), [100, 200, 0, 200]);
_checkEqual(color.toArray(b), [100, 255, 100, 255]);
_checkEqual(color.toArray(c), [57, 128, 255, 0]);
_checkEqual(color.toArray(d), [0, 0, 0, 0]);

_checkEqual(color.toString(a), "rgba(100,200,0,0.7843137254901961)");
_checkEqual(color.toString(b), "rgba(100,255,100,1)");
_checkEqual(color.toString(c), "rgba(57,128,255,0)");
_checkEqual(color.toString(d), "rgba(0,0,0,0)");

// Test limits under 0 and over 255
a = color(255, 0, 0, -30);
b = color(-1, 200, 100);

_checkEqual(color.toArray(a), [255, 0, 0, 0]);
_checkEqual(color.toArray(b), [0, 200, 100, 255]);

// Test colorMode
colorMode(RGB, 100);
a = color(55);
b = color(70);
c = color(85);
d = color(100);

_checkEqual(color.toArray(a), [140, 140, 140, 255]);
_checkEqual(color.toArray(b), [179, 179, 179, 255]);
_checkEqual(color.toArray(c), [217, 217, 217, 255]);
_checkEqual(color.toArray(d), [255, 255, 255, 255]);

colorMode(RGB, 1, 10, 100);
a = color(1, 10, 100);
b = color(0.5, 5, 50);
c = color(0, 0, 0);

_checkEqual(color.toArray(a), [255, 255, 255, 255]);
_checkEqual(color.toArray(b), [128, 128, 128, 255]);
_checkEqual(color.toArray(c), [0, 0, 0, 255]);

// HSB
colorMode(HSB, 360, 100, 100, 100);
a = color(360, 100, 100);
b = color(500, 500, 500);
c = color(100, 50, 50);
d = color(0, 0, 0);
e = color(0, 100, 100);

f = color(#ff00fe); // check 1 arg color int
g = color(#ff00fe, 50); // check 2 arg color int and alpha

// Grayscale
h = color(360);
i = color(90);
j = color(0);

// Grayscale and Alpha
k = color(360, 50);
l = color(90, 25);
m = color(0, 100);

_checkEqual(color.toArray(a), [255, 0, 0, 255]);
_checkEqual(color.toArray(b), [255, 0, 0, 255]);
_checkEqual(color.toArray(c), [85, 128, 64, 255]);
_checkEqual(color.toArray(d), [0, 0, 0, 255]);
_checkEqual(color.toArray(e), [255, 0, 0, 255]);

_checkEqual(color.toArray(f), [255, 0, 254, 255]);
_checkEqual(color.toArray(g), [255, 0, 254, 128]);

_checkEqual(color.toArray(h), [255, 255, 255, 255]);
_checkEqual(color.toArray(i), [64, 64, 64, 255]);
_checkEqual(color.toArray(j), [0, 0, 0, 255]);

_checkEqual(color.toArray(k), [255, 255, 255, 128]);
_checkEqual(color.toArray(l), [64, 64, 64, 64]);
_checkEqual(color.toArray(m), [0, 0, 0, 255]);

// Test Hue, Saturation, Brightness
colorMode(HSB, 255);
color c = color(0, 126, 255);
_checkEqual(hue(c),0);
_checkEqual(saturation(c),126);
_checkEqual(brightness(c),255);

// Test HSB colorMode limiting
colorMode(RGB, 100);
color h1 = color(100);
_checkEqual([hue(h1), saturation(h1), brightness(h1)], [0, 0, 100]);

// Test HSB color
colorMode(RGB, 255);
color c1 = color(204, 153, 0);
color c2 = #FFCC00;
_checkEqual([hue(c1), saturation(c1), brightness(c1)], [31.875, 255,204], 0.001);
_checkEqual([hue(c2), saturation(c2), brightness(c2)], [34, 255,255], 0.001);

color w2 = color(255, 255, 255);
_checkEqual(red(w2), 255);
_checkEqual(green(w2), 255);
_checkEqual(blue(w2), 255);
_checkEqual(alpha(w2), 255);

color w3 = color(0xFFFFFFFF);
_checkEqual(red(w3), 255);
_checkEqual(green(w3), 255);
_checkEqual(blue(w3), 255);
_checkEqual(alpha(w3), 255);

color w4 = color(#FFFFFF);
_checkEqual(red(w4), 255);
_checkEqual(green(w4), 255);
_checkEqual(blue(w4), 255);
_checkEqual(alpha(w4), 255);

color w5 = color(255);
_checkEqual(red(w5), 255);
_checkEqual(green(w5), 255);
_checkEqual(blue(w5), 255);
_checkEqual(alpha(w5), 255);

color w6 = color(255, 255);
_checkEqual(red(w6), 255);
_checkEqual(green(w6), 255);
_checkEqual(blue(w6), 255);
_checkEqual(alpha(w6), 255);
