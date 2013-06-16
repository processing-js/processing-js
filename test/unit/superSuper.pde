var result="";

class A {
    void a() {
        b();
        this.b();
    }
    void b() {
        result += "A";
    }
}
class B extends A {
    void a() {
        super.a();
    }
    void b() {
        result += "B";
    }
}

new B().a();

_checkEqual(result, "BB");

