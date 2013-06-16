HashMap<String,String> map = new HashMap<String,String>();

map.put("a","1");
map.put("b","2");
map.put("c","3");
map.put("d","4");

Iterator<String> it = map.keySet().iterator();
String entry;
while (it.hasNext()) {
  entry = it.next();
  if ("c".equals(entry)) {
    it.remove();
  }
}

_checkEqual(map.keySet().toArray(), ["a","b","d"]);