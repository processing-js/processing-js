// simple for-each loop check
ArrayList l = new ArrayList();
l.add("moo");
l.add("woof");
l.add("cat?");

String result="";
for(Object s: l) { result+=s; }

_checkEqual(result, "moowoofcat?");

// more complex nested iterations
HashMap hm = new HashMap();
ArrayList l1 = new ArrayList();
l1.add("1");
hm.put("a", l1);
ArrayList l2 = new ArrayList();
l2.add("2");
l2.add("3");
hm.put("b", l2);

String result2 = "";
for(Object o1 : hm.keySet()) {
  String key = (String)o1;
  result2 += key;
  for(Object o2 : (ArrayList) hm.get(key))
    result2 += (String)o2;  
}

_checkTrue(result2 == "a1b23" || result2 == "b23a1");

// array iteration
String result3 = "";
for(String s : ["1", "2", "43"]) {
  result3 += s;
}
_checkEqual(result3, "1243");


