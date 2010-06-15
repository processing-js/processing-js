// checks that casts for built in processing objects are removed

int test1 = (PVector[])1;
int test2 = (PrintWriter[])2;
int test3 = (BufferedReader[])3;
int test4 = (PImage[])4;
int test5 = (PGraphics[])5;
int test6 = (PFont[])6;
int test7 = (PShape[])7;

_checkEqual(test1, 1);
_checkEqual(test2, 2);
_checkEqual(test3, 3);
_checkEqual(test4, 4);
_checkEqual(test5, 5);
_checkEqual(test6, 6);
_checkEqual(test7, 7);

