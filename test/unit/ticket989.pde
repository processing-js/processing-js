String result = "fail";

class A {
    A() {
        a.add(this);
    }
    void doit() {
        result = "called A.doit";
    }
}

class B extends A {
    void doit() {
        result = "called B.doit";
    }
}

ArrayList a = new ArrayList();

B buggy = new B();
    
A b2 = (A) a.get(0);

b2.doit();

_checkEqual(result, "called B.doit");

