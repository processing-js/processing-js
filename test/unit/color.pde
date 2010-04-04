color a, b, c;

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
b = color(#000000);
c = color(#884422);

_checkEqual(color.toArray(a), [255, 0, 255, 255]);
_checkEqual(color.toArray(b), [0, 0, 0, 255]);
_checkEqual(color.toArray(c), [136, 68, 34, 255]);

_checkEqual(color.toString(a), "rgba(255,0,255,1)");
_checkEqual(color.toString(b), "rgba(0,0,0,1)");
_checkEqual(color.toString(c), "rgba(136,68,34,1)");


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
