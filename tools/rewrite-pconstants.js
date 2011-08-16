/**
 * Rewrites PConstants from symbolic names to values for space/size.
 *
 * Usage: $JSSHELL -f fake-dom.js -f ../processing.js rewrite-pconstants.js < processing.js
 */

// re-arrange the color expressions
var regexMaskShift = /\(\s*([a-zA-Z0-9_]+)\s*&\s*PConstants\.(ALPHA|RED|GREEN)_MASK\s*\)\s*>>[>]?\s*(8|16|24)/g,
  regexMaskShift2 = /(\(?)\s*([a-zA-Z0-9_]+(\[[^\]]+\]))\s*<<\s*(8|16|24)\s*(\)?)\s*&\s*PConstants\.(ALPHA|RED|GREEN)_MASK/g,
  regexPConstants = /(PConstants)\s*\.([a-zA-Z0-9_]+)/g,
  PConstants = Processing.prototype.PConstants,
  line,
  undefined;

while((line = readline()) !== null) {
  line = line.replace(regexMaskShift, function(str, expr, color, shift) {
    if ((color == "ALPHA" && shift != "24") ||
        (color == "RED" && shift != "16") ||
        (color == "GREEN" && shift != "8")) return str;
    return "(" + expr + " >> " + shift + ") & 255";
  });

  line = line.replace(regexMaskShift2, function(str, paren1, expr, p1, shift, paren2, color) {
   if ((color == "ALPHA" && shift != "24") ||
       (color == "RED" && shift != "16") ||
       (color == "GREEN" && shift != "8")) return str;
    return (paren1 == "(" && paren2 != ")" ? "(" : "") +
           "(" + expr + " & 255) << " + shift;
  });

  line = line.replace(regexPConstants, function(str, p1, p2) {
    // Skip native methods on the prototype
    var val = PConstants.hasOwnProperty(p2) ? PConstants[p2] : undefined;

    // special case of PI
    if (p2 === "PI") {
      val = "Math.PI";
    } else {
      // Wrap strings in quotes
      if (typeof val === 'string') {
        val = "'" + val + "'";
      }

      // Don't shorten if it makes it longer
      if ( ('' + val).length > ('PConstants.' + p2).length ) {
        val = str;
      }
    }

    return val === undefined ? str : val;
  });

  print(line);
}
