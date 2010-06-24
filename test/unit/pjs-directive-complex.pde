/*    @pjs
version =      0.7;



       debug=               False  ;
  foo="one/two";
*/

_checkEqual(externals.sketch.options.version, "0.7");
_checkEqual(externals.sketch.options.debug, "False");
_checkEqual(externals.sketch.options.foo, "one/two");

