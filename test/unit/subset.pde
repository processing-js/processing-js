String[] aa1 = {"ON-1","BC-2","BC-3","NB-4","NS-5","NF-6"}; 
String[] aa2 = {"BC-2","BC-3","NB-4","NS-5","NF-6"};
String[] aa3 = {"BC-3","NB-4","NS-5"};

char[] bb1 = { 'A','B','C','D','E','F'};
char[] bb2 = {'E','F'};
char[] bb3 = {'E'};

int[] cc1 = {1,2,3,4,5,6};
int[] cc2 = {4,5,6};
int[] cc3 = {1,2,3};
                               
float[] dd1 = {1.1,1.2,1.3,1.4,1.5,1.6}; 
float[] dd2 = {1.4,1.5,1.6};
float[] dd3 = {1.3,1.4,1.5};

color[] ee1 = {color(255,255,255),color(0,0,0),color(128,255,0)};
color[] ee2 = {color(0,0,0),color(128,255,0)};
color[] ee3 = {color(0,0,0)};

byte[] ff1 = {0,50,1,2,3,120};
byte[] ff2 = {50,1,2,3,120};
byte[] ff3 = {0, 50, 1};

_checkEqual(subset(aa1, 1), aa2);
_checkEqual(subset(aa1, 2, 3), aa3);
_checkEqual(subset(bb1, 4), bb2);
_checkEqual(subset(bb1, 4, 1), bb3);
_checkEqual(subset(cc1, 3), cc2);
_checkEqual(subset(cc1, 0, 3), cc3);
_checkEqual(subset(dd1, 3), dd2);
_checkEqual(subset(dd1, 2, 3), dd3);
_checkEqual(subset(ee1, 1, 2), ee2);
_checkEqual(subset(ee1, 1, 1), ee3);
_checkEqual(subset(ff1, 1), ff2);
_checkEqual(subset(ff1, 0, 3), ff3);
_checkEqual(subset(subset(aa1, 1), 1, 3), aa3);
_checkEqual(subset(aa1, 1, 0), {});
