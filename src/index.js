// Base source files
var source = {
  virtEquals: require("./Helpers/virtEquals"),
  virtHashCode: require("./Helpers/virtHashCode"),
  ObjectIterator: require("./Helpers/ObjectIterator"),
  PConstants: require("./Helpers/PConstants"),
  ArrayList: require("./Objects/ArrayList"),
  HashMap: require("./Objects/HashMap"),
  PVector: require("./Objects/PVector"),
  PFont: require("./Objects/PFont"),
  Char: require("./Objects/Char"),
  XMLAttribute: require("./Objects/XMLAttribute"),
  XMLElement: require("./Objects/XMLElement"),
  PMatrix2D: require("./Objects/PMatrix2D"),
  PMatrix3D: require("./Objects/PMatrix3D"),
  PShape: require("./Objects/PShape"),
  colors: require("./Objects/webcolors"),
  PShapeSVG:  require("./Objects/PShapeSVG"),
  CommonFunctions: require("./P5Functions/commonFunctions"),
  defaultScope: require("./Helpers/defaultScope"),
  Processing: require("./Processing"),
  setupParser: require("./Parser/Parser"),
  finalize: require("./Helpers/finalizeProcessing")
};

// Additional code that gets tacked onto "p" during
// instantiation of a Processing sketch.
source.extend = {
  withMath: require("./P5Functions/Math.js"),
  withProxyFunctions: require("./P5Functions/JavaProxyFunctions")(source.virtHashCode, source.virtEquals),
  withTouch: require("./P5Functions/touchmouse"),
  withCommonFunctions: source.CommonFunctions.withCommonFunctions
};

/**
 * Processing.js building function
 */
module.exports = function buildProcessingJS(Browser, testHarness) {
  var noop = function(){},
      virtEquals = source.virtEquals,
      virtHashCode = source.virtHashCode,
      PConstants = source.PConstants,
      CommonFunctions = source.CommonFunctions,
      ObjectIterator = source.ObjectIterator,
      Char = source.Char,
      XMLAttribute = source.XMLAttribute(),

      ArrayList = source.ArrayList({
        virtHashCode: virtHashCode,
        virtEquals: virtEquals
      }),

      HashMap = source.HashMap({
        virtHashCode: virtHashCode,
        virtEquals: virtEquals
      }),

      PVector = source.PVector({
        PConstants: PConstants
      }),

      PFont = source.PFont({
        Browser: Browser,
        noop: noop
      }),

      XMLElement = source.XMLElement({
        Browser: Browser,
        XMLAttribute: XMLAttribute
      }),

      PMatrix2D = source.PMatrix2D({
        p:CommonFunctions
      }),

      PMatrix3D = source.PMatrix3D({
        p:CommonFunctions
      }),

      PShape = source.PShape({
        PConstants: PConstants,
        PMatrix2D: PMatrix2D,
        PMatrix3D: PMatrix3D
      }),

      PShapeSVG = source.PShapeSVG({
        CommonFunctions: CommonFunctions,
        PConstants: PConstants,
        PShape: PShape,
        XMLElement: XMLElement,
        colors: source.colors
      }),

      defaultScope = source.defaultScope({
        ArrayList: ArrayList,
        HashMap: HashMap,
        PVector: PVector,
        PFont: PFont,
        PShapeSVG: PShapeSVG,
        ObjectIterator: ObjectIterator,
        PConstants: PConstants,
        Char: Char,
        XMLElement: XMLElement,
        XML: XMLElement
      }),

      Processing = source.Processing({
        defaultScope: defaultScope,
        Browser: Browser,
        extend: source.extend,
        noop: noop
      });

  // set up the Processing syntax parser
  Processing = source.setupParser(Processing, {
    Browser: Browser,
    aFunctions: testHarness,
    defaultScope: defaultScope
  });

  // finalise the Processing object
  Processing = source.finalize(Processing, {
    version: require('../package.json').version,
    isDomPresent: false || Browser.isDomPresent,
    window: Browser.window,
    document: Browser.document,
    noop: noop
  });

  // done.
  return Processing;
};
