class A {}

A a1 = new A();
int h1 = a1.hashCode();
_checkTrue(typeof h1 === 'number');
_checkTrue(a1.$id === h1);

String s = "A";
int h2 = s.hashCode();
_checkEqual(h2, 65);
