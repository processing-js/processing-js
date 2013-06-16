HashMap map = new HashMap();
map.put("key with space", "t");
_checkTrue(map.keySet().iterator().hasNext());
