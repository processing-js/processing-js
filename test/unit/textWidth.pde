float t1 = textWidth("processing");
float t2 = textWidth(".js");
float t3 = t1 + t2;

// fake-dom.js returns 1.0 for textWidth for any string
_checkEqual(t1, 1.0);
_checkEqual(t2, 1.0);
_checkEqual(t3, 2.0);

// The recommended JS way to test if a variable is a number
_checkEqual(!isNaN(t1), true);
_checkEqual(!isNaN(t2), true);
_checkEqual(!isNaN(t3), true);
