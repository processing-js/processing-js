// using javascript as a sketch should be possible, and should never break

var t = 0;
_checkEqual(0, t);

var a = [20, 30, 40];
_checkEqual(3, a.length);
_checkEqual(30, a[1]);

var b = { m1: function() { return 1; }, f2: "test" };
_checkEqual("object", typeof b);
_checkEqual("test", b.f2);
_checkEqual(1, b.m1());

String s = "aaab".replace(/a[^b"]/g, "c");
_checkEqual("cab", s);

var obj1 = { "name1": 3, "name2" : "test" };
_checkEqual("test", obj1.name2);

var name1Found = false;
for(var ni in obj1) {
if(ni === "name1") name1Found = true;
}
_checkTrue(name1Found);

