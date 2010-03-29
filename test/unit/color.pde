color a, b, c;

// 1 Arg: Grayscale
a = color(255);
b = color(300);
c = color(57);

_checkEqual(color.toArray(a), [255, 255, 255, 255]);
_checkEqual(color.toArray(b), [0, 1, 44, 0]);
_checkEqual(color.toArray(c), [57, 57, 57, 255]);

// 1 Arg: Hex
a = color(#FF00FF);
b = color(#000000);
c = color(#884422);

_checkEqual(color.toArray(a), [255, 0, 255, 255]);
_checkEqual(color.toArray(b), [0, 0, 0, 255]);
_checkEqual(color.toArray(c), [136, 68, 34, 255]);



// 2 Args: Grayscale, Alpha
a = color(255, 100);
b = color(300, 300);
c = color(57, 0);

_checkEqual(color.toArray(a), [255, 255, 255, 100]);
_checkEqual(color.toArray(b), [255, 255, 255, 255]);
_checkEqual(color.toArray(c), [57, 57, 57, 0]);


// 3 Args: R, G, B
a = color(100, 200, 0);
b = color(500, 255, 255); // In this situation the overflowed red value should be normalized to 255
c = color(0, 0, 0);

_checkEqual(color.toArray(a), [100, 200, 0, 255]);
_checkEqual(color.toArray(b), [255, 255, 255, 255]);
_checkEqual(color.toArray(c), [0, 0, 0, 255]);

// 4 Args: R, G, B, A
a = color(100, 200, 0, 200);
b = color(100, 300, 100, 300);
c = color(57, 128, 255, 0);

_checkEqual(color.toArray(a), [100, 200, 0, 200]);
_checkEqual(color.toArray(b), [100, 255, 100, 255]);
_checkEqual(color.toArray(c), [57, 128, 255, 0]);

