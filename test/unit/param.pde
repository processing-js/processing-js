/* @pjs param-test="good" */

// preparing CANVAS element
externals.canvas.setAttribute("data-processing-fromcanvas", "ok");

_checkEqual(param("test"), "good");
_checkEqual(param("fromcanvas"), "ok");
_checkIsNull(param("notspecified"));

