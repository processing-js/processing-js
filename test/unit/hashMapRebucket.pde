HashMap map = new HashMap();
for(var i = 0; i < 14; ++i) {
map.put(binary(i), "");
}

int c = 0;
Iterator it = map.keySet().iterator();
while(it.hasNext()) { it.next(); c++; }

_checkEqual(c, 14);
