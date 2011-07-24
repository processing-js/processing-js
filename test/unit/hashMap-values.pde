String meow = "meow";
HashMap<String,String> hm;
hm = new HashMap<String,String>();

hm.put("Dog", "woof");
hm.put("Cat", meow);
hm.put("Kitten", meow);
hm.put("Lion", "roar");

String[] vkeys = hm.keySet().toArray(new String[0]);
String[] vstrings = hm.values().toArray(new String[0]);

_checkEqual(vkeys, ["Cat", "Kitten", "Dog", "Lion"]);
_checkEqual(vstrings, ["meow", "meow", "woof", "roar"]);

ArrayList<String> values = new ArrayList(hm.values());
hm.values().remove(meow);

vkeys = hm.keySet().toArray(new String[0]);
vstrings = hm.values().toArray(new String[0]);

_checkEqual(vkeys, ["Kitten", "Dog", "Lion"]);
_checkEqual(vstrings, ["meow", "woof", "roar"]);