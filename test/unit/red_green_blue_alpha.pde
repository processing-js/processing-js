color a = color(255);
color b = color(0);
color c = color(128);
color d = color(300);

_checkEqual(red(a), 255);
_checkEqual(green(a), 255);
_checkEqual(blue(a), 255);
_checkEqual(alpha(a), 255);

_checkEqual(red(b), 0);
_checkEqual(green(b), 0);
_checkEqual(blue(b), 0);
_checkEqual(alpha(b), 255);

_checkEqual(red(c), 128);
_checkEqual(green(c), 128);
_checkEqual(blue(c), 128);
_checkEqual(alpha(c), 255);

_checkEqual(red(d), 0);
_checkEqual(green(d), 1);
_checkEqual(blue(d), 44);
_checkEqual(alpha(d), 0);

colorMode(RGB, 100);

a = color(50);
b = color(70);
c = color(85);
d = color(100);

_checkEqual(red(a), 50.19607843137255, 0.0001);
_checkEqual(green(a), 50.19607843137255, 0.0001);
_checkEqual(blue(a), 50.19607843137255, 0.0001);
_checkEqual(alpha(a), 100);

_checkEqual(red(b), 70.19607843137254, 0.0001);
_checkEqual(green(b), 70.19607843137254, 0.0001);
_checkEqual(blue(b), 70.19607843137254, 0.0001);
_checkEqual(alpha(b), 100);

_checkEqual(red(c), 85.09803921568627, 0.0001);
_checkEqual(green(c), 85.09803921568627, 0.0001);
_checkEqual(blue(c), 85.09803921568627, 0.0001);
_checkEqual(alpha(c), 100);

_checkEqual(red(d), 100, 0.0001);
_checkEqual(green(d), 100, 0.0001);
_checkEqual(blue(d), 100, 0.0001);
_checkEqual(alpha(d), 100);

