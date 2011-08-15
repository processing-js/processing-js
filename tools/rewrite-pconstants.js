/**
 * Rewrites PConstants from symbolic names to values for space/size.
 *
 * Usage: $JSSHELL -f fake-dom.js -f ../processing.js rewrite-pconstants.js < processing.js
 */

var regexPConstants = /(PConstants)\s*\.([a-zA-Z0-9_]+)/g,
  PConstants = Processing.prototype.PConstants,
  line,
  undefined;

while((line = readline()) !== null) {
  line = line.replace(regexPConstants, function(str, g1, g2) {
    // Skip native methods on the prototype
    var val = PConstants.hasOwnProperty(g2) ? PConstants[g2] : undefined;

    // Wrap strings in quotes
    if (typeof val === 'string') {
      val = "'" + val + "'";
    }

    // Don't shorten if it makes it longer
    if ( ('' + val).length > ('PConstants.' + g2).length ) {
      val = str;
    }

    return val === undefined ? str : val;
  });

  print(line);
}
