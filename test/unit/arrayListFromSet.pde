HashMap<String,String> map = new HashMap<String,String>();
map.put("a","1");

ArrayList<String> keys = new ArrayList(map.keySet());
_checkEqual(keys.get(0), "a");

ArrayList<String> vals = new ArrayList(map.values());
_checkEqual(vals.get(0), "1");
