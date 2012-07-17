HashMap hm = new HashMap();

hm.put("Ava", 1);
hm.put("Cait", 35);
hm.put("Casey", 36);

HashMap hm2  = new HashMap(hm);
hm2.remove("Ava");
_checkTrue(2, hm2.size());
_checkTrue(3, hm.size());


Iterator i = hm.entrySet().iterator();  // Get an iterator

object me;

String[] keys = new String[3];
int[] values = new String[3];

_checkTrue(i.hasNext());
me = i.next();
keys[0] = (String)me.getKey(); values[0] = (int)me.getValue();
_checkTrue(i.hasNext());
me = i.next();
keys[1] = (String)me.getKey(); values[1] = (int)me.getValue();
_checkTrue(i.hasNext());
me = i.next();
keys[2] = (String)me.getKey(); values[2] = (int)me.getValue();
_checkFalse(i.hasNext());

String[] expected_keys = { "Ava", "Cait", "Casey" };
int[] expected_values = {1,35,36};

_checkEqual(expected_keys, sort(keys));
_checkEqual(expected_values, sort(values));

// key set
i = hm.keySet().iterator(); 
_checkTrue(i.hasNext());
me = i.next();
keys[0] = (String)me; 
_checkTrue(i.hasNext());
me = i.next();
keys[1] = (String)me; 
_checkTrue(i.hasNext());
me = i.next();
keys[2] = (String)me; 
_checkFalse(i.hasNext());

_checkEqual(expected_keys, sort(keys));

// sizes
_checkEqual(3, hm.keySet().size());
_checkEqual(3, hm.entrySet().size());


// removal
i = hm.keySet().iterator(); 
_checkTrue(i.hasNext());
i.next();
i.remove();

_checkEqual(2, hm.size());

// removal
i = hm.entrySet().iterator(); 
_checkTrue(i.hasNext());
i.next()
i.remove();

_checkEqual(1, hm.size());

Set s = hm.entrySet();
s.removeAll(s);

_checkEqual(0, hm.size());

