// Checks classes after removal of with(this)
class Foo{
  int v;
  Foo(int val){ 
    v = val; 
  } 
  int getV(){ 
    return v; 
  } 
}
Foo f = new Foo(6); 

_checkEqual(6, f.getV());
