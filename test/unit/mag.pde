float x1 = 20;
float x2 = 80;
float y1 = 30;
float y2 = 70;
float x3 = 30;
float y3 = 40;

_checkEqual(mag(x1, y1), 36.05551, 0.00001);
_checkEqual(mag(x2, y1), 85.44004, 0.00001);
_checkEqual(mag(x1, y2), 72.8011, 0.0001);
_checkEqual(mag(x2, y2), 106.30146, 0.00001);
_checkEqual(mag(x3, y3), 50);
