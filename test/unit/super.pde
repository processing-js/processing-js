// Tests to check super() and super. usage of inheritance
class Obj{
  int item = 0;
  Obj(){
    item = 3;
  }
  Obj(int item){
    this.item = item;
  }
  int getSuperItem(){
    return item;
  }
}

class Obj2 extends Obj{
  int item = 0;
  Obj2(){
    item = 1;
  }
  Obj2(int item){
    super(item);
    this.item = 2;
  }
  int getSuperItem(){
    return super.item;
  }
  void setSuperItem(int item){
    super.item = item;
  }
  int getSuperItem2(){
    return super.getSuperItem();
  }
}

Obj2 obj = new Obj2();

_checkEqual(1, obj.item);
_checkEqual(3, obj.getSuperItem());

obj = new Obj2(4);

_checkEqual(2, obj.item);
_checkEqual(4, obj.getSuperItem());

obj.setSuperItem(5);

_checkEqual(5, obj.getSuperItem2());

