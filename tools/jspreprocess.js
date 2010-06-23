
function preprocess() { 
  var s, state = 0, stack = []; 
  while((s=readline()) !== null) {
    var m = new RegExp(/^\s*\/\/\s*#(if|else|endif)\b(?:\s+(.*))?/).exec(s);
    if(m) {
      if(m[1] === "if") {
        stack.push(state);
        state = eval(m[2]) ? 0 : 1;
      } else if(m[1] === "else") {
        state = state === 1 ? 0 : 2;
      } else {
        state = stack.pop();
      }
    } else {
      if(state === 0) {
        print(s);
      }
    }    
  }
}

