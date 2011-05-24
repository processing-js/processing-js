// ticket 1080 - reference to a static variable inside a switch stmt in a class results 
// in "Unable to execute pjs sketch: ReferenceError: <var name> is not defined"

String heys = "";

public static final int A_STATIC1 = 0;

void test() {
  int which = A_STATIC1;
  switch (which) {
    case A_STATIC1:
      heys += "a"; // This works!
      break;
  }
  AClass aClass = new AClass();
  aClass.aMethod(AClass.A_STATIC2);
}

class AClass {
  public static final int A_STATIC2 = 0;

  void aMethod(int which) {
    if (which == A_STATIC2)
      heys += "b";   // This works!
    switch (which) {                  
      case A_STATIC2: 
        heys += "c";  // This works on 1.0.0.  On 1.1.0, it fails with
        break;            // "Unable to execute pjs sketch: ReferenceError: A_STATIC2 is not defined"
    }
  }
}

test();

_checkEqual(heys, "abc");