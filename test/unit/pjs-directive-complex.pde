/*    @pjs
version =      0.7;



       debug=               False  ;
  foo="one/two";
*/

_checkEqual(__sketch.options.version, "0.7");
_checkEqual(__sketch.options.debug, "False");
_checkEqual(__sketch.options.foo, "one/two");

