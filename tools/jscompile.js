var s, code = ''; 
while((s=readline()) !== null) {
  code += s + '\n'; 
}

var sketch=Processing.compile(code); 
print(sketch.toString());

