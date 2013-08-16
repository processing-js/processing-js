var __testFiles = {
  "test1.txt" : "line1",
  "test2.txt" : "line1\n",
  "test3.txt" : "line1\r\nline2",
  "test4.txt" : "",
  "test5.txt" : "item1\nitem2\n\n",
  "test6.txt" : "\rline2",
  "test7.txt" : "\n"
};


externals.window.XMLHttpRequest.prototype = {
  open: function(method, url) { this.responseText = __testFiles[url]; },
  status: 200,
  send: function() {},
  setRequestHeader: function() {}
};


String[] s1 = loadStrings("test1.txt");
_checkEqual(1, s1.length);
_checkEqual("line1", s1[0]);

String[] s2 = loadStrings("test2.txt");
_checkEqual(1, s2.length);
_checkEqual("line1", s2[0]);

String[] s3 = loadStrings("test3.txt");
_checkEqual(2, s3.length);
_checkEqual("line1", s3[0]);
_checkEqual("line2", s3[1]);

String[] s4 = loadStrings("test4.txt");
_checkEqual(0, s4.length);

String[] s5 = loadStrings("test5.txt");
_checkEqual(3, s5.length);
_checkEqual("item1", s5[0]);
_checkEqual("item2", s5[1]);
_checkEqual("", s5[2]);

String[] s6 = loadStrings("test6.txt");
_checkEqual(2, s6.length);
_checkEqual("", s6[0]);
_checkEqual("line2", s6[1]);

String[] s7 = loadStrings("test7.txt");
_checkEqual(1, s7.length);
_checkEqual("", s7[0]);

