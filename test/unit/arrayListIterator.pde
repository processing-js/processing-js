ArrayList<String> arrayList = new ArrayList<String>();
arrayList.add("a");
arrayList.add("b");
arrayList.add("c");

_checkEqual(3, arrayList.size());

Iterator<String> it = arrayList.iterator();
String temp;


// test iteration methods
_checkTrue(it.hasNext());
temp = it.next();
_checkEqual(temp, "a");

_checkTrue(it.hasNext());
temp = it.next();
_checkEqual(temp, "b");

_checkTrue(it.hasNext());
temp = it.next();
_checkEqual(temp, "c");

_checkFalse(it.hasNext());

// test remove method
it = arrayList.iterator();

ArrayList<String> remove1 = new ArrayList<String>();
remove1.add("b");
remove1.add("c");

ArrayList<String> remove2 = new ArrayList<String>();
remove2.add("c");

ArrayList<String> remove3 = new ArrayList<String>();


_checkTrue(it.hasNext());
it.next();
it.remove();
_checkEqual(2, arrayList.size());
_checkEqual(remove1, arrayList);

_checkTrue(it.hasNext());
it.next();
it.remove();
_checkEqual(1, arrayList.size());
_checkEqual(remove2, arrayList);

_checkTrue(it.hasNext());
it.next();
it.remove();
_checkEqual(0, arrayList.size());
_checkEqual(remove3, arrayList);

_checkFalse(it.hasNext());
