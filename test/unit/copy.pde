// unit test for code coverage tool to bring coverage percent up
size(500,500);

PImage img = createImage(100,100,ARGB); 
PImage img2 = createImage(100,100,ARGB); 
image(img, 0, 0);
copy(img, 0, 0, 10, 26, 37, 0, 10, 26, BLEND);
copy(img, 0, 0, 10, 26, 27, 0, 10, 26, ADD);
copy(img, 0, 0, 10, 26, 17, 0, 10, 26, SUBTRACT);
copy(img, 0, 0, 10, 26, 7, 0, 10, 26, LIGHTEST);
copy(img, 0, 0, 10, 26, 37, 0, 10, 26, DARKEST);
copy(img, 0, 0, 10, 26, 37, 0, 10, 26, DIFFERENCE);
copy(img, 0, 0, 10, 26, 37, 0, 10, 26, EXCLUSION);
copy(img, 0, 0, 10, 26, 37, 0, 10, 26, MULTIPLY);
copy(img, 0, 0, 10, 26, 37, 0, 10, 26, SCREEN);
copy(img, 0, 0, 10, 26, 37, 0, 10, 26, OVERLAY);
copy(img, 0, 0, 10, 26, 37, 0, 10, 26, HARD_LIGHT);
copy(img, 0, 0, 10, 26, 37, 0, 10, 26, SOFT_LIGHT);
copy(img, 0, 0, 10, 26, 37, 0, 10, 26, DODGE);
copy(img, 0, 0, 10, 26, 37, 0, 10, 26, BURN);

img2.copy(img, 0, 0, 10, 26, 37, 0, 10, 26, BLEND);
img2.copy(img, 0, 0, 10, 26, 27, 0, 10, 26, ADD);
img2.copy(img, 0, 0, 10, 26, 17, 0, 10, 26, SUBTRACT);
img2.copy(img, 0, 0, 10, 26, 7, 0, 10, 26, LIGHTEST);
img2.copy(img, 0, 0, 10, 26, 37, 0, 10, 26, DARKEST);
img2.copy(img, 0, 0, 10, 26, 37, 0, 10, 26, DIFFERENCE);
img2.copy(img, 0, 0, 10, 26, 37, 0, 10, 26, EXCLUSION);
img2.copy(img, 0, 0, 10, 26, 37, 0, 10, 26, MULTIPLY);
img2.copy(img, 0, 0, 10, 26, 37, 0, 10, 26, SCREEN);
img2.copy(img, 0, 0, 10, 26, 37, 0, 10, 26, OVERLAY);
img2.copy(img, 0, 0, 10, 26, 37, 0, 10, 26, HARD_LIGHT);
img2.copy(img, 0, 0, 10, 26, 37, 0, 10, 26, SOFT_LIGHT);
img2.copy(img, 0, 0, 10, 26, 37, 0, 10, 26, DODGE);
img2.copy(img, 0, 0, 10, 26, 37, 0, 10, 26, BURN);
