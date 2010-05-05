class A { 
  int cat;
  int abat;
  A(int a , int b) {
    cat = a;
    abat = b;
  }
  void setCat(int a , int b){
    cat = a;
    abat = b;
  }
}

A a = new A(1, 2);

_checkEqual(1, a.cat);
_checkEqual(2, a.abat);

a.setCat(3, 4);

_checkEqual(3, a.cat);
_checkEqual(4, a.abat);
