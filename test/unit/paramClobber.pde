// Checks to make sure the abs function is not clobbered by local parameter

class Test{
  int item = 0;
  Test(abs){
    this.item = abs;
  }
  int getItem(){
    return abs(item);
  }
}

Test test = new Test(-1);

_checkEqual(1, test.getItem());

