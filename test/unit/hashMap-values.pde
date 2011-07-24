HashMap<String,String> hm = new HashMap<String,String>();
String meow = "meow";
hm.put("Dog", "woof");
hm.put("Cat", meow);
hm.put("Kitten", meow);
hm.put("Lion", "roar");
ArrayList<String> values = new ArrayList(hm.values());
for(String v: values) {
  hm.values().remove(v);
  break; }
values = new ArrayList(hm.values());
String[] vstrings = values.toArray(new String[0]);
_checkEqual(vstrings, ["meow", "woof", "roar"]);
