float[] obj = {1.0, 2.0 };

HashMap map = new HashMap();
map.put("test", "1");
map.put("test2", obj);

_checkEqual(2, map.size());
_checkFalse(map.isEmpty());

_checkEqual("1", map.get("test"));
_checkEqual(obj, map.get("test2"));
_checkIsNull(map.get("test3"));

map.remove("test");
_checkEqual(1, map.size());

map.remove("test");
_checkEqual(1, map.size());

map.clear();
_checkEqual(0, map.size());
_checkTrue(map.isEmpty());

map.put(map, map);
_checkEqual(map, map.get(map));

