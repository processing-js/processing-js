HashMap hm = new HashMap();

hm.put("Ava", 1);
hm.put("Cait", 35);
hm.put("Casey", 36);

// entry set array
Map.Entry[] ar1 = hm.entrySet().toArray();
// key set array
Object[] ar2 = hm.keySet().toArray(); 
// values array
Object[] ar3 = hm.values().toArray();

_checkEqual(ar1 instanceof Array, true);
_checkEqual(ar1.length, 3);
_checkEqual(ar2 instanceof Array, true);
_checkEqual(ar2.length, 3);
_checkEqual(ar3 instanceof Array, true);
_checkEqual(ar3.length, 3);

// some other simple checks
_checkEqual(ar2.indexOf(ar1[0].getKey()) >= 0, true);
_checkEqual(ar3.indexOf(ar1[0].getValue()) >= 0, true);
_checkEqual(ar1[2].getKey() != ar1[1].getKey(), true);
_checkEqual(ar1[2].getValue() != ar1[1].getValue(),true);
