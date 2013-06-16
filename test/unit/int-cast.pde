// Checking int casting

// int -> int cast
int a = 40, b = 20;
int r1 = (int)a;
_checkEqual(r1, 40);

int r2 = (int)a + (int)b;
_checkEqual(r2, 60);

float c = 5.5, d = -5.5;
int r3 = (int)c;
_checkEqual(r3, 5);

int r3 = (int)d;
_checkEqual(r3, -5);

int r4 = 7 + (int)c;
_checkEqual(r4, 12);

int r5 = (int)d + 13;
_checkEqual(r5, 8);

float[] arr = { 1.2, 3.4 };
int r6 = 7 + (int)arr[1];
_checkEqual(r6, 10);

int r7 = (int)(d + 3);
_checkEqual(r7, -2);

class Obj1 {
  float run() { return -4.3; }
}

Obj1 obj = new Obj1();
int r8 = 4 * (4 + (int)obj. run() + 1);
_checkEqual(r8, 4);

int neg  = -(int)3.6;
int neg2 = (int)3.6;
_checkEqual(neg, -neg2);
