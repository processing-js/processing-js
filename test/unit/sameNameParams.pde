// A unit test for local and public variables with the same names
class Foo{
  int v;
  int x;
  int y;
  int z;
  
  Foo(){ 
    v = 0;
    x = 0;
    y = 0;
    z = 0;
  }
  Foo(int v, int x, int y, int z){
    this.v = v;
    this.x = x;
    this.y = y;
    this.z = z;
  }
  Foo(int x, int y, int z){
    v = 0;
    this.x = x;
    this.y = y;
    this.z = z;
  }

  void setVars(int v, int x, int y, int z){
    this.v = v;
    this.x = x;
    this.y = y;
    this.z = z;
  }
  void setVars(int x, int y, int z){
    v = 0;
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

Foo f = new Foo();

_checkEqual(0, f.v);
_checkEqual(0, f.x);
_checkEqual(0, f.y);
_checkEqual(0, f.z);

f = new Foo(1, 2, 3);

_checkEqual(0, f.v);
_checkEqual(1, f.x);
_checkEqual(2, f.y);
_checkEqual(3, f.z);

f = new Foo(1, 2, 3, 4);

_checkEqual(1, f.v);
_checkEqual(2, f.x);
_checkEqual(3, f.y);
_checkEqual(4, f.z);

f.setVars(1, 2, 3);

_checkEqual(0, f.v);
_checkEqual(1, f.x);
_checkEqual(2, f.y);
_checkEqual(3, f.z);

f.setVars(1, 2, 3, 4);

_checkEqual(1, f.v);
_checkEqual(2, f.x);
_checkEqual(3, f.y);
_checkEqual(4, f.z);
