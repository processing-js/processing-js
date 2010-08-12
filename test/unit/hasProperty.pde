// make sure correct values are in class A's hasOwnProperty

class A
{
  int toString() { return 1; }
  int moo() {
    return toString();
  }
}

A a = new A();
_checkEqual(a.moo(), 1);

