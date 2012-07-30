String testFunction(int... numbers) {
  String a = "";
  for (int i = 0; i < numbers.length; i++)
    a += numbers[i] + ";";
  return a;
}

class Test {
  public String a;
  public Test(String... args) {
    a = "*";
    for (int i = 0; i < args.length; i++)
      a += args[i] + ";";
  }

  public String testMethod() {
    return "x";
  }

  public String testMethod(int k, String... more) {
    String a = "" + k + ":";
    for (int i = 0; i < more.length; i++)
      a += more[i] + ";";
    return a;
  }
}

Test t = new Test("a", "b");
_checkEqual(t.a, "*a;b;");
_checkEqual(t.testMethod(2, "d"), "2:d;");
_checkEqual(t.testMethod(), "x");
Test t2 = new Test();
_checkEqual(t2.a, "*");

_checkEqual(testFunction(), "");
_checkEqual(testFunction(1, 2, 3), "1;2;3;");

