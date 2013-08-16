// checks for word boundries on variable names containing "super"

class _super{
  int item = 0;
  int item2 = 0;
  _super(){
    _super();
    _super(2);
  }
  void _super(){
    item = 1;
  }
  void _super(int item){
    item2 = item;
  }
}

class _super2 extends _super{
  int item3 = 0;
  _super2(){
    this._super();
    item3 = 3;
  }
}


_super2 test = new _super2();

_checkEqual(1, test.item);
_checkEqual(2, test.item2);
_checkEqual(3, test.item3);

