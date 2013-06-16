// Test to check that class variables can be initialized by other class variables

class TestClass{
  int item1 = 1;
  int item2 = item1;
}

TestClass test = new TestClass();

_checkEqual(1, test.item2);

