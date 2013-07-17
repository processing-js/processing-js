// test case for this(); ctor calls

class Obj{
  int item = 0;
  int item2 = 0;
  int item3 = 0;

  Obj(){
    this(2, 3);
  }

  Obj(int item){
    this();
    this.item = item;
  }
  Obj(int item2, int item3){
    this.item2 = item2;
    this.item3 = item3;
  }
  
}

Obj obj = new Obj(1);

_checkEqual(1, obj.item);
_checkEqual(2, obj.item2);
_checkEqual(3, obj.item3);

