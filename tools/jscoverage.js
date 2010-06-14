print("var __pjsCalledLines = [], __line = function(n) { __pjsCalledLines[n] = true; };");

var skip = false, number = 0;
var lines = [];
while((s = readline()) !== null)
{ 
  ++number;
  var returnFound = /\s(return|break|continue)[\s;]/g.test(s);
  var i = s.indexOf("//"); if(i < 0) i = s.indexOf("/*"); 
  var head = i < 0 ? s : s.substring(0, i);
  head = head.replace(/\s+$/g, "");
  var semicolonFound = head.length > 0 && head.charAt(head.length - 1) === ";";

  if(returnFound) {
    var s = s.replace(/\s(return|break|continue)[\s;]/, function(all) {
      lines.push(number);
      return "__line(" + number + ", true); " + all;
    });
    skip = !semicolonFound;
  } else if(semicolonFound) {
    if(skip) {
      skip = false;
    } else {
      lines.push(number);
      var tail = i < 0 ? "" : s.substring(i);
      s = head + "__line(" + number + ", false);" + tail;
    }
  }
  print(s);
}

print("var __pjsCodeLines = [" + lines.join(",") + "];");
