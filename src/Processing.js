/**
 * Processing.js object
 */
 module.exports = function(options, undef) {
  var defaultScope = options.defaultScope,
      extend = options.extend,
      Browser = options.Browser,
      ajax = Browser.ajax,
      navigator = Browser.navigator,
      window = Browser.window,
      XMLHttpRequest = window.XMLHttpRequest,
      document = Browser.document,
      noop = options.noop,

      PConstants = defaultScope.PConstants;
      PFont = defaultScope.PFont,
      PShapeSVG = defaultScope.PShapeSVG,
      PVector = defaultScope.PVector,
      Char = Character = defaultScope.Char,
      ObjectIterator = defaultScope.ObjectIterator,
      XMLElement = defaultScope.XMLElement,
      XML = defaultScope.XML;

  // fascinating "read only" jshint error if we don't start a new var block here.
  var HTMLCanvasElement = window.HTMLCanvasElement,
      HTMLImageElement = window.HTMLImageElement;

  // window.localStorage cannot be accessed if a user is blocking cookies.
  // In that case, we make it a temporary source cache object.
  var localStorage;
  try { localStorage = window.localStorage; } catch (e) { localStorage = {}; }

  var isDOMPresent = ("document" in this) && !("fake" in this.document);

  // document.head polyfill for the benefit of Firefox 3.6
  if (!document.head) {
    document.head = document.getElementsByTagName('head')[0];
  }

  var Float32Array = setupTypedArray("Float32Array", "WebGLFloatArray"),
      Int32Array   = setupTypedArray("Int32Array",   "WebGLIntArray"),
      Uint16Array  = setupTypedArray("Uint16Array",  "WebGLUnsignedShortArray"),
      Uint8Array   = setupTypedArray("Uint8Array",   "WebGLUnsignedByteArray");

  // Typed Arrays: fallback to WebGL arrays or Native JS arrays if unavailable
  function setupTypedArray(name, fallback) {
    // Check if TypedArray exists, and use if so.
    if (name in window) {
      return window[name];
    }

    // Check if WebGLArray exists
    if (typeof window[fallback] === "function") {
      return window[fallback];
    }

    // Use Native JS array
    return function(obj) {
      if (obj instanceof Array) {
        return obj;
      }
      if (typeof obj === "number") {
        var arr = [];
        arr.length = obj;
        return arr;
      }
    };
  }

  /* IE9+ quirks mode check - ticket #1606 */
  if (document.documentMode >= 9 && !document.doctype) {
    throw("The doctype directive is missing. The recommended doctype in Internet Explorer is the HTML5 doctype: <!DOCTYPE html>");
  }

  // Manage multiple Processing instances
  var processingInstances = [];
  var processingInstanceIds = {};

  /**
   * instance tracking - adding new instances
   */
  var addInstance = function(processing) {
    if (processing.externals.canvas.id === undef || !processing.externals.canvas.id.length) {
      processing.externals.canvas.id = "__processing" + processingInstances.length;
    }
    processingInstanceIds[processing.externals.canvas.id] = processingInstances.length;
    processingInstances.push(processing);
  };

  /**
   * instance tracking - removal
   */
  var removeInstance = function(id) {
    processingInstances.splice(processingInstanceIds[id], 1);
    delete processingInstanceIds[id];
  };


  /**
   * The Processing object
   */
  var Processing = this.Processing = function(aCanvas, aCode, aFunctions) {

    if (!(this instanceof Processing)) {
      throw("called Processing constructor as if it were a function: missing 'new'.");
    }

    var curElement = {},
      pgraphicsMode = (aCanvas === undef && aCode === undef);

    if (pgraphicsMode) {
      curElement = document.createElement("canvas");
    } else {
      // We'll take a canvas element or a string for a canvas element's id
      curElement = typeof aCanvas === "string" ? document.getElementById(aCanvas) : aCanvas;
    }

    if (!('getContext' in curElement)) {
      throw("called Processing constructor without passing canvas element reference or id.");
    }

    function unimplemented(s) {
      Processing.debug('Unimplemented - ' + s);
    }

    ////////////////////////////////////////////////////////////////////////////
    // JavaScript event binding and releasing
    ////////////////////////////////////////////////////////////////////////////
	var eventHandlers = [];
    function attachEventHandler(elem, type, fn) {
      if (elem.addEventListener) {
        elem.addEventListener(type, fn, false);
      } else {
        elem.attachEvent("on" + type, fn);
      }
      eventHandlers.push({elem: elem, type: type, fn: fn});
    }

    function detachEventHandler(eventHandler) {
      var elem = eventHandler.elem,
          type = eventHandler.type,
          fn   = eventHandler.fn;
      if (elem.removeEventListener) {
        elem.removeEventListener(type, fn, false);
      } else if (elem.detachEvent) {
        elem.detachEvent("on" + type, fn);
      }
    }

    function detachEventHandlersByType(element, types) {
      Object.keys(eventHandlers).forEach(function(eventHandler) {
        if (types.indexOf(eventHandler.type) > -1 && (eventHandler.elem == element)) {
          detachEventHandler(eventHandler.type);
        }
      });
    }

    function removeFirstArgument(args) {
      return Array.prototype.slice.call(args, 1);
    }

    // When something new is added to "p." it must also be added to the "names" array.
    // The names array contains the names of everything that is inside "p."
    var p = this;

    p.Char = p.Character = Char;

    // add in the Processing API functions
    eventHandlers = [];
    extend.withCommonFunctions(p);
    extend.withMath(p);
    extend.withProxyFunctions(p, removeFirstArgument);
    extend.withTouch(p, curElement, attachEventHandler, detachEventHandlersByType, document, PConstants);

    // custom functions and properties are added here
    if(aFunctions) {
      Object.keys(aFunctions).forEach(function(name) {
        p[name] = aFunctions[name];
      });
    }

    // PJS specific (non-p5) methods and properties to externalize
    p.externals = {
      canvas:  curElement,
      context: undef,
      sketch:  undef,
      window: window
    };

    p.name            = 'Processing.js Instance'; // Set Processing defaults / environment variables
    p.use3DContext    = false; // default '2d' canvas context

    /**
     * Confirms if a Processing program is "focused", meaning that it is
     * active and will accept input from mouse or keyboard. This variable
     * is "true" if it is focused and "false" if not. This variable is
     * often used when you want to warn people they need to click on the
     * browser before it will work.
    */
    p.focused         = false;
    p.breakShape      = false;

    // Glyph path storage for textFonts
    p.glyphTable      = {};

    // Global vars for tracking mouse position
    p.pmouseX         = 0;
    p.pmouseY         = 0;
    p.mouseX          = 0;
    p.mouseY          = 0;
    p.mouseButton     = 0;
    p.mouseScroll     = 0;

    // Undefined event handlers to be replaced by user when needed
    p.mouseClicked    = undef;
    p.mouseDragged    = undef;
    p.mouseMoved      = undef;
    p.mousePressed    = undef;
    p.mouseReleased   = undef;
    p.mouseScrolled   = undef;
    p.mouseOver       = undef;
    p.mouseOut        = undef;
    p.touchStart      = undef;
    p.touchEnd        = undef;
    p.touchMove       = undef;
    p.touchCancel     = undef;
    p.key             = undef;
    p.keyCode         = undef;
    p.keyPressed      = noop; // needed to remove function checks
    p.keyReleased     = noop;
    p.keyTyped        = noop;
    p.draw            = undef;
    p.setup           = undef;

    // Remapped vars
    p.__mousePressed  = false;
    p.__keyPressed    = false;
    p.__frameRate     = 60;

    // The current animation frame
    p.frameCount      = 0;

    // The height/width of the canvas
    p.width           = 100;
    p.height          = 100;

    // "Private" variables used to maintain state
    var curContext,
        curSketch,
        drawing, // hold a Drawing2D or Drawing3D object
        doFill = true,
        fillStyle = [1.0, 1.0, 1.0, 1.0],
        currentFillColor = 0xFFFFFFFF,
        isFillDirty = true,
        doStroke = true,
        strokeStyle = [0.0, 0.0, 0.0, 1.0],
        currentStrokeColor = 0xFF000000,
        isStrokeDirty = true,
        lineWidth = 1,
        loopStarted = false,
        renderSmooth = false,
        doLoop = true,
        looping = 0,
        curRectMode = PConstants.CORNER,
        curEllipseMode = PConstants.CENTER,
        normalX = 0,
        normalY = 0,
        normalZ = 0,
        normalMode = PConstants.NORMAL_MODE_AUTO,
        curFrameRate = 60,
        curMsPerFrame = 1000/curFrameRate,
        curCursor = PConstants.ARROW,
        oldCursor = curElement.style.cursor,
        curShape = PConstants.POLYGON,
        curShapeCount = 0,
        curvePoints = [],
        curTightness = 0,
        curveDet = 20,
        curveInited = false,
        backgroundObj = -3355444, // rgb(204, 204, 204) is the default gray background colour
        bezDetail = 20,
        colorModeA = 255,
        colorModeX = 255,
        colorModeY = 255,
        colorModeZ = 255,
        pathOpen = false,
        mouseDragging = false,
        pmouseXLastFrame = 0,
        pmouseYLastFrame = 0,
        curColorMode = PConstants.RGB,
        curTint = null,
        curTint3d = null,
        getLoaded = false,
        start = Date.now(),
        timeSinceLastFPS = start,
        framesSinceLastFPS = 0,
        textcanvas,
        curveBasisMatrix,
        curveToBezierMatrix,
        curveDrawMatrix,
        bezierDrawMatrix,
        bezierBasisInverse,
        bezierBasisMatrix,
        curContextCache = { attributes: {}, locations: {} },
        // Shaders
        programObject3D,
        programObject2D,
        programObjectUnlitShape,
        boxBuffer,
        boxNormBuffer,
        boxOutlineBuffer,
        rectBuffer,
        rectNormBuffer,
        sphereBuffer,
        lineBuffer,
        fillBuffer,
        fillColorBuffer,
        strokeColorBuffer,
        pointBuffer,
        shapeTexVBO,
        canTex,   // texture for createGraphics
        textTex,   // texture for 3d tex
        curTexture = {width:0,height:0},
        curTextureMode = PConstants.IMAGE,
        usingTexture = false,
        textBuffer,
        textureBuffer,
        indexBuffer,
        // Text alignment
        horizontalTextAlignment = PConstants.LEFT,
        verticalTextAlignment = PConstants.BASELINE,
        textMode = PConstants.MODEL,
        // Font state
        curFontName = "Arial",
        curTextSize = 12,
        curTextAscent = 9,
        curTextDescent = 2,
        curTextLeading = 14,
        curTextFont = PFont.get(curFontName, curTextSize),
        // Pixels cache
        originalContext,
        proxyContext = null,
        isContextReplaced = false,
        setPixelsCached,
        maxPixelsCached = 1000,
        pressedKeysMap = [],
        lastPressedKeyCode = null,
        codedKeys = [ PConstants.SHIFT, PConstants.CONTROL, PConstants.ALT, PConstants.CAPSLK, PConstants.PGUP, PConstants.PGDN,
                      PConstants.END, PConstants.HOME, PConstants.LEFT, PConstants.UP, PConstants.RIGHT, PConstants.DOWN, PConstants.NUMLK,
                      PConstants.INSERT, PConstants.F1, PConstants.F2, PConstants.F3, PConstants.F4, PConstants.F5, PConstants.F6, PConstants.F7,
                      PConstants.F8, PConstants.F9, PConstants.F10, PConstants.F11, PConstants.F12, PConstants.META ];

    // User can only have MAX_LIGHTS lights
    var lightCount = 0;

    //sphere stuff
    var sphereDetailV = 0,
        sphereDetailU = 0,
        sphereX = [],
        sphereY = [],
        sphereZ = [],
        sinLUT = new Float32Array(PConstants.SINCOS_LENGTH),
        cosLUT = new Float32Array(PConstants.SINCOS_LENGTH),
        sphereVerts,
        sphereNorms;

    // Camera defaults and settings
    var cam,
        cameraInv,
        modelView,
        modelViewInv,
        userMatrixStack,
        userReverseMatrixStack,
        inverseCopy,
        projection,
        manipulatingCamera = false,
        frustumMode = false,
        cameraFOV = 60 * (Math.PI / 180),
        cameraX = p.width / 2,
        cameraY = p.height / 2,
        cameraZ = cameraY / Math.tan(cameraFOV / 2),
        cameraNear = cameraZ / 10,
        cameraFar = cameraZ * 10,
        cameraAspect = p.width / p.height;

    var vertArray = [],
        curveVertArray = [],
        curveVertCount = 0,
        isCurve = false,
        isBezier = false,
        firstVert = true;

    //PShape stuff
    var curShapeMode = PConstants.CORNER;

    // Stores states for pushStyle() and popStyle().
    var styleArray = [];

    // The vertices for the box cannot be specified using a triangle strip since each
    // side of the cube must have its own set of normals.
    // Vertices are specified in a counter-clockwise order.
    // Triangles are in this order: back, front, right, bottom, left, top.
    var boxVerts = new Float32Array([
       0.5,  0.5, -0.5,  0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5,  0.5, -0.5,  0.5,  0.5, -0.5,
       0.5,  0.5,  0.5, -0.5,  0.5,  0.5, -0.5, -0.5,  0.5, -0.5, -0.5,  0.5,  0.5, -0.5,  0.5,  0.5,  0.5,  0.5,
       0.5,  0.5, -0.5,  0.5,  0.5,  0.5,  0.5, -0.5,  0.5,  0.5, -0.5,  0.5,  0.5, -0.5, -0.5,  0.5,  0.5, -0.5,
       0.5, -0.5, -0.5,  0.5, -0.5,  0.5, -0.5, -0.5,  0.5, -0.5, -0.5,  0.5, -0.5, -0.5, -0.5,  0.5, -0.5, -0.5,
      -0.5, -0.5, -0.5, -0.5, -0.5,  0.5, -0.5,  0.5,  0.5, -0.5,  0.5,  0.5, -0.5,  0.5, -0.5, -0.5, -0.5, -0.5,
       0.5,  0.5,  0.5,  0.5,  0.5, -0.5, -0.5,  0.5, -0.5, -0.5,  0.5, -0.5, -0.5,  0.5,  0.5,  0.5,  0.5,  0.5]);

    var boxOutlineVerts = new Float32Array([
       0.5,  0.5,  0.5,  0.5, -0.5,  0.5,  0.5,  0.5, -0.5,  0.5, -0.5, -0.5,
      -0.5,  0.5, -0.5, -0.5, -0.5, -0.5, -0.5,  0.5,  0.5, -0.5, -0.5,  0.5,
       0.5,  0.5,  0.5,  0.5,  0.5, -0.5,  0.5,  0.5, -0.5, -0.5,  0.5, -0.5,
      -0.5,  0.5, -0.5, -0.5,  0.5,  0.5, -0.5,  0.5,  0.5,  0.5,  0.5,  0.5,
       0.5, -0.5,  0.5,  0.5, -0.5, -0.5,  0.5, -0.5, -0.5, -0.5, -0.5, -0.5,
      -0.5, -0.5, -0.5, -0.5, -0.5,  0.5, -0.5, -0.5,  0.5,  0.5, -0.5,  0.5]);

    var boxNorms = new Float32Array([
       0,  0, -1,  0,  0, -1,  0,  0, -1,  0,  0, -1,  0,  0, -1,  0,  0, -1,
       0,  0,  1,  0,  0,  1,  0,  0,  1,  0,  0,  1,  0,  0,  1,  0,  0,  1,
       1,  0,  0,  1,  0,  0,  1,  0,  0,  1,  0,  0,  1,  0,  0,  1,  0,  0,
       0, -1,  0,  0, -1,  0,  0, -1,  0,  0, -1,  0,  0, -1,  0,  0, -1,  0,
      -1,  0,  0, -1,  0,  0, -1,  0,  0, -1,  0,  0, -1,  0,  0, -1,  0,  0,
       0,  1,  0,  0,  1,  0,  0,  1,  0,  0,  1,  0,  0,  1,  0,  0,  1,  0]);

    // These verts are used for the fill and stroke using TRIANGLE_FAN and LINE_LOOP.
    var rectVerts = new Float32Array([0,0,0, 0,1,0, 1,1,0, 1,0,0]);

    var rectNorms = new Float32Array([0,0,1, 0,0,1, 0,0,1, 0,0,1]);

    // Shader for points and lines in begin/endShape.
    var vertexShaderSrcUnlitShape =
      "varying vec4 vFrontColor;" +

      "attribute vec3 aVertex;" +
      "attribute vec4 aColor;" +

      "uniform mat4 uView;" +
      "uniform mat4 uProjection;" +
      "uniform float uPointSize;" +

      "void main(void) {" +
      "  vFrontColor = aColor;" +
      "  gl_PointSize = uPointSize;" +
      "  gl_Position = uProjection * uView * vec4(aVertex, 1.0);" +
      "}";

    var fragmentShaderSrcUnlitShape =
      "#ifdef GL_ES\n" +
      "precision highp float;\n" +
      "#endif\n" +

      "varying vec4 vFrontColor;" +
      "uniform bool uSmooth;" +

      "void main(void){" +
      "  if(uSmooth == true){" +
      "    float dist = distance(gl_PointCoord, vec2(0.5));" +
      "    if(dist > 0.5){" +
      "      discard;" +
      "    }" +
      "  }" +
      "  gl_FragColor = vFrontColor;" +
      "}";

    // Shader for rect, text, box outlines, sphere outlines, point() and line().
    var vertexShaderSrc2D =
      "varying vec4 vFrontColor;" +

      "attribute vec3 aVertex;" +
      "attribute vec2 aTextureCoord;" +
      "uniform vec4 uColor;" +

      "uniform mat4 uModel;" +
      "uniform mat4 uView;" +
      "uniform mat4 uProjection;" +
      "uniform float uPointSize;" +
      "varying vec2 vTextureCoord;"+

      "void main(void) {" +
      "  gl_PointSize = uPointSize;" +
      "  vFrontColor = uColor;" +
      "  gl_Position = uProjection * uView * uModel * vec4(aVertex, 1.0);" +
      "  vTextureCoord = aTextureCoord;" +
      "}";

    var fragmentShaderSrc2D =
      "#ifdef GL_ES\n" +
      "precision highp float;\n" +
      "#endif\n" +

      "varying vec4 vFrontColor;" +
      "varying vec2 vTextureCoord;"+

      "uniform sampler2D uSampler;"+
      "uniform int uIsDrawingText;"+
      "uniform bool uSmooth;" +

      "void main(void){" +
      // WebGL does not support POINT_SMOOTH, so we do it ourselves
      "  if(uSmooth == true){" +
      "    float dist = distance(gl_PointCoord, vec2(0.5));" +
      "    if(dist > 0.5){" +
      "      discard;" +
      "    }" +
      "  }" +

      "  if(uIsDrawingText == 1){" +
      "    float alpha = texture2D(uSampler, vTextureCoord).a;"+
      "    gl_FragColor = vec4(vFrontColor.rgb * alpha, alpha);"+
      "  }" +
      "  else{" +
      "    gl_FragColor = vFrontColor;" +
      "  }" +
      "}";

    var webglMaxTempsWorkaround = /Windows/.test(navigator.userAgent);

    // Vertex shader for boxes and spheres.
    var vertexShaderSrc3D =
      "varying vec4 vFrontColor;" +

      "attribute vec3 aVertex;" +
      "attribute vec3 aNormal;" +
      "attribute vec4 aColor;" +
      "attribute vec2 aTexture;" +
      "varying   vec2 vTexture;" +

      "uniform vec4 uColor;" +

      "uniform bool uUsingMat;" +
      "uniform vec3 uSpecular;" +
      "uniform vec3 uMaterialEmissive;" +
      "uniform vec3 uMaterialAmbient;" +
      "uniform vec3 uMaterialSpecular;" +
      "uniform float uShininess;" +

      "uniform mat4 uModel;" +
      "uniform mat4 uView;" +
      "uniform mat4 uProjection;" +
      "uniform mat4 uNormalTransform;" +

      "uniform int uLightCount;" +
      "uniform vec3 uFalloff;" +

      // Careful changing the order of these fields. Some cards
      // have issues with memory alignment.
      "struct Light {" +
      "  int type;" +
      "  vec3 color;" +
      "  vec3 position;" +
      "  vec3 direction;" +
      "  float angle;" +
      "  vec3 halfVector;" +
      "  float concentration;" +
      "};" +

      // nVidia cards have issues with arrays of structures
      // so instead we create 8 instances of Light.
      "uniform Light uLights0;" +
      "uniform Light uLights1;" +
      "uniform Light uLights2;" +
      "uniform Light uLights3;" +
      "uniform Light uLights4;" +
      "uniform Light uLights5;" +
      "uniform Light uLights6;" +
      "uniform Light uLights7;" +

     // GLSL does not support switch.
      "Light getLight(int index){" +
      "  if(index == 0) return uLights0;" +
      "  if(index == 1) return uLights1;" +
      "  if(index == 2) return uLights2;" +
      "  if(index == 3) return uLights3;" +
      "  if(index == 4) return uLights4;" +
      "  if(index == 5) return uLights5;" +
      "  if(index == 6) return uLights6;" +
      // Do not use a conditional for the last return statement
      // because some video cards will fail and complain that
      // "not all paths return".
      "  return uLights7;" +
      "}" +

      "void AmbientLight( inout vec3 totalAmbient, in vec3 ecPos, in Light light ) {" +
      // Get the vector from the light to the vertex and
      // get the distance from the current vector to the light position.
      "  float d = length( light.position - ecPos );" +
      "  float attenuation = 1.0 / ( uFalloff[0] + ( uFalloff[1] * d ) + ( uFalloff[2] * d * d ));" +
      "  totalAmbient += light.color * attenuation;" +
      "}" +

      /*
        col - accumulated color
        spec - accumulated specular highlight
        vertNormal - Normal of the vertex
        ecPos - eye coordinate position
        light - light structure
      */
      "void DirectionalLight( inout vec3 col, inout vec3 spec, in vec3 vertNormal, in vec3 ecPos, in Light light ) {" +
      "  float powerFactor = 0.0;" +
      "  float nDotVP = max(0.0, dot( vertNormal, normalize(-light.position) ));" +
      "  float nDotVH = max(0.0, dot( vertNormal, normalize(-light.position-normalize(ecPos) )));" +

      "  if( nDotVP != 0.0 ){" +
      "    powerFactor = pow( nDotVH, uShininess );" +
      "  }" +

      "  col += light.color * nDotVP;" +
      "  spec += uSpecular * powerFactor;" +
      "}" +

      /*
        col - accumulated color
        spec - accumulated specular highlight
        vertNormal - Normal of the vertex
        ecPos - eye coordinate position
        light - light structure
      */
      "void PointLight( inout vec3 col, inout vec3 spec, in vec3 vertNormal, in vec3 ecPos, in Light light ) {" +
      "  float powerFactor;" +

      // Get the vector from the light to the vertex.
      "   vec3 VP = light.position - ecPos;" +

      // Get the distance from the current vector to the light position.
      "  float d = length( VP ); " +

      // Normalize the light ray so it can be used in the dot product operation.
      "  VP = normalize( VP );" +

      "  float attenuation = 1.0 / ( uFalloff[0] + ( uFalloff[1] * d ) + ( uFalloff[2] * d * d ));" +

      "  float nDotVP = max( 0.0, dot( vertNormal, VP ));" +
      "  vec3 halfVector = normalize( VP - normalize(ecPos) );" +
      "  float nDotHV = max( 0.0, dot( vertNormal, halfVector ));" +

      "  if( nDotVP == 0.0 ) {" +
      "    powerFactor = 0.0;" +
      "  }" +
      "  else {" +
      "    powerFactor = pow( nDotHV, uShininess );" +
      "  }" +

      "  spec += uSpecular * powerFactor * attenuation;" +
      "  col += light.color * nDotVP * attenuation;" +
      "}" +

      /*
        col - accumulated color
        spec - accumulated specular highlight
        vertNormal - Normal of the vertex
        ecPos - eye coordinate position
        light - light structure
      */
      "void SpotLight( inout vec3 col, inout vec3 spec, in vec3 vertNormal, in vec3 ecPos, in Light light ) {" +
      "  float spotAttenuation;" +
      "  float powerFactor = 0.0;" +

      // Calculate the vector from the current vertex to the light.
      "  vec3 VP = light.position - ecPos;" +
      "  vec3 ldir = normalize( -light.direction );" +

      // Get the distance from the spotlight and the vertex
      "  float d = length( VP );" +
      "  VP = normalize( VP );" +

      "  float attenuation = 1.0 / ( uFalloff[0] + ( uFalloff[1] * d ) + ( uFalloff[2] * d * d ) );" +

      // Dot product of the vector from vertex to light and light direction.
      "  float spotDot = dot( VP, ldir );" +

      // If the vertex falls inside the cone
      (webglMaxTempsWorkaround ? // Windows reports max temps error if light.angle is used
      "  spotAttenuation = 1.0; " :
      "  if( spotDot > cos( light.angle ) ) {" +
      "    spotAttenuation = pow( spotDot, light.concentration );" +
      "  }" +
      "  else{" +
      "    spotAttenuation = 0.0;" +
      "  }" +
      "  attenuation *= spotAttenuation;" +
      "") +

      "  float nDotVP = max( 0.0, dot( vertNormal, VP ) );" +
      "  vec3 halfVector = normalize( VP - normalize(ecPos) );" +
      "  float nDotHV = max( 0.0, dot( vertNormal, halfVector ) );" +

      "  if( nDotVP != 0.0 ) {" +
      "    powerFactor = pow( nDotHV, uShininess );" +
      "  }" +

      "  spec += uSpecular * powerFactor * attenuation;" +
      "  col += light.color * nDotVP * attenuation;" +
      "}" +

      "void main(void) {" +
      "  vec3 finalAmbient = vec3( 0.0 );" +
      "  vec3 finalDiffuse = vec3( 0.0 );" +
      "  vec3 finalSpecular = vec3( 0.0 );" +

      "  vec4 col = uColor;" +

      "  if ( uColor[0] == -1.0 ){" +
      "    col = aColor;" +
      "  }" +

      // We use the sphere vertices as the normals when we create the sphere buffer.
      // But this only works if the sphere vertices are unit length, so we
      // have to normalize the normals here. Since this is only required for spheres
      // we could consider placing this in a conditional later on.
      "  vec3 norm = normalize(vec3( uNormalTransform * vec4( aNormal, 0.0 ) ));" +

      "  vec4 ecPos4 = uView * uModel * vec4(aVertex, 1.0);" +
      "  vec3 ecPos = (vec3(ecPos4))/ecPos4.w;" +

      // If there were no lights this draw call, just use the
      // assigned fill color of the shape and the specular value.
      "  if( uLightCount == 0 ) {" +
      "    vFrontColor = col + vec4(uMaterialSpecular, 1.0);" +
      "  }" +
      "  else {" +
           // WebGL forces us to iterate over a constant value
           // so we can't iterate using lightCount.
      "    for( int i = 0; i < 8; i++ ) {" +
      "      Light l = getLight(i);" +

      // We can stop iterating if we know we have gone past
      // the number of lights which are actually on. This gives us a
      // significant performance increase with high vertex counts.
      "      if( i >= uLightCount ){" +
      "        break;" +
      "      }" +

      "      if( l.type == 0 ) {" +
      "        AmbientLight( finalAmbient, ecPos, l );" +
      "      }" +
      "      else if( l.type == 1 ) {" +
      "        DirectionalLight( finalDiffuse, finalSpecular, norm, ecPos, l );" +
      "      }" +
      "      else if( l.type == 2 ) {" +
      "        PointLight( finalDiffuse, finalSpecular, norm, ecPos, l );" +
      "      }" +
      "      else {" +
      "        SpotLight( finalDiffuse, finalSpecular, norm, ecPos, l );" +
      "      }" +
      "    }" +

      "   if( uUsingMat == false ) {" +
      "     vFrontColor = vec4(" +
      "       vec3( col ) * finalAmbient +" +
      "       vec3( col ) * finalDiffuse +" +
      "       vec3( col ) * finalSpecular," +
      "       col[3] );" +
      "   }" +
      "   else{" +
      "     vFrontColor = vec4( " +
      "       uMaterialEmissive + " +
      "       (vec3(col) * uMaterialAmbient * finalAmbient ) + " +
      "       (vec3(col) * finalDiffuse) + " +
      "       (uMaterialSpecular * finalSpecular), " +
      "       col[3] );" +
      "    }" +
      "  }" +

      "  vTexture.xy = aTexture.xy;" +
      "  gl_Position = uProjection * uView * uModel * vec4( aVertex, 1.0 );" +
      "}";

    var fragmentShaderSrc3D =
      "#ifdef GL_ES\n" +
      "precision highp float;\n" +
      "#endif\n" +

      "varying vec4 vFrontColor;" +

      "uniform sampler2D uSampler;" +
      "uniform bool uUsingTexture;" +
      "varying vec2 vTexture;" +

      // In Processing, when a texture is used, the fill color is ignored
      // vec4(1.0,1.0,1.0,0.5)
      "void main(void){" +
      "  if( uUsingTexture ){" +
      "    gl_FragColor = vec4(texture2D(uSampler, vTexture.xy)) * vFrontColor;" +
      "  }"+
      "  else{" +
      "    gl_FragColor = vFrontColor;" +
      "  }" +
      "}";

    ////////////////////////////////////////////////////////////////////////////
    // 3D Functions
    ////////////////////////////////////////////////////////////////////////////

    /*
     * Sets a uniform variable in a program object to a particular
     * value. Before calling this function, ensure the correct
     * program object has been installed as part of the current
     * rendering state by calling useProgram.
     *
     * On some systems, if the variable exists in the shader but isn't used,
     * the compiler will optimize it out and this function will fail.
     *
     * @param {String} cacheId
     * @param {WebGLProgram} programObj program object returned from
     * createProgramObject
     * @param {String} varName the name of the variable in the shader
     * @param {float | Array} varValue either a scalar value or an Array
     *
     * @returns none
     *
     * @see uniformi
     * @see uniformMatrix
    */
    function uniformf(cacheId, programObj, varName, varValue) {
      var varLocation = curContextCache.locations[cacheId];
      if(varLocation === undef) {
        varLocation = curContext.getUniformLocation(programObj, varName);
        curContextCache.locations[cacheId] = varLocation;
      }
      // the variable won't be found if it was optimized out.
      if (varLocation !== null) {
        if (varValue.length === 4) {
          curContext.uniform4fv(varLocation, varValue);
        } else if (varValue.length === 3) {
          curContext.uniform3fv(varLocation, varValue);
        } else if (varValue.length === 2) {
          curContext.uniform2fv(varLocation, varValue);
        } else {
          curContext.uniform1f(varLocation, varValue);
        }
      }
    }

    /**
     * Sets a uniform int or int array in a program object to a particular
     * value. Before calling this function, ensure the correct
     * program object has been installed as part of the current
     * rendering state.
     *
     * On some systems, if the variable exists in the shader but isn't used,
     * the compiler will optimize it out and this function will fail.
     *
     * @param {String} cacheId
     * @param {WebGLProgram} programObj program object returned from
     * createProgramObject
     * @param {String} varName the name of the variable in the shader
     * @param {int | Array} varValue either a scalar value or an Array
     *
     * @returns none
     *
     * @see uniformf
     * @see uniformMatrix
    */
    function uniformi(cacheId, programObj, varName, varValue) {
      var varLocation = curContextCache.locations[cacheId];
      if(varLocation === undef) {
        varLocation = curContext.getUniformLocation(programObj, varName);
        curContextCache.locations[cacheId] = varLocation;
      }
      // the variable won't be found if it was optimized out.
      if (varLocation !== null) {
        if (varValue.length === 4) {
          curContext.uniform4iv(varLocation, varValue);
        } else if (varValue.length === 3) {
          curContext.uniform3iv(varLocation, varValue);
        } else if (varValue.length === 2) {
          curContext.uniform2iv(varLocation, varValue);
        } else {
          curContext.uniform1i(varLocation, varValue);
        }
      }
    }

    /**
     * Sets the value of a uniform matrix variable in a program
     * object. Before calling this function, ensure the correct
     * program object has been installed as part of the current
     * rendering state.
     *
     * On some systems, if the variable exists in the shader but
     * isn't used, the compiler will optimize it out and this
     * function will fail.
     *
     * @param {String} cacheId
     * @param {WebGLProgram} programObj program object returned from
     * createProgramObject
     * @param {String} varName the name of the variable in the shader
     * @param {boolean} transpose must be false
     * @param {Array} matrix an array of 4, 9 or 16 values
     *
     * @returns none
     *
     * @see uniformi
     * @see uniformf
    */
    function uniformMatrix(cacheId, programObj, varName, transpose, matrix) {
      var varLocation = curContextCache.locations[cacheId];
      if(varLocation === undef) {
        varLocation = curContext.getUniformLocation(programObj, varName);
        curContextCache.locations[cacheId] = varLocation;
      }
      // The variable won't be found if it was optimized out.
      if (varLocation !== -1) {
        if (matrix.length === 16) {
          curContext.uniformMatrix4fv(varLocation, transpose, matrix);
        } else if (matrix.length === 9) {
          curContext.uniformMatrix3fv(varLocation, transpose, matrix);
        } else {
          curContext.uniformMatrix2fv(varLocation, transpose, matrix);
        }
      }
    }

    /**
     * Binds the VBO, sets the vertex attribute data for the program
     * object and enables the attribute.
     *
     * On some systems, if the attribute exists in the shader but
     * isn't used, the compiler will optimize it out and this
     * function will fail.
     *
     * @param {String} cacheId
     * @param {WebGLProgram} programObj program object returned from
     * createProgramObject
     * @param {String} varName the name of the variable in the shader
     * @param {int} size the number of components per vertex attribute
     * @param {WebGLBuffer} VBO Vertex Buffer Object
     *
     * @returns none
     *
     * @see disableVertexAttribPointer
    */
    function vertexAttribPointer(cacheId, programObj, varName, size, VBO) {
      var varLocation = curContextCache.attributes[cacheId];
      if(varLocation === undef) {
        varLocation = curContext.getAttribLocation(programObj, varName);
        curContextCache.attributes[cacheId] = varLocation;
      }
      if (varLocation !== -1) {
        curContext.bindBuffer(curContext.ARRAY_BUFFER, VBO);
        curContext.vertexAttribPointer(varLocation, size, curContext.FLOAT, false, 0, 0);
        curContext.enableVertexAttribArray(varLocation);
      }
    }

    /**
     * Disables a program object attribute from being sent to WebGL.
     *
     * @param {String} cacheId
     * @param {WebGLProgram} programObj program object returned from
     * createProgramObject
     * @param {String} varName name of the attribute
     *
     * @returns none
     *
     * @see vertexAttribPointer
    */
    function disableVertexAttribPointer(cacheId, programObj, varName){
      var varLocation = curContextCache.attributes[cacheId];
      if(varLocation === undef) {
        varLocation = curContext.getAttribLocation(programObj, varName);
        curContextCache.attributes[cacheId] = varLocation;
      }
      if (varLocation !== -1) {
        curContext.disableVertexAttribArray(varLocation);
      }
    }

    /**
     * Creates a WebGL program object.
     *
     * @param {String} vetexShaderSource
     * @param {String} fragmentShaderSource
     *
     * @returns {WebGLProgram} A program object
    */
    var createProgramObject = function(curContext, vetexShaderSource, fragmentShaderSource) {
      var vertexShaderObject = curContext.createShader(curContext.VERTEX_SHADER);
      curContext.shaderSource(vertexShaderObject, vetexShaderSource);
      curContext.compileShader(vertexShaderObject);
      if (!curContext.getShaderParameter(vertexShaderObject, curContext.COMPILE_STATUS)) {
        throw curContext.getShaderInfoLog(vertexShaderObject);
      }

      var fragmentShaderObject = curContext.createShader(curContext.FRAGMENT_SHADER);
      curContext.shaderSource(fragmentShaderObject, fragmentShaderSource);
      curContext.compileShader(fragmentShaderObject);
      if (!curContext.getShaderParameter(fragmentShaderObject, curContext.COMPILE_STATUS)) {
        throw curContext.getShaderInfoLog(fragmentShaderObject);
      }

      var programObject = curContext.createProgram();
      curContext.attachShader(programObject, vertexShaderObject);
      curContext.attachShader(programObject, fragmentShaderObject);
      curContext.linkProgram(programObject);
      if (!curContext.getProgramParameter(programObject, curContext.LINK_STATUS)) {
        throw "Error linking shaders.";
      }

      return programObject;
    };

    ////////////////////////////////////////////////////////////////////////////
    // 2D/3D drawing handling
    ////////////////////////////////////////////////////////////////////////////
    var imageModeCorner = function(x, y, w, h, whAreSizes) {
      return {
        x: x,
        y: y,
        w: w,
        h: h
      };
    };
    var imageModeConvert = imageModeCorner;

    var imageModeCorners = function(x, y, w, h, whAreSizes) {
      return {
        x: x,
        y: y,
        w: whAreSizes ? w : w - x,
        h: whAreSizes ? h : h - y
      };
    };

    var imageModeCenter = function(x, y, w, h, whAreSizes) {
      return {
        x: x - w / 2,
        y: y - h / 2,
        w: w,
        h: h
      };
    };

    // Objects for shared, 2D and 3D contexts
    var DrawingShared = function(){};
    var Drawing2D = function(){};
    var Drawing3D = function(){};
    var DrawingPre = function(){};

    // Setup the prototype chain
    Drawing2D.prototype = new DrawingShared();
    Drawing2D.prototype.constructor = Drawing2D;
    Drawing3D.prototype = new DrawingShared();
    Drawing3D.prototype.constructor = Drawing3D;
    DrawingPre.prototype = new DrawingShared();
    DrawingPre.prototype.constructor = DrawingPre;

    // A no-op function for when the user calls 3D functions from a 2D sketch
    // We can change this to a throw or console.error() later if we want
    DrawingShared.prototype.a3DOnlyFunction = noop;

    /**
     * The shape() function displays shapes to the screen.
     * Processing currently works with SVG shapes only.
     * The <b>shape</b> parameter specifies the shape to display and the <b>x</b>
     * and <b>y</b> parameters define the location of the shape from its
     * upper-left corner.
     * The shape is displayed at its original size unless the <b>width</b>
     * and <b>height</b> parameters specify a different size.
     * The <b>shapeMode()</b> function changes the way the parameters work.
     * A call to <b>shapeMode(CORNERS)</b>, for example, will change the width
     * and height parameters to define the x and y values of the opposite corner
     * of the shape.
     * <br><br>
     * Note complex shapes may draw awkwardly with P2D, P3D, and OPENGL. Those
     * renderers do not yet support shapes that have holes or complicated breaks.
     *
     * @param {PShape} shape       the shape to display
     * @param {int|float} x        x-coordinate of the shape
     * @param {int|float} y        y-coordinate of the shape
     * @param {int|float} width    width to display the shape
     * @param {int|float} height   height to display the shape
     *
     * @see PShape
     * @see loadShape()
     * @see shapeMode()
     */
    p.shape = function(shape, x, y, width, height) {
      if (arguments.length >= 1 && arguments[0] !== null) {
        if (shape.isVisible()) {
          p.pushMatrix();
          if (curShapeMode === PConstants.CENTER) {
            if (arguments.length === 5) {
              p.translate(x - width/2, y - height/2);
              p.scale(width / shape.getWidth(), height / shape.getHeight());
            } else if (arguments.length === 3) {
              p.translate(x - shape.getWidth()/2, - shape.getHeight()/2);
            } else {
              p.translate(-shape.getWidth()/2, -shape.getHeight()/2);
            }
          } else if (curShapeMode === PConstants.CORNER) {
            if (arguments.length === 5) {
              p.translate(x, y);
              p.scale(width / shape.getWidth(), height / shape.getHeight());
            } else if (arguments.length === 3) {
              p.translate(x, y);
            }
          } else if (curShapeMode === PConstants.CORNERS) {
            if (arguments.length === 5) {
              width  -= x;
              height -= y;
              p.translate(x, y);
              p.scale(width / shape.getWidth(), height / shape.getHeight());
            } else if (arguments.length === 3) {
              p.translate(x, y);
            }
          }
          shape.draw(p);
          if ((arguments.length === 1 && curShapeMode === PConstants.CENTER ) || arguments.length > 1) {
            p.popMatrix();
          }
        }
      }
    };

    /**
     * The shapeMode() function modifies the location from which shapes draw.
     * The default mode is <b>shapeMode(CORNER)</b>, which specifies the
     * location to be the upper left corner of the shape and uses the third
     * and fourth parameters of <b>shape()</b> to specify the width and height.
     * The syntax <b>shapeMode(CORNERS)</b> uses the first and second parameters
     * of <b>shape()</b> to set the location of one corner and uses the third
     * and fourth parameters to set the opposite corner.
     * The syntax <b>shapeMode(CENTER)</b> draws the shape from its center point
     * and uses the third and forth parameters of <b>shape()</b> to specify the
     * width and height.
     * The parameter must be written in "ALL CAPS" because Processing syntax
     * is case sensitive.
     *
     * @param {int} mode One of CORNER, CORNERS, CENTER
     *
     * @see shape()
     * @see rectMode()
     */
    p.shapeMode = function (mode) {
      curShapeMode = mode;
    };

    /**
     * The loadShape() function loads vector shapes into a variable of type PShape. Currently, only SVG files may be loaded.
     * In most cases, <b>loadShape()</b> should be used inside <b>setup()</b> because loading shapes inside <b>draw()</b> will reduce the speed of a sketch.
     *
     * @param {String} filename     an SVG file
     *
     * @return {PShape} a object of type PShape or null
     * @see PShape
     * @see PApplet#shape()
     * @see PApplet#shapeMode()
     */
    p.loadShape = function (filename) {
      if (arguments.length === 1) {
        if (filename.indexOf(".svg") > -1) {
          return new PShapeSVG(null, filename);
        }
      }
      return null;
    };

    /**
     * Processing 2.0 function for loading XML files.
     *
     * @param {String} uri The uri for the xml file to load.
     *
     * @return {XML} An XML object representing the xml data.
     */
    p.loadXML = function(uri) {
      return new XML(p, uri);
    };

    /**
     * Processing 2.0 function for creating XML elements from string
     *
     * @param {String} xml the XML source code
     *
     * @return {XML} An XML object representation of the input XML markup.
     */
    p.parseXML = function(xmlstring) {
      var element = new XML();
      element.parse(xmlstring);
      return element;
    };

    ////////////////////////////////////////////////////////////////////////////
    // 2D Matrix
    ////////////////////////////////////////////////////////////////////////////

    /**
     * Helper function for printMatrix(). Finds the largest scalar
     * in the matrix, then number of digits left of the decimal.
     * Call from PMatrix2D and PMatrix3D's print() function.
     */
    var printMatrixHelper = function(elements) {
      var big = 0;
      for (var i = 0; i < elements.length; i++) {
        if (i !== 0) {
          big = Math.max(big, Math.abs(elements[i]));
        } else {
          big = Math.abs(elements[i]);
        }
      }

      var digits = (big + "").indexOf(".");
      if (digits === 0) {
        digits = 1;
      } else if (digits === -1) {
        digits = (big + "").length;
      }

      return digits;
    };
    /**
     * PMatrix2D is a 3x2 affine matrix implementation. The constructor accepts another PMatrix2D or a list of six float elements.
     * If no parameters are provided the matrix is set to the identity matrix.
     *
     * @param {PMatrix2D} matrix  the initial matrix to set to
     * @param {float} m00         the first element of the matrix
     * @param {float} m01         the second element of the matrix
     * @param {float} m02         the third element of the matrix
     * @param {float} m10         the fourth element of the matrix
     * @param {float} m11         the fifth element of the matrix
     * @param {float} m12         the sixth element of the matrix
     */
    var PMatrix2D = p.PMatrix2D = function() {
      if (arguments.length === 0) {
        this.reset();
      } else if (arguments.length === 1 && arguments[0] instanceof PMatrix2D) {
        this.set(arguments[0].array());
      } else if (arguments.length === 6) {
        this.set(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
      }
    };
    /**
     * PMatrix2D methods
     */
    PMatrix2D.prototype = {
      /**
       * @member PMatrix2D
       * The set() function sets the matrix elements. The function accepts either another PMatrix2D, an array of elements, or a list of six floats.
       *
       * @param {PMatrix2D} matrix    the matrix to set this matrix to
       * @param {float[]} elements    an array of elements to set this matrix to
       * @param {float} m00           the first element of the matrix
       * @param {float} m01           the third element of the matrix
       * @param {float} m10           the fourth element of the matrix
       * @param {float} m11           the fith element of the matrix
       * @param {float} m12           the sixth element of the matrix
       */
      set: function() {
        if (arguments.length === 6) {
          var a = arguments;
          this.set([a[0], a[1], a[2],
                    a[3], a[4], a[5]]);
        } else if (arguments.length === 1 && arguments[0] instanceof PMatrix2D) {
          this.elements = arguments[0].array();
        } else if (arguments.length === 1 && arguments[0] instanceof Array) {
          this.elements = arguments[0].slice();
        }
      },
      /**
       * @member PMatrix2D
       * The get() function returns a copy of this PMatrix2D.
       *
       * @return {PMatrix2D} a copy of this PMatrix2D
       */
      get: function() {
        var outgoing = new PMatrix2D();
        outgoing.set(this.elements);
        return outgoing;
      },
      /**
       * @member PMatrix2D
       * The reset() function sets this PMatrix2D to the identity matrix.
       */
      reset: function() {
        this.set([1, 0, 0, 0, 1, 0]);
      },
      /**
       * @member PMatrix2D
       * The array() function returns a copy of the element values.
       * @addon
       *
       * @return {float[]} returns a copy of the element values
       */
      array: function array() {
        return this.elements.slice();
      },
      /**
       * @member PMatrix2D
       * The translate() function translates this matrix by moving the current coordinates to the location specified by tx and ty.
       *
       * @param {float} tx  the x-axis coordinate to move to
       * @param {float} ty  the y-axis coordinate to move to
       */
      translate: function(tx, ty) {
        this.elements[2] = tx * this.elements[0] + ty * this.elements[1] + this.elements[2];
        this.elements[5] = tx * this.elements[3] + ty * this.elements[4] + this.elements[5];
      },
      /**
       * @member PMatrix2D
       * The invTranslate() function translates this matrix by moving the current coordinates to the negative location specified by tx and ty.
       *
       * @param {float} tx  the x-axis coordinate to move to
       * @param {float} ty  the y-axis coordinate to move to
       */
      invTranslate: function(tx, ty) {
        this.translate(-tx, -ty);
      },
       /**
       * @member PMatrix2D
       * The transpose() function is not used in processingjs.
       */
      transpose: function() {
        // Does nothing in Processing.
      },
      /**
       * @member PMatrix2D
       * The mult() function multiplied this matrix.
       * If two array elements are passed in the function will multiply a two element vector against this matrix.
       * If target is null or not length four, a new float array will be returned.
       * The values for vec and target can be the same (though that's less efficient).
       * If two PVectors are passed in the function multiply the x and y coordinates of a PVector against this matrix.
       *
       * @param {PVector} source, target  the PVectors used to multiply this matrix
       * @param {float[]} source, target  the arrays used to multiply this matrix
       *
       * @return {PVector|float[]} returns a PVector or an array representing the new matrix
       */
      mult: function(source, target) {
        var x, y;
        if (source instanceof PVector) {
          x = source.x;
          y = source.y;
          if (!target) {
            target = new PVector();
          }
        } else if (source instanceof Array) {
          x = source[0];
          y = source[1];
          if (!target) {
            target = [];
          }
        }
        if (target instanceof Array) {
          target[0] = this.elements[0] * x + this.elements[1] * y + this.elements[2];
          target[1] = this.elements[3] * x + this.elements[4] * y + this.elements[5];
        } else if (target instanceof PVector) {
          target.x = this.elements[0] * x + this.elements[1] * y + this.elements[2];
          target.y = this.elements[3] * x + this.elements[4] * y + this.elements[5];
          target.z = 0;
        }
        return target;
      },
      /**
       * @member PMatrix2D
       * The multX() function calculates the x component of a vector from a transformation.
       *
       * @param {float} x the x component of the vector being transformed
       * @param {float} y the y component of the vector being transformed
       *
       * @return {float} returnes the result of the calculation
       */
      multX: function(x, y) {
        return (x * this.elements[0] + y * this.elements[1] + this.elements[2]);
      },
      /**
       * @member PMatrix2D
       * The multY() function calculates the y component of a vector from a transformation.
       *
       * @param {float} x the x component of the vector being transformed
       * @param {float} y the y component of the vector being transformed
       *
       * @return {float} returnes the result of the calculation
       */
      multY: function(x, y) {
        return (x * this.elements[3] + y * this.elements[4] + this.elements[5]);
      },
      /**
       * @member PMatrix2D
       * The skewX() function skews the matrix along the x-axis the amount specified by the angle parameter.
       * Angles should be specified in radians (values from 0 to PI*2) or converted to radians with the <b>radians()</b> function.
       *
       * @param {float} angle  angle of skew specified in radians
       */
      skewX: function(angle) {
        this.apply(1, 0, 1, angle, 0, 0);
      },
      /**
       * @member PMatrix2D
       * The skewY() function skews the matrix along the y-axis the amount specified by the angle parameter.
       * Angles should be specified in radians (values from 0 to PI*2) or converted to radians with the <b>radians()</b> function.
       *
       * @param {float} angle  angle of skew specified in radians
       */
      skewY: function(angle) {
        this.apply(1, 0, 1,  0, angle, 0);
      },
      /**
       * @member PMatrix2D
       * The shearX() function shears the matrix along the x-axis the amount specified by the angle parameter.
       * Angles should be specified in radians (values from 0 to PI*2) or converted to radians with the <b>radians()</b> function.
       *
       * @param {float} angle  angle of skew specified in radians
       */
      shearX: function(angle) {
        this.apply(1, 0, 1, Math.tan(angle) , 0, 0);
      },
      /**
       * @member PMatrix2D
       * The shearY() function shears the matrix along the y-axis the amount specified by the angle parameter.
       * Angles should be specified in radians (values from 0 to PI*2) or converted to radians with the <b>radians()</b> function.
       *
       * @param {float} angle  angle of skew specified in radians
       */
      shearY: function(angle) {
        this.apply(1, 0, 1,  0, Math.tan(angle), 0);
      },
      /**
       * @member PMatrix2D
       * The determinant() function calvculates the determinant of this matrix.
       *
       * @return {float} the determinant of the matrix
       */
      determinant: function() {
        return (this.elements[0] * this.elements[4] - this.elements[1] * this.elements[3]);
      },
      /**
       * @member PMatrix2D
       * The invert() function inverts this matrix
       *
       * @return {boolean} true if successful
       */
      invert: function() {
        var d = this.determinant();
        if (Math.abs( d ) > PConstants.MIN_INT) {
          var old00 = this.elements[0];
          var old01 = this.elements[1];
          var old02 = this.elements[2];
          var old10 = this.elements[3];
          var old11 = this.elements[4];
          var old12 = this.elements[5];
          this.elements[0] =  old11 / d;
          this.elements[3] = -old10 / d;
          this.elements[1] = -old01 / d;
          this.elements[4] =  old00 / d;
          this.elements[2] = (old01 * old12 - old11 * old02) / d;
          this.elements[5] = (old10 * old02 - old00 * old12) / d;
          return true;
        }
        return false;
      },
      /**
       * @member PMatrix2D
       * The scale() function increases or decreases the size of a shape by expanding and contracting vertices. When only one parameter is specified scale will occur in all dimensions.
       * This is equivalent to a two parameter call.
       *
       * @param {float} sx  the amount to scale on the x-axis
       * @param {float} sy  the amount to scale on the y-axis
       */
      scale: function(sx, sy) {
        if (sx && !sy) {
          sy = sx;
        }
        if (sx && sy) {
          this.elements[0] *= sx;
          this.elements[1] *= sy;
          this.elements[3] *= sx;
          this.elements[4] *= sy;
        }
      },
       /**
        * @member PMatrix2D
        * The invScale() function decreases or increases the size of a shape by contracting and expanding vertices. When only one parameter is specified scale will occur in all dimensions.
        * This is equivalent to a two parameter call.
        *
        * @param {float} sx  the amount to scale on the x-axis
        * @param {float} sy  the amount to scale on the y-axis
        */
      invScale: function(sx, sy) {
        if (sx && !sy) {
          sy = sx;
        }
        this.scale(1 / sx, 1 / sy);
      },
      /**
       * @member PMatrix2D
       * The apply() function multiplies the current matrix by the one specified through the parameters. Note that either a PMatrix2D or a list of floats can be passed in.
       *
       * @param {PMatrix2D} matrix    the matrix to apply this matrix to
       * @param {float} m00           the first element of the matrix
       * @param {float} m01           the third element of the matrix
       * @param {float} m10           the fourth element of the matrix
       * @param {float} m11           the fith element of the matrix
       * @param {float} m12           the sixth element of the matrix
       */
      apply: function() {
        var source;
        if (arguments.length === 1 && arguments[0] instanceof PMatrix2D) {
          source = arguments[0].array();
        } else if (arguments.length === 6) {
          source = Array.prototype.slice.call(arguments);
        } else if (arguments.length === 1 && arguments[0] instanceof Array) {
          source = arguments[0];
        }

        var result = [0, 0, this.elements[2],
                      0, 0, this.elements[5]];
        var e = 0;
        for (var row = 0; row < 2; row++) {
          for (var col = 0; col < 3; col++, e++) {
            result[e] += this.elements[row * 3 + 0] * source[col + 0] +
                         this.elements[row * 3 + 1] * source[col + 3];
          }
        }
        this.elements = result.slice();
      },
      /**
       * @member PMatrix2D
       * The preApply() function applies another matrix to the left of this one. Note that either a PMatrix2D or elements of a matrix can be passed in.
       *
       * @param {PMatrix2D} matrix    the matrix to apply this matrix to
       * @param {float} m00           the first element of the matrix
       * @param {float} m01           the third element of the matrix
       * @param {float} m10           the fourth element of the matrix
       * @param {float} m11           the fith element of the matrix
       * @param {float} m12           the sixth element of the matrix
       */
      preApply: function() {
        var source;
        if (arguments.length === 1 && arguments[0] instanceof PMatrix2D) {
          source = arguments[0].array();
        } else if (arguments.length === 6) {
          source = Array.prototype.slice.call(arguments);
        } else if (arguments.length === 1 && arguments[0] instanceof Array) {
          source = arguments[0];
        }
        var result = [0, 0, source[2],
                      0, 0, source[5]];
        result[2] = source[2] + this.elements[2] * source[0] + this.elements[5] * source[1];
        result[5] = source[5] + this.elements[2] * source[3] + this.elements[5] * source[4];
        result[0] = this.elements[0] * source[0] + this.elements[3] * source[1];
        result[3] = this.elements[0] * source[3] + this.elements[3] * source[4];
        result[1] = this.elements[1] * source[0] + this.elements[4] * source[1];
        result[4] = this.elements[1] * source[3] + this.elements[4] * source[4];
        this.elements = result.slice();
      },
      /**
       * @member PMatrix2D
       * The rotate() function rotates the matrix.
       *
       * @param {float} angle         the angle of rotation in radiants
       */
      rotate: function(angle) {
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        var temp1 = this.elements[0];
        var temp2 = this.elements[1];
        this.elements[0] =  c * temp1 + s * temp2;
        this.elements[1] = -s * temp1 + c * temp2;
        temp1 = this.elements[3];
        temp2 = this.elements[4];
        this.elements[3] =  c * temp1 + s * temp2;
        this.elements[4] = -s * temp1 + c * temp2;
      },
      /**
       * @member PMatrix2D
       * The rotateZ() function rotates the matrix.
       *
       * @param {float} angle         the angle of rotation in radiants
       */
      rotateZ: function(angle) {
        this.rotate(angle);
      },
      /**
       * @member PMatrix2D
       * The invRotateZ() function rotates the matrix in opposite direction.
       *
       * @param {float} angle         the angle of rotation in radiants
       */
      invRotateZ: function(angle) {
        this.rotateZ(angle - Math.PI);
      },
      /**
       * @member PMatrix2D
       * The print() function prints out the elements of this matrix
       */
      print: function() {
        var digits = printMatrixHelper(this.elements);
        var output = "" + p.nfs(this.elements[0], digits, 4) + " " +
                     p.nfs(this.elements[1], digits, 4) + " " +
                     p.nfs(this.elements[2], digits, 4) + "\n" +
                     p.nfs(this.elements[3], digits, 4) + " " +
                     p.nfs(this.elements[4], digits, 4) + " " +
                     p.nfs(this.elements[5], digits, 4) + "\n\n";
        p.println(output);
      }
    };

    /**
     * PMatrix3D is a 4x4  matrix implementation. The constructor accepts another PMatrix3D or a list of six or sixteen float elements.
     * If no parameters are provided the matrix is set to the identity matrix.
     */
    var PMatrix3D = p.PMatrix3D = function() {
      // When a matrix is created, it is set to an identity matrix
      this.reset();
    };
    /**
     * PMatrix3D methods
     */
    PMatrix3D.prototype = {
      /**
       * @member PMatrix2D
       * The set() function sets the matrix elements. The function accepts either another PMatrix3D, an array of elements, or a list of six or sixteen floats.
       *
       * @param {PMatrix3D} matrix    the initial matrix to set to
       * @param {float[]} elements    an array of elements to set this matrix to
       * @param {float} m00           the first element of the matrix
       * @param {float} m01           the second element of the matrix
       * @param {float} m02           the third element of the matrix
       * @param {float} m03           the fourth element of the matrix
       * @param {float} m10           the fifth element of the matrix
       * @param {float} m11           the sixth element of the matrix
       * @param {float} m12           the seventh element of the matrix
       * @param {float} m13           the eight element of the matrix
       * @param {float} m20           the nineth element of the matrix
       * @param {float} m21           the tenth element of the matrix
       * @param {float} m22           the eleventh element of the matrix
       * @param {float} m23           the twelveth element of the matrix
       * @param {float} m30           the thirteenth element of the matrix
       * @param {float} m31           the fourtheenth element of the matrix
       * @param {float} m32           the fivetheenth element of the matrix
       * @param {float} m33           the sixteenth element of the matrix
       */
      set: function() {
        if (arguments.length === 16) {
          this.elements = Array.prototype.slice.call(arguments);
        } else if (arguments.length === 1 && arguments[0] instanceof PMatrix3D) {
          this.elements = arguments[0].array();
        } else if (arguments.length === 1 && arguments[0] instanceof Array) {
          this.elements = arguments[0].slice();
        }
      },
      /**
       * @member PMatrix3D
       * The get() function returns a copy of this PMatrix3D.
       *
       * @return {PMatrix3D} a copy of this PMatrix3D
       */
      get: function() {
        var outgoing = new PMatrix3D();
        outgoing.set(this.elements);
        return outgoing;
      },
      /**
       * @member PMatrix3D
       * The reset() function sets this PMatrix3D to the identity matrix.
       */
      reset: function() {
        this.elements = [1,0,0,0,
                         0,1,0,0,
                         0,0,1,0,
                         0,0,0,1];
      },
      /**
       * @member PMatrix3D
       * The array() function returns a copy of the element values.
       * @addon
       *
       * @return {float[]} returns a copy of the element values
       */
      array: function array() {
        return this.elements.slice();
      },
      /**
       * @member PMatrix3D
       * The translate() function translates this matrix by moving the current coordinates to the location specified by tx, ty, and tz.
       *
       * @param {float} tx  the x-axis coordinate to move to
       * @param {float} ty  the y-axis coordinate to move to
       * @param {float} tz  the z-axis coordinate to move to
       */
      translate: function(tx, ty, tz) {
        if (tz === undef) {
          tz = 0;
        }

        this.elements[3]  += tx * this.elements[0]  + ty * this.elements[1]  + tz * this.elements[2];
        this.elements[7]  += tx * this.elements[4]  + ty * this.elements[5]  + tz * this.elements[6];
        this.elements[11] += tx * this.elements[8]  + ty * this.elements[9]  + tz * this.elements[10];
        this.elements[15] += tx * this.elements[12] + ty * this.elements[13] + tz * this.elements[14];
      },
      /**
       * @member PMatrix3D
       * The transpose() function transpose this matrix.
       */
      transpose: function() {
        var temp = this.elements[4];
        this.elements[4] = this.elements[1];
        this.elements[1] = temp;

        temp = this.elements[8];
        this.elements[8] = this.elements[2];
        this.elements[2] = temp;

        temp = this.elements[6];
        this.elements[6] = this.elements[9];
        this.elements[9] = temp;

        temp = this.elements[3];
        this.elements[3] = this.elements[12];
        this.elements[12] = temp;

        temp = this.elements[7];
        this.elements[7] = this.elements[13];
        this.elements[13] = temp;

        temp = this.elements[11];
        this.elements[11] = this.elements[14];
        this.elements[14] = temp;
      },
      /**
       * @member PMatrix3D
       * The mult() function multiplied this matrix.
       * If two array elements are passed in the function will multiply a two element vector against this matrix.
       * If target is null or not length four, a new float array will be returned.
       * The values for vec and target can be the same (though that's less efficient).
       * If two PVectors are passed in the function multiply the x and y coordinates of a PVector against this matrix.
       *
       * @param {PVector} source, target  the PVectors used to multiply this matrix
       * @param {float[]} source, target  the arrays used to multiply this matrix
       *
       * @return {PVector|float[]} returns a PVector or an array representing the new matrix
       */
      mult: function(source, target) {
        var x, y, z, w;
        if (source instanceof PVector) {
          x = source.x;
          y = source.y;
          z = source.z;
          w = 1;
          if (!target) {
            target = new PVector();
          }
        } else if (source instanceof Array) {
          x = source[0];
          y = source[1];
          z = source[2];
          w = source[3] || 1;

          if ( !target || (target.length !== 3 && target.length !== 4) ) {
            target = [0, 0, 0];
          }
        }

        if (target instanceof Array) {
          if (target.length === 3) {
            target[0] = this.elements[0] * x + this.elements[1] * y + this.elements[2] * z + this.elements[3];
            target[1] = this.elements[4] * x + this.elements[5] * y + this.elements[6] * z + this.elements[7];
            target[2] = this.elements[8] * x + this.elements[9] * y + this.elements[10] * z + this.elements[11];
          } else if (target.length === 4) {
            target[0] = this.elements[0] * x + this.elements[1] * y + this.elements[2] * z + this.elements[3] * w;
            target[1] = this.elements[4] * x + this.elements[5] * y + this.elements[6] * z + this.elements[7] * w;
            target[2] = this.elements[8] * x + this.elements[9] * y + this.elements[10] * z + this.elements[11] * w;
            target[3] = this.elements[12] * x + this.elements[13] * y + this.elements[14] * z + this.elements[15] * w;
          }
        }
        if (target instanceof PVector) {
          target.x = this.elements[0] * x + this.elements[1] * y + this.elements[2] * z + this.elements[3];
          target.y = this.elements[4] * x + this.elements[5] * y + this.elements[6] * z + this.elements[7];
          target.z = this.elements[8] * x + this.elements[9] * y + this.elements[10] * z + this.elements[11];
        }
        return target;
      },
      /**
       * @member PMatrix3D
       * The preApply() function applies another matrix to the left of this one. Note that either a PMatrix3D or elements of a matrix can be passed in.
       *
       * @param {PMatrix3D} matrix    the matrix to apply this matrix to
       * @param {float} m00           the first element of the matrix
       * @param {float} m01           the second element of the matrix
       * @param {float} m02           the third element of the matrix
       * @param {float} m03           the fourth element of the matrix
       * @param {float} m10           the fifth element of the matrix
       * @param {float} m11           the sixth element of the matrix
       * @param {float} m12           the seventh element of the matrix
       * @param {float} m13           the eight element of the matrix
       * @param {float} m20           the nineth element of the matrix
       * @param {float} m21           the tenth element of the matrix
       * @param {float} m22           the eleventh element of the matrix
       * @param {float} m23           the twelveth element of the matrix
       * @param {float} m30           the thirteenth element of the matrix
       * @param {float} m31           the fourtheenth element of the matrix
       * @param {float} m32           the fivetheenth element of the matrix
       * @param {float} m33           the sixteenth element of the matrix
       */
      preApply: function() {
        var source;
        if (arguments.length === 1 && arguments[0] instanceof PMatrix3D) {
          source = arguments[0].array();
        } else if (arguments.length === 16) {
          source = Array.prototype.slice.call(arguments);
        } else if (arguments.length === 1 && arguments[0] instanceof Array) {
          source = arguments[0];
        }

        var result = [0, 0, 0, 0,
                      0, 0, 0, 0,
                      0, 0, 0, 0,
                      0, 0, 0, 0];
        var e = 0;
        for (var row = 0; row < 4; row++) {
          for (var col = 0; col < 4; col++, e++) {
            result[e] += this.elements[col + 0] * source[row * 4 + 0] + this.elements[col + 4] *
                         source[row * 4 + 1] + this.elements[col + 8] * source[row * 4 + 2] +
                         this.elements[col + 12] * source[row * 4 + 3];
          }
        }
        this.elements = result.slice();
      },
      /**
       * @member PMatrix3D
       * The apply() function multiplies the current matrix by the one specified through the parameters. Note that either a PMatrix3D or a list of floats can be passed in.
       *
       * @param {PMatrix3D} matrix    the matrix to apply this matrix to
       * @param {float} m00           the first element of the matrix
       * @param {float} m01           the second element of the matrix
       * @param {float} m02           the third element of the matrix
       * @param {float} m03           the fourth element of the matrix
       * @param {float} m10           the fifth element of the matrix
       * @param {float} m11           the sixth element of the matrix
       * @param {float} m12           the seventh element of the matrix
       * @param {float} m13           the eight element of the matrix
       * @param {float} m20           the nineth element of the matrix
       * @param {float} m21           the tenth element of the matrix
       * @param {float} m22           the eleventh element of the matrix
       * @param {float} m23           the twelveth element of the matrix
       * @param {float} m30           the thirteenth element of the matrix
       * @param {float} m31           the fourtheenth element of the matrix
       * @param {float} m32           the fivetheenth element of the matrix
       * @param {float} m33           the sixteenth element of the matrix
       */
      apply: function() {
        var source;
        if (arguments.length === 1 && arguments[0] instanceof PMatrix3D) {
          source = arguments[0].array();
        } else if (arguments.length === 16) {
          source = Array.prototype.slice.call(arguments);
        } else if (arguments.length === 1 && arguments[0] instanceof Array) {
          source = arguments[0];
        }

        var result = [0, 0, 0, 0,
                      0, 0, 0, 0,
                      0, 0, 0, 0,
                      0, 0, 0, 0];
        var e = 0;
        for (var row = 0; row < 4; row++) {
          for (var col = 0; col < 4; col++, e++) {
            result[e] += this.elements[row * 4 + 0] * source[col + 0] + this.elements[row * 4 + 1] *
                         source[col + 4] + this.elements[row * 4 + 2] * source[col + 8] +
                         this.elements[row * 4 + 3] * source[col + 12];
          }
        }
        this.elements = result.slice();
      },
      /**
       * @member PMatrix3D
       * The rotate() function rotates the matrix.
       *
       * @param {float} angle         the angle of rotation in radiants
       */
      rotate: function(angle, v0, v1, v2) {
        if (arguments.length < 4) {
          this.rotateZ(angle);
        } else {
          var v = new PVector(v0, v1, v2);
          var m = v.mag();
          if (m === 0) {
            return;
          } else if (m != 1) {
            v.normalize();
            v0 = v.x;
            v1 = v.y;
            v2 = v.z;
          }
          var c = p.cos(angle);
          var s = p.sin(angle);
          var t = 1.0 - c;

          this.apply((t * v0 * v0) + c,
                     (t * v0 * v1) - (s * v2),
                     (t * v0 * v2) + (s * v1),
                     0,
                     (t * v0 * v1) + (s * v2),
                     (t * v1 * v1) + c,
                     (t * v1 * v2) - (s * v0),
                     0,
                     (t * v0 * v2) - (s * v1),
                     (t * v1 * v2) + (s * v0),
                     (t * v2 * v2) + c,
                     0,
                     0, 0, 0, 1);
        }
      },
      /**
       * @member PMatrix3D
       * The invApply() function applies the inverted matrix to this matrix.
       *
       * @param {float} m00           the first element of the matrix
       * @param {float} m01           the second element of the matrix
       * @param {float} m02           the third element of the matrix
       * @param {float} m03           the fourth element of the matrix
       * @param {float} m10           the fifth element of the matrix
       * @param {float} m11           the sixth element of the matrix
       * @param {float} m12           the seventh element of the matrix
       * @param {float} m13           the eight element of the matrix
       * @param {float} m20           the nineth element of the matrix
       * @param {float} m21           the tenth element of the matrix
       * @param {float} m22           the eleventh element of the matrix
       * @param {float} m23           the twelveth element of the matrix
       * @param {float} m30           the thirteenth element of the matrix
       * @param {float} m31           the fourtheenth element of the matrix
       * @param {float} m32           the fivetheenth element of the matrix
       * @param {float} m33           the sixteenth element of the matrix
       *
       * @return {boolean} returns true if the operation was successful.
       */
      invApply: function() {
        if (inverseCopy === undef) {
          inverseCopy = new PMatrix3D();
        }
        var a = arguments;
        inverseCopy.set(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8],
                        a[9], a[10], a[11], a[12], a[13], a[14], a[15]);

        if (!inverseCopy.invert()) {
          return false;
        }
        this.preApply(inverseCopy);
        return true;
      },
      /**
       * @member PMatrix3D
       * The rotateZ() function rotates the matrix.
       *
       * @param {float} angle         the angle of rotation in radiants
       */
      rotateX: function(angle) {
        var c = p.cos(angle);
        var s = p.sin(angle);
        this.apply([1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1]);
      },
      /**
       * @member PMatrix3D
       * The rotateY() function rotates the matrix.
       *
       * @param {float} angle         the angle of rotation in radiants
       */
      rotateY: function(angle) {
        var c = p.cos(angle);
        var s = p.sin(angle);
        this.apply([c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1]);
      },
      /**
       * @member PMatrix3D
       * The rotateZ() function rotates the matrix.
       *
       * @param {float} angle         the angle of rotation in radiants
       */
      rotateZ: function(angle) {
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        this.apply([c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
      },
      /**
       * @member PMatrix3D
       * The scale() function increases or decreases the size of a matrix by expanding and contracting vertices. When only one parameter is specified scale will occur in all dimensions.
       * This is equivalent to a three parameter call.
       *
       * @param {float} sx  the amount to scale on the x-axis
       * @param {float} sy  the amount to scale on the y-axis
       * @param {float} sz  the amount to scale on the z-axis
       */
      scale: function(sx, sy, sz) {
        if (sx && !sy && !sz) {
          sy = sz = sx;
        } else if (sx && sy && !sz) {
          sz = 1;
        }

        if (sx && sy && sz) {
          this.elements[0]  *= sx;
          this.elements[1]  *= sy;
          this.elements[2]  *= sz;
          this.elements[4]  *= sx;
          this.elements[5]  *= sy;
          this.elements[6]  *= sz;
          this.elements[8]  *= sx;
          this.elements[9]  *= sy;
          this.elements[10] *= sz;
          this.elements[12] *= sx;
          this.elements[13] *= sy;
          this.elements[14] *= sz;
        }
      },
      /**
       * @member PMatrix3D
       * The skewX() function skews the matrix along the x-axis the amount specified by the angle parameter.
       * Angles should be specified in radians (values from 0 to PI*2) or converted to radians with the <b>radians()</b> function.
       *
       * @param {float} angle  angle of skew specified in radians
       */
      skewX: function(angle) {
        var t = Math.tan(angle);
        this.apply(1, t, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
      },
      /**
       * @member PMatrix3D
       * The skewY() function skews the matrix along the y-axis the amount specified by the angle parameter.
       * Angles should be specified in radians (values from 0 to PI*2) or converted to radians with the <b>radians()</b> function.
       *
       * @param {float} angle  angle of skew specified in radians
       */
      skewY: function(angle) {
        var t = Math.tan(angle);
        this.apply(1, 0, 0, 0, t, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
      },
      /**
       * @member PMatrix3D
       * The shearX() function shears the matrix along the x-axis the amount specified by the angle parameter.
       * Angles should be specified in radians (values from 0 to PI*2) or converted to radians with the <b>radians()</b> function.
       *
       * @param {float} angle  angle of shear specified in radians
       */
      shearX: function(angle) {
        var t = Math.tan(angle);
        this.apply(1, t, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
      },
      /**
       * @member PMatrix3D
       * The shearY() function shears the matrix along the y-axis the amount specified by the angle parameter.
       * Angles should be specified in radians (values from 0 to PI*2) or converted to radians with the <b>radians()</b> function.
       *
       * @param {float} angle  angle of shear specified in radians
       */
      shearY: function(angle) {
        var t = Math.tan(angle);
        this.apply(1, 0, 0, 0, t, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
      },
      multX: function(x, y, z, w) {
        if (!z) {
          return this.elements[0] * x + this.elements[1] * y + this.elements[3];
        }
        if (!w) {
          return this.elements[0] * x + this.elements[1] * y + this.elements[2] * z + this.elements[3];
        }
        return this.elements[0] * x + this.elements[1] * y + this.elements[2] * z + this.elements[3] * w;
      },
      multY: function(x, y, z, w) {
        if (!z) {
          return this.elements[4] * x + this.elements[5] * y + this.elements[7];
        }
        if (!w) {
          return this.elements[4] * x + this.elements[5] * y + this.elements[6] * z + this.elements[7];
        }
        return this.elements[4] * x + this.elements[5] * y + this.elements[6] * z + this.elements[7] * w;
      },
      multZ: function(x, y, z, w) {
        if (!w) {
          return this.elements[8] * x + this.elements[9] * y + this.elements[10] * z + this.elements[11];
        }
        return this.elements[8] * x + this.elements[9] * y + this.elements[10] * z + this.elements[11] * w;
      },
      multW: function(x, y, z, w) {
        if (!w) {
          return this.elements[12] * x + this.elements[13] * y + this.elements[14] * z + this.elements[15];
        }
        return this.elements[12] * x + this.elements[13] * y + this.elements[14] * z + this.elements[15] * w;
      },
      /**
       * @member PMatrix3D
       * The invert() function inverts this matrix
       *
       * @return {boolean} true if successful
       */
      invert: function() {
        var fA0 = this.elements[0] * this.elements[5] - this.elements[1] * this.elements[4];
        var fA1 = this.elements[0] * this.elements[6] - this.elements[2] * this.elements[4];
        var fA2 = this.elements[0] * this.elements[7] - this.elements[3] * this.elements[4];
        var fA3 = this.elements[1] * this.elements[6] - this.elements[2] * this.elements[5];
        var fA4 = this.elements[1] * this.elements[7] - this.elements[3] * this.elements[5];
        var fA5 = this.elements[2] * this.elements[7] - this.elements[3] * this.elements[6];
        var fB0 = this.elements[8] * this.elements[13] - this.elements[9] * this.elements[12];
        var fB1 = this.elements[8] * this.elements[14] - this.elements[10] * this.elements[12];
        var fB2 = this.elements[8] * this.elements[15] - this.elements[11] * this.elements[12];
        var fB3 = this.elements[9] * this.elements[14] - this.elements[10] * this.elements[13];
        var fB4 = this.elements[9] * this.elements[15] - this.elements[11] * this.elements[13];
        var fB5 = this.elements[10] * this.elements[15] - this.elements[11] * this.elements[14];

        // Determinant
        var fDet = fA0 * fB5 - fA1 * fB4 + fA2 * fB3 + fA3 * fB2 - fA4 * fB1 + fA5 * fB0;

        // Account for a very small value
        // return false if not successful.
        if (Math.abs(fDet) <= 1e-9) {
          return false;
        }

        var kInv = [];
        kInv[0]  = +this.elements[5] * fB5 - this.elements[6] * fB4 + this.elements[7] * fB3;
        kInv[4]  = -this.elements[4] * fB5 + this.elements[6] * fB2 - this.elements[7] * fB1;
        kInv[8]  = +this.elements[4] * fB4 - this.elements[5] * fB2 + this.elements[7] * fB0;
        kInv[12] = -this.elements[4] * fB3 + this.elements[5] * fB1 - this.elements[6] * fB0;
        kInv[1]  = -this.elements[1] * fB5 + this.elements[2] * fB4 - this.elements[3] * fB3;
        kInv[5]  = +this.elements[0] * fB5 - this.elements[2] * fB2 + this.elements[3] * fB1;
        kInv[9]  = -this.elements[0] * fB4 + this.elements[1] * fB2 - this.elements[3] * fB0;
        kInv[13] = +this.elements[0] * fB3 - this.elements[1] * fB1 + this.elements[2] * fB0;
        kInv[2]  = +this.elements[13] * fA5 - this.elements[14] * fA4 + this.elements[15] * fA3;
        kInv[6]  = -this.elements[12] * fA5 + this.elements[14] * fA2 - this.elements[15] * fA1;
        kInv[10] = +this.elements[12] * fA4 - this.elements[13] * fA2 + this.elements[15] * fA0;
        kInv[14] = -this.elements[12] * fA3 + this.elements[13] * fA1 - this.elements[14] * fA0;
        kInv[3]  = -this.elements[9] * fA5 + this.elements[10] * fA4 - this.elements[11] * fA3;
        kInv[7]  = +this.elements[8] * fA5 - this.elements[10] * fA2 + this.elements[11] * fA1;
        kInv[11] = -this.elements[8] * fA4 + this.elements[9] * fA2 - this.elements[11] * fA0;
        kInv[15] = +this.elements[8] * fA3 - this.elements[9] * fA1 + this.elements[10] * fA0;

        // Inverse using Determinant
        var fInvDet = 1.0 / fDet;
        kInv[0]  *= fInvDet;
        kInv[1]  *= fInvDet;
        kInv[2]  *= fInvDet;
        kInv[3]  *= fInvDet;
        kInv[4]  *= fInvDet;
        kInv[5]  *= fInvDet;
        kInv[6]  *= fInvDet;
        kInv[7]  *= fInvDet;
        kInv[8]  *= fInvDet;
        kInv[9]  *= fInvDet;
        kInv[10] *= fInvDet;
        kInv[11] *= fInvDet;
        kInv[12] *= fInvDet;
        kInv[13] *= fInvDet;
        kInv[14] *= fInvDet;
        kInv[15] *= fInvDet;

        this.elements = kInv.slice();
        return true;
      },
      toString: function() {
        var str = "";
        for (var i = 0; i < 15; i++) {
          str += this.elements[i] + ", ";
        }
        str += this.elements[15];
        return str;
      },
      /**
       * @member PMatrix3D
       * The print() function prints out the elements of this matrix
       */
      print: function() {
        var digits = printMatrixHelper(this.elements);

        var output = "" + p.nfs(this.elements[0], digits, 4) + " " + p.nfs(this.elements[1], digits, 4) +
                     " " + p.nfs(this.elements[2], digits, 4) + " " + p.nfs(this.elements[3], digits, 4) +
                     "\n" + p.nfs(this.elements[4], digits, 4) + " " + p.nfs(this.elements[5], digits, 4) +
                     " " + p.nfs(this.elements[6], digits, 4) + " " + p.nfs(this.elements[7], digits, 4) +
                     "\n" + p.nfs(this.elements[8], digits, 4) + " " + p.nfs(this.elements[9], digits, 4) +
                     " " + p.nfs(this.elements[10], digits, 4) + " " + p.nfs(this.elements[11], digits, 4) +
                     "\n" + p.nfs(this.elements[12], digits, 4) + " " + p.nfs(this.elements[13], digits, 4) +
                     " " + p.nfs(this.elements[14], digits, 4) + " " + p.nfs(this.elements[15], digits, 4) + "\n\n";
        p.println(output);
      },
      invTranslate: function(tx, ty, tz) {
        this.preApply(1, 0, 0, -tx, 0, 1, 0, -ty, 0, 0, 1, -tz, 0, 0, 0, 1);
      },
      invRotateX: function(angle) {
        var c = Math.cos(-angle);
        var s = Math.sin(-angle);
        this.preApply([1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1]);
      },
      invRotateY: function(angle) {
        var c = Math.cos(-angle);
        var s = Math.sin(-angle);
        this.preApply([c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1]);
      },
      invRotateZ: function(angle) {
        var c = Math.cos(-angle);
        var s = Math.sin(-angle);
        this.preApply([c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
      },
      invScale: function(x, y, z) {
        this.preApply([1 / x, 0, 0, 0, 0, 1 / y, 0, 0, 0, 0, 1 / z, 0, 0, 0, 0, 1]);
      }
    };

    /**
     * @private
     * The matrix stack stores the transformations and translations that occur within the space.
     */
    var PMatrixStack = p.PMatrixStack = function() {
      this.matrixStack = [];
    };

    /**
     * @member PMatrixStack
     * load pushes the matrix given in the function into the stack
     *
     * @param {Object | Array} matrix the matrix to be pushed into the stack
     */
    PMatrixStack.prototype.load = function() {
      var tmpMatrix = drawing.$newPMatrix();

      if (arguments.length === 1) {
        tmpMatrix.set(arguments[0]);
      } else {
        tmpMatrix.set(arguments);
      }
      this.matrixStack.push(tmpMatrix);
    };

    Drawing2D.prototype.$newPMatrix = function() {
      return new PMatrix2D();
    };

    Drawing3D.prototype.$newPMatrix = function() {
      return new PMatrix3D();
    };

    /**
     * @member PMatrixStack
     * push adds a duplicate of the top of the stack onto the stack - uses the peek function
     */
    PMatrixStack.prototype.push = function() {
      this.matrixStack.push(this.peek());
    };

    /**
     * @member PMatrixStack
     * pop removes returns the matrix at the top of the stack
     *
     * @returns {Object} the matrix at the top of the stack
     */
    PMatrixStack.prototype.pop = function() {
      return this.matrixStack.pop();
    };

    /**
     * @member PMatrixStack
     * peek returns but doesn't remove the matrix at the top of the stack
     *
     * @returns {Object} the matrix at the top of the stack
     */
    PMatrixStack.prototype.peek = function() {
      var tmpMatrix = drawing.$newPMatrix();

      tmpMatrix.set(this.matrixStack[this.matrixStack.length - 1]);
      return tmpMatrix;
    };

    /**
     * @member PMatrixStack
     * this function multiplies the matrix at the top of the stack with the matrix given as a parameter
     *
     * @param {Object | Array} matrix the matrix to be multiplied into the stack
     */
    PMatrixStack.prototype.mult = function(matrix) {
      this.matrixStack[this.matrixStack.length - 1].apply(matrix);
    };

    ////////////////////////////////////////////////////////////////////////////
    // Array handling
    ////////////////////////////////////////////////////////////////////////////

    /**
    * The split() function breaks a string into pieces using a character or string
    * as the divider. The delim  parameter specifies the character or characters that
    * mark the boundaries between each piece. A String[] array is returned that contains
    * each of the pieces.
    * If the result is a set of numbers, you can convert the String[] array to to a float[]
    * or int[] array using the datatype conversion functions int() and float() (see example above).
    * The splitTokens() function works in a similar fashion, except that it splits using a range
    * of characters instead of a specific character or sequence.
    *
    * @param {String} str       the String to be split
    * @param {String} delim     the character or String used to separate the data
    *
    * @returns {string[]} The new string array
    *
    * @see splitTokens
    * @see join
    * @see trim
    */
    p.split = function(str, delim) {
      return str.split(delim);
    };

    /**
    * The splitTokens() function splits a String at one or many character "tokens." The tokens
    * parameter specifies the character or characters to be used as a boundary.
    * If no tokens character is specified, any whitespace character is used to split.
    * Whitespace characters include tab (\t), line feed (\n), carriage return (\r), form
    * feed (\f), and space. To convert a String to an array of integers or floats, use the
    * datatype conversion functions int() and float() to convert the array of Strings.
    *
    * @param {String} str       the String to be split
    * @param {Char[]} tokens    list of individual characters that will be used as separators
    *
    * @returns {string[]} The new string array
    *
    * @see split
    * @see join
    * @see trim
    */
    p.splitTokens = function(str, tokens) {
      if (tokens === undef) {
        return str.split(/\s+/g);
      }

      var chars = tokens.split(/()/g),
          buffer = "",
          len = str.length,
          i, c,
          tokenized = [];

      for (i = 0; i < len; i++) {
        c = str[i];
        if (chars.indexOf(c) > -1) {
          if (buffer !== "") {
            tokenized.push(buffer);
          }
          buffer = "";
        } else {
          buffer += c;
        }
      }

      if (buffer !== "") {
        tokenized.push(buffer);
      }

      return tokenized;
    };

    /**
    * Expands an array by one element and adds data to the new position. The datatype of
    * the element parameter must be the same as the datatype of the array.
    * When using an array of objects, the data returned from the function must be cast to
    * the object array's data type. For example: SomeClass[] items = (SomeClass[])
    * append(originalArray, element).
    *
    * @param {boolean[]|byte[]|char[]|int[]|float[]|String[]|array of objects} array boolean[],
    * byte[], char[], int[], float[], or String[], or an array of objects
    * @param {boolean[]|byte[]|char[]|int[]|float[]|String[]|array of objects} element new data for the array
    *
    * @returns Array (the same datatype as the input)
    *
    * @see shorten
    * @see expand
    */
    p.append = function(array, element) {
      array[array.length] = element;
      return array;
    };

    /**
    * Concatenates two arrays. For example, concatenating the array { 1, 2, 3 } and the
    * array { 4, 5, 6 } yields { 1, 2, 3, 4, 5, 6 }. Both parameters must be arrays of the
    * same datatype.
    * When using an array of objects, the data returned from the function must be cast to the
    * object array's data type. For example: SomeClass[] items = (SomeClass[]) concat(array1, array2).
    *
    * @param {boolean[]|byte[]|char[]|int[]|float[]|String[]|array of objects} array1 boolean[],
    * byte[], char[], int[], float[], String[], or an array of objects
    * @param {boolean[]|byte[]|char[]|int[]|float[]|String[]|array of objects} array2 boolean[],
    * byte[], char[], int[], float[], String[], or an array of objects
    *
    * @returns Array (the same datatype as the input)
    *
    * @see splice
    */
    p.concat = function(array1, array2) {
      return array1.concat(array2);
    };

    /**
     * Sorts an array of numbers from smallest to largest and puts an array of
     * words in alphabetical order. The original array is not modified, a
     * re-ordered array is returned. The count parameter states the number of
     * elements to sort. For example if there are 12 elements in an array and
     * if count is the value 5, only the first five elements on the array will
     * be sorted. Alphabetical ordering is case insensitive.
     *
     * @param {String[] | int[] | float[]}  array Array of elements to sort
     * @param {int}                         numElem Number of elements to sort
     *
     * @returns {String[] | int[] | float[]} Array (same datatype as the input)
     *
     * @see reverse
    */
    p.sort = function(array, numElem) {
      var ret = [];

      // depending on the type used (int, float) or string
      // we'll need to use a different compare function
      if (array.length > 0) {
        // copy since we need to return another array
        var elemsToCopy = numElem > 0 ? numElem : array.length;
        for (var i = 0; i < elemsToCopy; i++) {
          ret.push(array[i]);
        }
        if (typeof array[0] === "string") {
          ret.sort();
        }
        // int or float
        else {
          ret.sort(function(a, b) {
            return a - b;
          });
        }

        // copy on the rest of the elements that were not sorted in case the user
        // only wanted a subset of an array to be sorted.
        if (numElem > 0) {
          for (var j = ret.length; j < array.length; j++) {
            ret.push(array[j]);
          }
        }
      }
      return ret;
    };

    /**
    * Inserts a value or array of values into an existing array. The first two parameters must
    * be of the same datatype. The array parameter defines the array which will be modified
    * and the second parameter defines the data which will be inserted. When using an array
    * of objects, the data returned from the function must be cast to the object array's data
    * type. For example: SomeClass[] items = (SomeClass[]) splice(array1, array2, index).
    *
    * @param {boolean[]|byte[]|char[]|int[]|float[]|String[]|array of objects} array boolean[],
    * byte[], char[], int[], float[], String[], or an array of objects
    * @param {boolean|byte|char|int|float|String|boolean[]|byte[]|char[]|int[]|float[]|String[]|array of objects}
    * value boolean, byte, char, int, float, String, boolean[], byte[], char[], int[],
    * float[], String[], or other Object: value or an array of objects to be spliced in
    * @param {int} index                position in the array from which to insert data
    *
    * @returns Array (the same datatype as the input)
    *
    * @see contract
    * @see subset
    */
    p.splice = function(array, value, index) {

      // Trying to splice an empty array into "array" in P5 won't do
      // anything, just return the original.
      if(value.length === 0)
      {
        return array;
      }

      // If the second argument was an array, we'll need to iterate over all
      // the "value" elements and add one by one because
      // array.splice(index, 0, value);
      // would create a multi-dimensional array which isn't what we want.
      if(value instanceof Array) {
        for(var i = 0, j = index; i < value.length; j++,i++) {
          array.splice(j, 0, value[i]);
        }
      } else {
        array.splice(index, 0, value);
      }

      return array;
    };

    /**
    * Extracts an array of elements from an existing array. The array parameter defines the
    * array from which the elements will be copied and the offset and length parameters determine
    * which elements to extract. If no length is given, elements will be extracted from the offset
    * to the end of the array. When specifying the offset remember the first array element is 0.
    * This function does not change the source array.
    * When using an array of objects, the data returned from the function must be cast to the
    * object array's data type.
    *
    * @param {boolean[]|byte[]|char[]|int[]|float[]|String[]|array of objects} array boolean[],
    * byte[], char[], int[], float[], String[], or an array of objects
    * @param {int} offset         position to begin
    * @param {int} length         number of values to extract
    *
    * @returns Array (the same datatype as the input)
    *
    * @see splice
    */
    p.subset = function(array, offset, length) {
      var end = (length !== undef) ? offset + length : array.length;
      return array.slice(offset, end);
    };

    /**
    * Combines an array of Strings into one String, each separated by the character(s) used for
    * the separator parameter. To join arrays of ints or floats, it's necessary to first convert
    * them to strings using nf() or nfs().
    *
    * @param {Array} array              array of Strings
    * @param {char|String} separator    char or String to be placed between each item
    *
    * @returns {String} The combined string
    *
    * @see split
    * @see trim
    * @see nf
    * @see nfs
    */
    p.join = function(array, seperator) {
      return array.join(seperator);
    };

    /**
    * Decreases an array by one element and returns the shortened array. When using an
    * array of objects, the data returned from the function must be cast to the object array's
    * data type. For example: SomeClass[] items = (SomeClass[]) shorten(originalArray).
    *
    * @param {boolean[]|byte[]|char[]|int[]|float[]|String[]|array of objects} array
    * boolean[], byte[], char[], int[], float[], or String[], or an array of objects
    *
    * @returns Array (the same datatype as the input)
    *
    * @see append
    * @see expand
    */
    p.shorten = function(ary) {
      var newary = [];

      // copy array into new array
      var len = ary.length;
      for (var i = 0; i < len; i++) {
        newary[i] = ary[i];
      }
      newary.pop();

      return newary;
    };

    /**
    * Increases the size of an array. By default, this function doubles the size of the array,
    * but the optional newSize parameter provides precise control over the increase in size.
    * When using an array of objects, the data returned from the function must be cast to the
    * object array's data type. For example: SomeClass[] items = (SomeClass[]) expand(originalArray).
    *
    * @param {boolean[]|byte[]|char[]|int[]|float[]|String[]|array of objects} ary
    * boolean[], byte[], char[], int[], float[], String[], or an array of objects
    * @param {int} newSize              positive int: new size for the array
    *
    * @returns Array (the same datatype as the input)
    *
    * @see contract
    */
    p.expand = function(ary, targetSize) {
      var temp = ary.slice(0),
          newSize = targetSize || ary.length * 2;
      temp.length = newSize;
      return temp;
    };

    /**
    * Copies an array (or part of an array) to another array. The src array is copied to the
    * dst array, beginning at the position specified by srcPos and into the position specified
    * by dstPos. The number of elements to copy is determined by length. The simplified version
    * with two arguments copies an entire array to another of the same size. It is equivalent
    * to "arrayCopy(src, 0, dst, 0, src.length)". This function is far more efficient for copying
    * array data than iterating through a for and copying each element.
    *
    * @param {Array} src an array of any data type: the source array
    * @param {Array} dest an array of any data type (as long as it's the same as src): the destination array
    * @param {int} srcPos     starting position in the source array
    * @param {int} destPos    starting position in the destination array
    * @param {int} length     number of array elements to be copied
    *
    * @returns none
    */
    p.arrayCopy = function() { // src, srcPos, dest, destPos, length) {
      var src, srcPos = 0, dest, destPos = 0, length;

      if (arguments.length === 2) {
        // recall itself and copy src to dest from start index 0 to 0 of src.length
        src = arguments[0];
        dest = arguments[1];
        length = src.length;
      } else if (arguments.length === 3) {
        // recall itself and copy src to dest from start index 0 to 0 of length
        src = arguments[0];
        dest = arguments[1];
        length = arguments[2];
      } else if (arguments.length === 5) {
        src = arguments[0];
        srcPos = arguments[1];
        dest = arguments[2];
        destPos = arguments[3];
        length = arguments[4];
      }

      // copy src to dest from index srcPos to index destPos of length recursivly on objects
      for (var i = srcPos, j = destPos; i < length + srcPos; i++, j++) {
        if (dest[j] !== undef) {
          dest[j] = src[i];
        } else {
          throw "array index out of bounds exception";
        }
      }
    };

    /**
    * Reverses the order of an array.
    *
    * @param {boolean[]|byte[]|char[]|int[]|float[]|String[]} array
    * boolean[], byte[], char[], int[], float[], or String[]
    *
    * @returns Array (the same datatype as the input)
    *
    * @see sort
    */
    p.reverse = function(array) {
      return array.reverse();
    };


    ////////////////////////////////////////////////////////////////////////////
    // Color functions
    ////////////////////////////////////////////////////////////////////////////

    // helper functions for internal blending modes
    p.mix = function(a, b, f) {
      return a + (((b - a) * f) >> 8);
    };

    p.peg = function(n) {
      return (n < 0) ? 0 : ((n > 255) ? 255 : n);
    };

    // blending modes
    /**
    * These are internal blending modes used for BlendColor()
    *
    * @param {Color} c1       First Color to blend
    * @param {Color} c2       Second Color to blend
    *
    * @returns {Color}        The blended Color
    *
    * @see BlendColor
    * @see Blend
    */
    p.modes = (function() {
      var ALPHA_MASK = PConstants.ALPHA_MASK,
        RED_MASK = PConstants.RED_MASK,
        GREEN_MASK = PConstants.GREEN_MASK,
        BLUE_MASK = PConstants.BLUE_MASK,
        min = Math.min,
        max = Math.max;

      function applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb) {
        var a = min(((c1 & 0xff000000) >>> 24) + f, 0xff) << 24;

        var r = (ar + (((cr - ar) * f) >> 8));
        r = ((r < 0) ? 0 : ((r > 255) ? 255 : r)) << 16;

        var g = (ag + (((cg - ag) * f) >> 8));
        g = ((g < 0) ? 0 : ((g > 255) ? 255 : g)) << 8;

        var b = ab + (((cb - ab) * f) >> 8);
        b = (b < 0) ? 0 : ((b > 255) ? 255 : b);

        return (a | r | g | b);
      }

      return {
        replace: function(c1, c2) {
          return c2;
        },
        blend: function(c1, c2) {
          var f = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK),
            ag = (c1 & GREEN_MASK),
            ab = (c1 & BLUE_MASK),
            br = (c2 & RED_MASK),
            bg = (c2 & GREEN_MASK),
            bb = (c2 & BLUE_MASK);

          return (min(((c1 & ALPHA_MASK) >>> 24) + f, 0xff) << 24 |
                  (ar + (((br - ar) * f) >> 8)) & RED_MASK |
                  (ag + (((bg - ag) * f) >> 8)) & GREEN_MASK |
                  (ab + (((bb - ab) * f) >> 8)) & BLUE_MASK);
        },
        add: function(c1, c2) {
          var f = (c2 & ALPHA_MASK) >>> 24;
          return (min(((c1 & ALPHA_MASK) >>> 24) + f, 0xff) << 24 |
                  min(((c1 & RED_MASK) + ((c2 & RED_MASK) >> 8) * f), RED_MASK) & RED_MASK |
                  min(((c1 & GREEN_MASK) + ((c2 & GREEN_MASK) >> 8) * f), GREEN_MASK) & GREEN_MASK |
                  min((c1 & BLUE_MASK) + (((c2 & BLUE_MASK) * f) >> 8), BLUE_MASK));
        },
        subtract: function(c1, c2) {
          var f = (c2 & ALPHA_MASK) >>> 24;
          return (min(((c1 & ALPHA_MASK) >>> 24) + f, 0xff) << 24 |
                  max(((c1 & RED_MASK) - ((c2 & RED_MASK) >> 8) * f), GREEN_MASK) & RED_MASK |
                  max(((c1 & GREEN_MASK) - ((c2 & GREEN_MASK) >> 8) * f), BLUE_MASK) & GREEN_MASK |
                  max((c1 & BLUE_MASK) - (((c2 & BLUE_MASK) * f) >> 8), 0));
        },
        lightest: function(c1, c2) {
          var f = (c2 & ALPHA_MASK) >>> 24;
          return (min(((c1 & ALPHA_MASK) >>> 24) + f, 0xff) << 24 |
                  max(c1 & RED_MASK, ((c2 & RED_MASK) >> 8) * f) & RED_MASK |
                  max(c1 & GREEN_MASK, ((c2 & GREEN_MASK) >> 8) * f) & GREEN_MASK |
                  max(c1 & BLUE_MASK, ((c2 & BLUE_MASK) * f) >> 8));
        },
        darkest: function(c1, c2) {
          var f = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK),
            ag = (c1 & GREEN_MASK),
            ab = (c1 & BLUE_MASK),
            br = min(c1 & RED_MASK, ((c2 & RED_MASK) >> 8) * f),
            bg = min(c1 & GREEN_MASK, ((c2 & GREEN_MASK) >> 8) * f),
            bb = min(c1 & BLUE_MASK, ((c2 & BLUE_MASK) * f) >> 8);

          return (min(((c1 & ALPHA_MASK) >>> 24) + f, 0xff) << 24 |
                  (ar + (((br - ar) * f) >> 8)) & RED_MASK |
                  (ag + (((bg - ag) * f) >> 8)) & GREEN_MASK |
                  (ab + (((bb - ab) * f) >> 8)) & BLUE_MASK);
        },
        difference: function(c1, c2) {
          var f  = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK) >> 16,
            ag = (c1 & GREEN_MASK) >> 8,
            ab = (c1 & BLUE_MASK),
            br = (c2 & RED_MASK) >> 16,
            bg = (c2 & GREEN_MASK) >> 8,
            bb = (c2 & BLUE_MASK),
            cr = (ar > br) ? (ar - br) : (br - ar),
            cg = (ag > bg) ? (ag - bg) : (bg - ag),
            cb = (ab > bb) ? (ab - bb) : (bb - ab);

          return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb);
        },
        exclusion: function(c1, c2) {
          var f  = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK) >> 16,
            ag = (c1 & GREEN_MASK) >> 8,
            ab = (c1 & BLUE_MASK),
            br = (c2 & RED_MASK) >> 16,
            bg = (c2 & GREEN_MASK) >> 8,
            bb = (c2 & BLUE_MASK),
            cr = ar + br - ((ar * br) >> 7),
            cg = ag + bg - ((ag * bg) >> 7),
            cb = ab + bb - ((ab * bb) >> 7);

          return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb);
        },
        multiply: function(c1, c2) {
          var f  = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK) >> 16,
            ag = (c1 & GREEN_MASK) >> 8,
            ab = (c1 & BLUE_MASK),
            br = (c2 & RED_MASK) >> 16,
            bg = (c2 & GREEN_MASK) >> 8,
            bb = (c2 & BLUE_MASK),
            cr = (ar * br) >> 8,
            cg = (ag * bg) >> 8,
            cb = (ab * bb) >> 8;

          return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb);
        },
        screen: function(c1, c2) {
          var f  = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK) >> 16,
            ag = (c1 & GREEN_MASK) >> 8,
            ab = (c1 & BLUE_MASK),
            br = (c2 & RED_MASK) >> 16,
            bg = (c2 & GREEN_MASK) >> 8,
            bb = (c2 & BLUE_MASK),
            cr = 255 - (((255 - ar) * (255 - br)) >> 8),
            cg = 255 - (((255 - ag) * (255 - bg)) >> 8),
            cb = 255 - (((255 - ab) * (255 - bb)) >> 8);

          return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb);
        },
        hard_light: function(c1, c2) {
          var f  = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK) >> 16,
            ag = (c1 & GREEN_MASK) >> 8,
            ab = (c1 & BLUE_MASK),
            br = (c2 & RED_MASK) >> 16,
            bg = (c2 & GREEN_MASK) >> 8,
            bb = (c2 & BLUE_MASK),
            cr = (br < 128) ? ((ar * br) >> 7) : (255 - (((255 - ar) * (255 - br)) >> 7)),
            cg = (bg < 128) ? ((ag * bg) >> 7) : (255 - (((255 - ag) * (255 - bg)) >> 7)),
            cb = (bb < 128) ? ((ab * bb) >> 7) : (255 - (((255 - ab) * (255 - bb)) >> 7));

          return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb);
        },
        soft_light: function(c1, c2) {
          var f  = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK) >> 16,
            ag = (c1 & GREEN_MASK) >> 8,
            ab = (c1 & BLUE_MASK),
            br = (c2 & RED_MASK) >> 16,
            bg = (c2 & GREEN_MASK) >> 8,
            bb = (c2 & BLUE_MASK),
            cr = ((ar * br) >> 7) + ((ar * ar) >> 8) - ((ar * ar * br) >> 15),
            cg = ((ag * bg) >> 7) + ((ag * ag) >> 8) - ((ag * ag * bg) >> 15),
            cb = ((ab * bb) >> 7) + ((ab * ab) >> 8) - ((ab * ab * bb) >> 15);

          return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb);
        },
        overlay: function(c1, c2) {
          var f  = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK) >> 16,
            ag = (c1 & GREEN_MASK) >> 8,
            ab = (c1 & BLUE_MASK),
            br = (c2 & RED_MASK) >> 16,
            bg = (c2 & GREEN_MASK) >> 8,
            bb = (c2 & BLUE_MASK),
            cr = (ar < 128) ? ((ar * br) >> 7) : (255 - (((255 - ar) * (255 - br)) >> 7)),
            cg = (ag < 128) ? ((ag * bg) >> 7) : (255 - (((255 - ag) * (255 - bg)) >> 7)),
            cb = (ab < 128) ? ((ab * bb) >> 7) : (255 - (((255 - ab) * (255 - bb)) >> 7));

          return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb);
        },
        dodge: function(c1, c2) {
          var f  = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK) >> 16,
            ag = (c1 & GREEN_MASK) >> 8,
            ab = (c1 & BLUE_MASK),
            br = (c2 & RED_MASK) >> 16,
            bg = (c2 & GREEN_MASK) >> 8,
            bb = (c2 & BLUE_MASK);

          var cr = 255;
          if (br !== 255) {
            cr = (ar << 8) / (255 - br);
            cr = (cr < 0) ? 0 : ((cr > 255) ? 255 : cr);
          }

          var cg = 255;
          if (bg !== 255) {
            cg = (ag << 8) / (255 - bg);
            cg = (cg < 0) ? 0 : ((cg > 255) ? 255 : cg);
          }

          var cb = 255;
          if (bb !== 255) {
            cb = (ab << 8) / (255 - bb);
            cb = (cb < 0) ? 0 : ((cb > 255) ? 255 : cb);
          }

          return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb);
        },
        burn: function(c1, c2) {
          var f  = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK) >> 16,
            ag = (c1 & GREEN_MASK) >> 8,
            ab = (c1 & BLUE_MASK),
            br = (c2 & RED_MASK) >> 16,
            bg = (c2 & GREEN_MASK) >> 8,
            bb = (c2 & BLUE_MASK);

          var cr = 0;
          if (br !== 0) {
            cr = ((255 - ar) << 8) / br;
            cr = 255 - ((cr < 0) ? 0 : ((cr > 255) ? 255 : cr));
          }

          var cg = 0;
          if (bg !== 0) {
            cg = ((255 - ag) << 8) / bg;
            cg = 255 - ((cg < 0) ? 0 : ((cg > 255) ? 255 : cg));
          }

          var cb = 0;
          if (bb !== 0) {
            cb = ((255 - ab) << 8) / bb;
            cb = 255 - ((cb < 0) ? 0 : ((cb > 255) ? 255 : cb));
          }

          return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb);
        }
      };
    }());

    function color$4(aValue1, aValue2, aValue3, aValue4) {
      var r, g, b, a;

      if (curColorMode === PConstants.HSB) {
        var rgb = p.color.toRGB(aValue1, aValue2, aValue3);
        r = rgb[0];
        g = rgb[1];
        b = rgb[2];
      } else {
        r = Math.round(255 * (aValue1 / colorModeX));
        g = Math.round(255 * (aValue2 / colorModeY));
        b = Math.round(255 * (aValue3 / colorModeZ));
      }

      a = Math.round(255 * (aValue4 / colorModeA));

      // Limit values less than 0 and greater than 255
      r = (r < 0) ? 0 : r;
      g = (g < 0) ? 0 : g;
      b = (b < 0) ? 0 : b;
      a = (a < 0) ? 0 : a;
      r = (r > 255) ? 255 : r;
      g = (g > 255) ? 255 : g;
      b = (b > 255) ? 255 : b;
      a = (a > 255) ? 255 : a;

      // Create color int
      return (a << 24) & PConstants.ALPHA_MASK | (r << 16) & PConstants.RED_MASK | (g << 8) & PConstants.GREEN_MASK | b & PConstants.BLUE_MASK;
    }

    function color$2(aValue1, aValue2) {
      var a;

      // Color int and alpha
      if (aValue1 & PConstants.ALPHA_MASK) {
        a = Math.round(255 * (aValue2 / colorModeA));
        // Limit values less than 0 and greater than 255
        a = (a > 255) ? 255 : a;
        a = (a < 0) ? 0 : a;

        return aValue1 - (aValue1 & PConstants.ALPHA_MASK) + ((a << 24) & PConstants.ALPHA_MASK);
      }
      // Grayscale and alpha
      if (curColorMode === PConstants.RGB) {
        return color$4(aValue1, aValue1, aValue1, aValue2);
      }
      if (curColorMode === PConstants.HSB) {
        return color$4(0, 0, (aValue1 / colorModeX) * colorModeZ, aValue2);
      }
    }

    function color$1(aValue1) {
      // Grayscale
      if (aValue1 <= colorModeX && aValue1 >= 0) {
          if (curColorMode === PConstants.RGB) {
            return color$4(aValue1, aValue1, aValue1, colorModeA);
          }
          if (curColorMode === PConstants.HSB) {
            return color$4(0, 0, (aValue1 / colorModeX) * colorModeZ, colorModeA);
          }
      }
      // Color int
      if (aValue1) {
        if (aValue1 > 2147483647) {
          // Java Overflow
          aValue1 -= 4294967296;
        }
        return aValue1;
      }
    }

    /**
    * Creates colors for storing in variables of the color datatype. The parameters are
    * interpreted as RGB or HSB values depending on the current colorMode(). The default
    * mode is RGB values from 0 to 255 and therefore, the function call color(255, 204, 0)
    * will return a bright yellow color. More about how colors are stored can be found in
    * the reference for the color datatype.
    *
    * @param {int|float} aValue1        red or hue or grey values relative to the current color range.
    * Also can be color value in hexadecimal notation (i.e. #FFCC00 or 0xFFFFCC00)
    * @param {int|float} aValue2        green or saturation values relative to the current color range
    * @param {int|float} aValue3        blue or brightness values relative to the current color range
    * @param {int|float} aValue4        relative to current color range. Represents alpha
    *
    * @returns {color} the color
    *
    * @see colorMode
    */
    p.color = function(aValue1, aValue2, aValue3, aValue4) {

      // 4 arguments: (R, G, B, A) or (H, S, B, A)
      if (aValue1 !== undef && aValue2 !== undef && aValue3 !== undef && aValue4 !== undef) {
        return color$4(aValue1, aValue2, aValue3, aValue4);
      }

      // 3 arguments: (R, G, B) or (H, S, B)
      if (aValue1 !== undef && aValue2 !== undef && aValue3 !== undef) {
        return color$4(aValue1, aValue2, aValue3, colorModeA);
      }

      // 2 arguments: (Color, A) or (Grayscale, A)
      if (aValue1 !== undef && aValue2 !== undef) {
        return color$2(aValue1, aValue2);
      }

      // 1 argument: (Grayscale) or (Color)
      if (typeof aValue1 === "number") {
        return color$1(aValue1);
      }

      // Default
      return color$4(colorModeX, colorModeY, colorModeZ, colorModeA);
    };

    // Ease of use function to extract the colour bits into a string
    p.color.toString = function(colorInt) {
      return "rgba(" + ((colorInt & PConstants.RED_MASK) >>> 16) + "," + ((colorInt & PConstants.GREEN_MASK) >>> 8) +
             "," + ((colorInt & PConstants.BLUE_MASK)) + "," + ((colorInt & PConstants.ALPHA_MASK) >>> 24) / 255 + ")";
    };

    // Easy of use function to pack rgba values into a single bit-shifted color int.
    p.color.toInt = function(r, g, b, a) {
      return (a << 24) & PConstants.ALPHA_MASK | (r << 16) & PConstants.RED_MASK | (g << 8) & PConstants.GREEN_MASK | b & PConstants.BLUE_MASK;
    };

    // Creates a simple array in [R, G, B, A] format, [255, 255, 255, 255]
    p.color.toArray = function(colorInt) {
      return [(colorInt & PConstants.RED_MASK) >>> 16, (colorInt & PConstants.GREEN_MASK) >>> 8,
              colorInt & PConstants.BLUE_MASK, (colorInt & PConstants.ALPHA_MASK) >>> 24];
    };

    // Creates a WebGL color array in [R, G, B, A] format. WebGL wants the color ranges between 0 and 1, [1, 1, 1, 1]
    p.color.toGLArray = function(colorInt) {
      return [((colorInt & PConstants.RED_MASK) >>> 16) / 255, ((colorInt & PConstants.GREEN_MASK) >>> 8) / 255,
              (colorInt & PConstants.BLUE_MASK) / 255, ((colorInt & PConstants.ALPHA_MASK) >>> 24) / 255];
    };

    // HSB conversion function from Mootools, MIT Licensed
    p.color.toRGB = function(h, s, b) {
      // Limit values greater than range
      h = (h > colorModeX) ? colorModeX : h;
      s = (s > colorModeY) ? colorModeY : s;
      b = (b > colorModeZ) ? colorModeZ : b;

      // Limit values smaller than range
      h = (h < 0) ? 0 : h;

      h = (h / colorModeX) * 360;
      s = (s / colorModeY) * 100;
      b = (b / colorModeZ) * 100;

      var br = Math.round(b / 100 * 255);

      if (s === 0) { // Grayscale
        return [br, br, br];
      }
      var hue = h % 360;
      var f = hue % 60;
      var p = Math.round((b * (100 - s)) / 10000 * 255);
      var q = Math.round((b * (6000 - s * f)) / 600000 * 255);
      var t = Math.round((b * (6000 - s * (60 - f))) / 600000 * 255);
      switch (Math.floor(hue / 60)) {
      case 0:
        return [br, t, p];
      case 1:
        return [q, br, p];
      case 2:
        return [p, br, t];
      case 3:
        return [p, q, br];
      case 4:
        return [t, p, br];
      case 5:
        return [br, p, q];
      default:
        Processing.debug("Unexpectedly hit default case in toRGB function.");
      }
    };

    function colorToHSB(colorInt) {
      var red, green, blue;

      red   = ((colorInt & PConstants.RED_MASK) >>> 16) / 255;
      green = ((colorInt & PConstants.GREEN_MASK) >>> 8) / 255;
      blue  = (colorInt & PConstants.BLUE_MASK) / 255;

      var max = p.max(p.max(red,green), blue),
          min = p.min(p.min(red,green), blue),
          hue, saturation;

      if (min === max) {
        return [0, 0, max*colorModeZ];
      }
      saturation = (max - min) / max;

      if (red === max) {
        hue = (green - blue) / (max - min);
      } else if (green === max) {
        hue = 2 + ((blue - red) / (max - min));
      } else {
        hue = 4 + ((red - green) / (max - min));
      }

      hue /= 6;

      if (hue < 0) {
        hue += 1;
      } else if (hue > 1) {
        hue -= 1;
      }
      return [hue*colorModeX, saturation*colorModeY, max*colorModeZ];
    }

    /**
    * Extracts the brightness value from a color.
    *
    * @param {color} colInt any value of the color datatype
    *
    * @returns {float} The brightness color value.
    *
    * @see red
    * @see green
    * @see blue
    * @see hue
    * @see saturation
    */
    p.brightness = function(colInt){
      return colorToHSB(colInt)[2];
    };

    /**
    * Extracts the saturation value from a color.
    *
    * @param {color} colInt any value of the color datatype
    *
    * @returns {float} The saturation color value.
    *
    * @see red
    * @see green
    * @see blue
    * @see hue
    * @see brightness
    */
    p.saturation = function(colInt){
      return colorToHSB(colInt)[1];
    };

    /**
    * Extracts the hue value from a color.
    *
    * @param {color} colInt any value of the color datatype
    *
    * @returns {float} The hue color value.
    *
    * @see red
    * @see green
    * @see blue
    * @see saturation
    * @see brightness
    */
    p.hue = function(colInt){
      return colorToHSB(colInt)[0];
    };

    /**
    * Extracts the red value from a color, scaled to match current colorMode().
    * This value is always returned as a float so be careful not to assign it to an int value.
    *
    * @param {color} aColor any value of the color datatype
    *
    * @returns {float} The red color value.
    *
    * @see green
    * @see blue
    * @see alpha
    * @see >> right shift
    * @see hue
    * @see saturation
    * @see brightness
    */
    p.red = function(aColor) {
      return ((aColor & PConstants.RED_MASK) >>> 16) / 255 * colorModeX;
    };

    /**
    * Extracts the green value from a color, scaled to match current colorMode().
    * This value is always returned as a float so be careful not to assign it to an int value.
    *
    * @param {color} aColor any value of the color datatype
    *
    * @returns {float} The green color value.
    *
    * @see red
    * @see blue
    * @see alpha
    * @see >> right shift
    * @see hue
    * @see saturation
    * @see brightness
    */
    p.green = function(aColor) {
      return ((aColor & PConstants.GREEN_MASK) >>> 8) / 255 * colorModeY;
    };

    /**
    * Extracts the blue value from a color, scaled to match current colorMode().
    * This value is always returned as a float so be careful not to assign it to an int value.
    *
    * @param {color} aColor any value of the color datatype
    *
    * @returns {float} The blue color value.
    *
    * @see red
    * @see green
    * @see alpha
    * @see >> right shift
    * @see hue
    * @see saturation
    * @see brightness
    */
    p.blue = function(aColor) {
      return (aColor & PConstants.BLUE_MASK) / 255 * colorModeZ;
    };

    /**
    * Extracts the alpha value from a color, scaled to match current colorMode().
    * This value is always returned as a float so be careful not to assign it to an int value.
    *
    * @param {color} aColor any value of the color datatype
    *
    * @returns {float} The alpha color value.
    *
    * @see red
    * @see green
    * @see blue
    * @see >> right shift
    * @see hue
    * @see saturation
    * @see brightness
    */
    p.alpha = function(aColor) {
      return ((aColor & PConstants.ALPHA_MASK) >>> 24) / 255 * colorModeA;
    };

    /**
    * Calculates a color or colors between two colors at a specific increment.
    * The amt parameter is the amount to interpolate between the two values where 0.0
    * equal to the first point, 0.1 is very near the first point, 0.5 is half-way in between, etc.
    *
    * @param {color} c1     interpolate from this color
    * @param {color} c2     interpolate to this color
    * @param {float} amt    between 0.0 and 1.0
    *
    * @returns {float} The blended color.
    *
    * @see blendColor
    * @see color
    */
    p.lerpColor = function(c1, c2, amt) {
      var r, g, b, a, r1, g1, b1, a1, r2, g2, b2, a2;
      var hsb1, hsb2, rgb, h, s;
      var colorBits1 = p.color(c1);
      var colorBits2 = p.color(c2);

      if (curColorMode === PConstants.HSB) {
        // Special processing for HSB mode.
        // Get HSB and Alpha values for Color 1 and 2
        hsb1 = colorToHSB(colorBits1);
        a1 = ((colorBits1 & PConstants.ALPHA_MASK) >>> 24) / colorModeA;
        hsb2 = colorToHSB(colorBits2);
        a2 = ((colorBits2 & PConstants.ALPHA_MASK) >>> 24) / colorModeA;

        // Return lerp value for each channel, for HSB components
        h = p.lerp(hsb1[0], hsb2[0], amt);
        s = p.lerp(hsb1[1], hsb2[1], amt);
        b = p.lerp(hsb1[2], hsb2[2], amt);
        rgb = p.color.toRGB(h, s, b);
        // ... and for Alpha-range
        a = (p.lerp(a1, a2, amt) * colorModeA + 0.5) | 0;

        return (a << 24) & PConstants.ALPHA_MASK |
               (rgb[0] << 16) & PConstants.RED_MASK |
               (rgb[1] << 8) & PConstants.GREEN_MASK |
               rgb[2] & PConstants.BLUE_MASK;
      }

      // Get RGBA values for Color 1 to floats
      r1 = (colorBits1 & PConstants.RED_MASK) >>> 16;
      g1 = (colorBits1 & PConstants.GREEN_MASK) >>> 8;
      b1 = (colorBits1 & PConstants.BLUE_MASK);
      a1 = ((colorBits1 & PConstants.ALPHA_MASK) >>> 24) / colorModeA;

      // Get RGBA values for Color 2 to floats
      r2 = (colorBits2 & PConstants.RED_MASK) >>> 16;
      g2 = (colorBits2 & PConstants.GREEN_MASK) >>> 8;
      b2 = (colorBits2 & PConstants.BLUE_MASK);
      a2 = ((colorBits2 & PConstants.ALPHA_MASK) >>> 24) / colorModeA;

      // Return lerp value for each channel, INT for color, Float for Alpha-range
      r = (p.lerp(r1, r2, amt) + 0.5) | 0;
      g = (p.lerp(g1, g2, amt) + 0.5) | 0;
      b = (p.lerp(b1, b2, amt) + 0.5) | 0;
      a = (p.lerp(a1, a2, amt) * colorModeA + 0.5) | 0;

      return (a << 24) & PConstants.ALPHA_MASK |
             (r << 16) & PConstants.RED_MASK |
             (g << 8) & PConstants.GREEN_MASK |
             b & PConstants.BLUE_MASK;
    };

    /**
    * Changes the way Processing interprets color data. By default, fill(), stroke(), and background()
    * colors are set by values between 0 and 255 using the RGB color model. It is possible to change the
    * numerical range used for specifying colors and to switch color systems. For example, calling colorMode(RGB, 1.0)
    * will specify that values are specified between 0 and 1. The limits for defining colors are altered by setting the
    * parameters range1, range2, range3, and range 4.
    *
    * @param {MODE} mode Either RGB or HSB, corresponding to Red/Green/Blue and Hue/Saturation/Brightness
    * @param {int|float} range              range for all color elements
    * @param {int|float} range1             range for the red or hue depending on the current color mode
    * @param {int|float} range2             range for the green or saturation depending on the current color mode
    * @param {int|float} range3             range for the blue or brightness depending on the current color mode
    * @param {int|float} range4             range for the alpha
    *
    * @returns none
    *
    * @see background
    * @see fill
    * @see stroke
    */
    p.colorMode = function() { // mode, range1, range2, range3, range4
      curColorMode = arguments[0];
      if (arguments.length > 1) {
        colorModeX   = arguments[1];
        colorModeY   = arguments[2] || arguments[1];
        colorModeZ   = arguments[3] || arguments[1];
        colorModeA   = arguments[4] || arguments[1];
      }
    };

    /**
    * Blends two color values together based on the blending mode given as the MODE parameter.
    * The possible modes are described in the reference for the blend() function.
    *
    * @param {color} c1 color: the first color to blend
    * @param {color} c2 color: the second color to blend
    * @param {MODE} MODE Either BLEND, ADD, SUBTRACT, DARKEST, LIGHTEST, DIFFERENCE, EXCLUSION, MULTIPLY,
    * SCREEN, OVERLAY, HARD_LIGHT, SOFT_LIGHT, DODGE, or BURN
    *
    * @returns {float} The blended color.
    *
    * @see blend
    * @see color
    */
    p.blendColor = function(c1, c2, mode) {
      if (mode === PConstants.REPLACE) {
        return p.modes.replace(c1, c2);
      } else if (mode === PConstants.BLEND) {
        return p.modes.blend(c1, c2);
      } else if (mode === PConstants.ADD) {
        return p.modes.add(c1, c2);
      } else if (mode === PConstants.SUBTRACT) {
        return p.modes.subtract(c1, c2);
      } else if (mode === PConstants.LIGHTEST) {
        return p.modes.lightest(c1, c2);
      } else if (mode === PConstants.DARKEST) {
        return p.modes.darkest(c1, c2);
      } else if (mode === PConstants.DIFFERENCE) {
        return p.modes.difference(c1, c2);
      } else if (mode === PConstants.EXCLUSION) {
        return p.modes.exclusion(c1, c2);
      } else if (mode === PConstants.MULTIPLY) {
        return p.modes.multiply(c1, c2);
      } else if (mode === PConstants.SCREEN) {
        return p.modes.screen(c1, c2);
      } else if (mode === PConstants.HARD_LIGHT) {
        return p.modes.hard_light(c1, c2);
      } else if (mode === PConstants.SOFT_LIGHT) {
        return p.modes.soft_light(c1, c2);
      } else if (mode === PConstants.OVERLAY) {
        return p.modes.overlay(c1, c2);
      } else if (mode === PConstants.DODGE) {
        return p.modes.dodge(c1, c2);
      } else if (mode === PConstants.BURN) {
        return p.modes.burn(c1, c2);
      }
    };

    ////////////////////////////////////////////////////////////////////////////
    // Canvas-Matrix manipulation
    ////////////////////////////////////////////////////////////////////////////

    function saveContext() {
      curContext.save();
    }

    function restoreContext() {
      curContext.restore();
      isStrokeDirty = true;
      isFillDirty = true;
    }

    /**
    * Prints the current matrix to the text window.
    *
    * @returns none
    *
    * @see pushMatrix
    * @see popMatrix
    * @see resetMatrix
    * @see applyMatrix
    */
    p.printMatrix = function() {
      modelView.print();
    };

    /**
    * Specifies an amount to displace objects within the display window. The x parameter specifies left/right translation,
    * the y parameter specifies up/down translation, and the z parameter specifies translations toward/away from the screen.
    * Using this function with the z  parameter requires using the P3D or OPENGL parameter in combination with size as shown
    * in the above example. Transformations apply to everything that happens after and subsequent calls to the function
    * accumulates the effect. For example, calling translate(50, 0) and then translate(20, 0) is the same as translate(70, 0).
    * If translate() is called within draw(), the transformation is reset when the loop begins again.
    * This function can be further controlled by the pushMatrix() and popMatrix().
    *
    * @param {int|float} x        left/right translation
    * @param {int|float} y        up/down translation
    * @param {int|float} z        forward/back translation
    *
    * @returns none
    *
    * @see pushMatrix
    * @see popMatrix
    * @see scale
    * @see rotate
    * @see rotateX
    * @see rotateY
    * @see rotateZ
    */
    Drawing2D.prototype.translate = function(x, y) {
      modelView.translate(x, y);
      modelViewInv.invTranslate(x, y);
      curContext.translate(x, y);
    };

    Drawing3D.prototype.translate = function(x, y, z) {
      modelView.translate(x, y, z);
      modelViewInv.invTranslate(x, y, z);
    };

    /**
    * Increases or decreases the size of a shape by expanding and contracting vertices. Objects always scale from their
    * relative origin to the coordinate system. Scale values are specified as decimal percentages. For example, the
    * function call scale(2.0) increases the dimension of a shape by 200%. Transformations apply to everything that
    * happens after and subsequent calls to the function multiply the effect. For example, calling scale(2.0) and
    * then scale(1.5) is the same as scale(3.0). If scale() is called within draw(), the transformation is reset when
    * the loop begins again. Using this fuction with the z  parameter requires passing P3D or OPENGL into the size()
    * parameter as shown in the example above. This function can be further controlled by pushMatrix() and popMatrix().
    *
    * @param {int|float} size     percentage to scale the object
    * @param {int|float} x        percentage to scale the object in the x-axis
    * @param {int|float} y        percentage to scale the object in the y-axis
    * @param {int|float} z        percentage to scale the object in the z-axis
    *
    * @returns none
    *
    * @see pushMatrix
    * @see popMatrix
    * @see translate
    * @see rotate
    * @see rotateX
    * @see rotateY
    * @see rotateZ
    */
    Drawing2D.prototype.scale = function(x, y) {
      modelView.scale(x, y);
      modelViewInv.invScale(x, y);
      curContext.scale(x, y || x);
    };

    Drawing3D.prototype.scale = function(x, y, z) {
      modelView.scale(x, y, z);
      modelViewInv.invScale(x, y, z);
    };


    /**
     * helper function for applying a transfrom matrix to a 2D context.
     */
    Drawing2D.prototype.transform = function(pmatrix) {
      var e = pmatrix.array();
      curContext.transform(e[0],e[3],e[1],e[4],e[2],e[5]);
    };

    /**
     * helper function for applying a transfrom matrix to a 3D context.
     * not currently implemented.
     */
    Drawing3D.prototype.transformm = function(pmatrix3d) {
      throw("p.transform is currently not supported in 3D mode");
    };


    /**
    * Pushes the current transformation matrix onto the matrix stack. Understanding pushMatrix() and popMatrix()
    * requires understanding the concept of a matrix stack. The pushMatrix() function saves the current coordinate
    * system to the stack and popMatrix() restores the prior coordinate system. pushMatrix() and popMatrix() are
    * used in conjuction with the other transformation methods and may be embedded to control the scope of
    * the transformations.
    *
    * @returns none
    *
    * @see popMatrix
    * @see translate
    * @see rotate
    * @see rotateX
    * @see rotateY
    * @see rotateZ
    */
    Drawing2D.prototype.pushMatrix = function() {
      userMatrixStack.load(modelView);
      userReverseMatrixStack.load(modelViewInv);
      saveContext();
    };

    Drawing3D.prototype.pushMatrix = function() {
      userMatrixStack.load(modelView);
      userReverseMatrixStack.load(modelViewInv);
    };

    /**
    * Pops the current transformation matrix off the matrix stack. Understanding pushing and popping requires
    * understanding the concept of a matrix stack. The pushMatrix() function saves the current coordinate system to
    * the stack and popMatrix() restores the prior coordinate system. pushMatrix() and popMatrix() are used in
    * conjuction with the other transformation methods and may be embedded to control the scope of the transformations.
    *
    * @returns none
    *
    * @see popMatrix
    * @see pushMatrix
    */
    Drawing2D.prototype.popMatrix = function() {
      modelView.set(userMatrixStack.pop());
      modelViewInv.set(userReverseMatrixStack.pop());
      restoreContext();
    };

    Drawing3D.prototype.popMatrix = function() {
      modelView.set(userMatrixStack.pop());
      modelViewInv.set(userReverseMatrixStack.pop());
    };

    /**
    * Replaces the current matrix with the identity matrix. The equivalent function in OpenGL is glLoadIdentity().
    *
    * @returns none
    *
    * @see popMatrix
    * @see pushMatrix
    * @see applyMatrix
    * @see printMatrix
    */
    Drawing2D.prototype.resetMatrix = function() {
      modelView.reset();
      modelViewInv.reset();
      curContext.setTransform(1,0,0,1,0,0);
    };

    Drawing3D.prototype.resetMatrix = function() {
      modelView.reset();
      modelViewInv.reset();
    };

    /**
    * Multiplies the current matrix by the one specified through the parameters. This is very slow because it will
    * try to calculate the inverse of the transform, so avoid it whenever possible. The equivalent function
    * in OpenGL is glMultMatrix().
    *
    * @param {int|float} n00-n15      numbers which define the 4x4 matrix to be multiplied
    *
    * @returns none
    *
    * @see popMatrix
    * @see pushMatrix
    * @see resetMatrix
    * @see printMatrix
    */
    DrawingShared.prototype.applyMatrix = function() {
      var a = arguments;
      modelView.apply(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9], a[10], a[11], a[12], a[13], a[14], a[15]);
      modelViewInv.invApply(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9], a[10], a[11], a[12], a[13], a[14], a[15]);
    };

    Drawing2D.prototype.applyMatrix = function() {
      var a = arguments;
      for (var cnt = a.length; cnt < 16; cnt++) {
        a[cnt] = 0;
      }
      a[10] = a[15] = 1;
      DrawingShared.prototype.applyMatrix.apply(this, a);
    };

    /**
    * Rotates a shape around the x-axis the amount specified by the angle parameter. Angles should be
    * specified in radians (values from 0 to PI*2) or converted to radians with the radians()  function.
    * Objects are always rotated around their relative position to the origin and positive numbers
    * rotate objects in a counterclockwise direction. Transformations apply to everything that happens
    * after and subsequent calls to the function accumulates the effect. For example, calling rotateX(PI/2)
    * and then rotateX(PI/2) is the same as rotateX(PI). If rotateX() is called within the draw(), the
    * transformation is reset when the loop begins again. This function requires passing P3D or OPENGL
    * into the size() parameter as shown in the example above.
    *
    * @param {int|float} angleInRadians     angle of rotation specified in radians
    *
    * @returns none
    *
    * @see rotateY
    * @see rotateZ
    * @see rotate
    * @see translate
    * @see scale
    * @see popMatrix
    * @see pushMatrix
    */
    p.rotateX = function(angleInRadians) {
      modelView.rotateX(angleInRadians);
      modelViewInv.invRotateX(angleInRadians);
    };

    /**
    * Rotates a shape around the z-axis the amount specified by the angle parameter. Angles should be
    * specified in radians (values from 0 to PI*2) or converted to radians with the radians()  function.
    * Objects are always rotated around their relative position to the origin and positive numbers
    * rotate objects in a counterclockwise direction. Transformations apply to everything that happens
    * after and subsequent calls to the function accumulates the effect. For example, calling rotateZ(PI/2)
    * and then rotateZ(PI/2) is the same as rotateZ(PI). If rotateZ() is called within the draw(), the
    * transformation is reset when the loop begins again. This function requires passing P3D or OPENGL
    * into the size() parameter as shown in the example above.
    *
    * @param {int|float} angleInRadians     angle of rotation specified in radians
    *
    * @returns none
    *
    * @see rotateX
    * @see rotateY
    * @see rotate
    * @see translate
    * @see scale
    * @see popMatrix
    * @see pushMatrix
    */
    Drawing2D.prototype.rotateZ = function() {
      throw "rotateZ() is not supported in 2D mode. Use rotate(float) instead.";
    };

    Drawing3D.prototype.rotateZ = function(angleInRadians) {
      modelView.rotateZ(angleInRadians);
      modelViewInv.invRotateZ(angleInRadians);
    };

    /**
    * Rotates a shape around the y-axis the amount specified by the angle parameter. Angles should be
    * specified in radians (values from 0 to PI*2) or converted to radians with the radians()  function.
    * Objects are always rotated around their relative position to the origin and positive numbers
    * rotate objects in a counterclockwise direction. Transformations apply to everything that happens
    * after and subsequent calls to the function accumulates the effect. For example, calling rotateY(PI/2)
    * and then rotateY(PI/2) is the same as rotateY(PI). If rotateY() is called within the draw(), the
    * transformation is reset when the loop begins again. This function requires passing P3D or OPENGL
    * into the size() parameter as shown in the example above.
    *
    * @param {int|float} angleInRadians     angle of rotation specified in radians
    *
    * @returns none
    *
    * @see rotateX
    * @see rotateZ
    * @see rotate
    * @see translate
    * @see scale
    * @see popMatrix
    * @see pushMatrix
    */
    p.rotateY = function(angleInRadians) {
      modelView.rotateY(angleInRadians);
      modelViewInv.invRotateY(angleInRadians);
    };

    /**
    * Rotates a shape the amount specified by the angle parameter. Angles should be specified in radians
    * (values from 0 to TWO_PI) or converted to radians with the radians() function. Objects are always
    * rotated around their relative position to the origin and positive numbers rotate objects in a
    * clockwise direction. Transformations apply to everything that happens after and subsequent calls
    * to the function accumulates the effect. For example, calling rotate(HALF_PI) and then rotate(HALF_PI)
    * is the same as rotate(PI). All tranformations are reset when draw() begins again. Technically,
    * rotate() multiplies the current transformation matrix by a rotation matrix. This function can be
    * further controlled by the pushMatrix() and popMatrix().
    *
    * @param {int|float} angleInRadians     angle of rotation specified in radians
    *
    * @returns none
    *
    * @see rotateX
    * @see rotateY
    * @see rotateZ
    * @see rotate
    * @see translate
    * @see scale
    * @see popMatrix
    * @see pushMatrix
    */
    Drawing2D.prototype.rotate = function(angleInRadians) {
      modelView.rotateZ(angleInRadians);
      modelViewInv.invRotateZ(angleInRadians);
      curContext.rotate(angleInRadians);
    };

    Drawing3D.prototype.rotate = function(angleInRadians) {
      if (arguments.length < 4) {
        p.rotateZ(angleInRadians);
      } else {
        modelView.rotate(angleInRadians, arguments[1], arguments[2], arguments[3]);
        modelViewInv.rotate((-angleInRadians), arguments[1], arguments[2], arguments[3]);
      }
    };

    /**
    * Shears a shape around the x-axis the amount specified by the angle parameter.
    * Angles should be specified in radians (values from 0 to PI*2) or converted to radians
    * with the radians() function. Objects are always sheared around their relative position
    * to the origin and positive numbers shear objects in a clockwise direction. Transformations
    * apply to everything that happens after and subsequent calls to the function accumulates the
    * effect. For example, calling shearX(PI/2) and then shearX(PI/2) is the same as shearX(PI)
    *
    * @param {int|float} angleInRadians     angle of rotation specified in radians
    *
    * @returns none
    *
    * @see rotateX
    * @see rotateY
    * @see rotateZ
    * @see rotate
    * @see translate
    * @see scale
    * @see popMatrix
    * @see pushMatrix
    */

    Drawing2D.prototype.shearX = function(angleInRadians) {
      modelView.shearX(angleInRadians);
      curContext.transform(1,0,angleInRadians,1,0,0);
    };

    Drawing3D.prototype.shearX = function(angleInRadians) {
      modelView.shearX(angleInRadians);
    };

    /**
    * Shears a shape around the y-axis the amount specified by the angle parameter.
    * Angles should be specified in radians (values from 0 to PI*2) or converted to
    * radians with the radians() function. Objects are always sheared around their
    * relative position to the origin and positive numbers shear objects in a
    * clockwise direction. Transformations apply to everything that happens after
    * and subsequent calls to the function accumulates the effect. For example,
    * calling shearY(PI/2) and then shearY(PI/2) is the same as shearY(PI).
    *
    * @param {int|float} angleInRadians     angle of rotation specified in radians
    *
    * @returns none
    *
    * @see rotateX
    * @see rotateY
    * @see rotateZ
    * @see rotate
    * @see translate
    * @see scale
    * @see popMatrix
    * @see pushMatrix
    * @see shearX
    */

   Drawing2D.prototype.shearY = function(angleInRadians) {
      modelView.shearY(angleInRadians);
      curContext.transform(1,angleInRadians,0,1,0,0);
    };

    Drawing3D.prototype.shearY = function(angleInRadians) {
      modelView.shearY(angleInRadians);
    };

    /**
    * The pushStyle() function saves the current style settings and popStyle()  restores the prior settings.
    * Note that these functions are always used together. They allow you to change the style settings and later
    * return to what you had. When a new style is started with pushStyle(), it builds on the current style information.
    * The pushStyle() and popStyle() functions can be embedded to provide more control (see the second example
    * above for a demonstration.)
    * The style information controlled by the following functions are included in the style: fill(), stroke(), tint(),
    * strokeWeight(), strokeCap(), strokeJoin(), imageMode(), rectMode(), ellipseMode(), shapeMode(), colorMode(),
    * textAlign(), textFont(), textMode(), textSize(), textLeading(), emissive(), specular(), shininess(), ambient()
    *
    * @returns none
    *
    * @see popStyle
    */
    p.pushStyle = function() {
      // Save the canvas state.
      saveContext();

      p.pushMatrix();

      var newState = {
        'doFill': doFill,
        'currentFillColor': currentFillColor,
        'doStroke': doStroke,
        'currentStrokeColor': currentStrokeColor,
        'curTint': curTint,
        'curRectMode': curRectMode,
        'curColorMode': curColorMode,
        'colorModeX': colorModeX,
        'colorModeZ': colorModeZ,
        'colorModeY': colorModeY,
        'colorModeA': colorModeA,
        'curTextFont': curTextFont,
        'horizontalTextAlignment': horizontalTextAlignment,
        'verticalTextAlignment': verticalTextAlignment,
        'textMode': textMode,
        'curFontName': curFontName,
        'curTextSize': curTextSize,
        'curTextAscent': curTextAscent,
        'curTextDescent': curTextDescent,
        'curTextLeading': curTextLeading
      };

      styleArray.push(newState);
    };

    /**
    * The pushStyle() function saves the current style settings and popStyle()  restores the prior settings; these
    * functions are always used together. They allow you to change the style settings and later return to what you had.
    * When a new style is started with pushStyle(), it builds on the current style information. The pushStyle() and
    * popStyle() functions can be embedded to provide more control (see the second example above for a demonstration.)
    *
    * @returns none
    *
    * @see pushStyle
    */
    p.popStyle = function() {
      var oldState = styleArray.pop();

      if (oldState) {
        restoreContext();

        p.popMatrix();

        doFill = oldState.doFill;
        currentFillColor = oldState.currentFillColor;
        doStroke = oldState.doStroke;
        currentStrokeColor = oldState.currentStrokeColor;
        curTint = oldState.curTint;
        curRectMode = oldState.curRectMode;
        curColorMode = oldState.curColorMode;
        colorModeX = oldState.colorModeX;
        colorModeZ = oldState.colorModeZ;
        colorModeY = oldState.colorModeY;
        colorModeA = oldState.colorModeA;
        curTextFont = oldState.curTextFont;
        curFontName = oldState.curFontName;
        curTextSize = oldState.curTextSize;
        horizontalTextAlignment = oldState.horizontalTextAlignment;
        verticalTextAlignment = oldState.verticalTextAlignment;
        textMode = oldState.textMode;
        curTextAscent = oldState.curTextAscent;
        curTextDescent = oldState.curTextDescent;
        curTextLeading = oldState.curTextLeading;
      } else {
        throw "Too many popStyle() without enough pushStyle()";
      }
    };

    ////////////////////////////////////////////////////////////////////////////
    // Time based functions
    ////////////////////////////////////////////////////////////////////////////

    /**
    * Processing communicates with the clock on your computer.
    * The year() function returns the current year as an integer (2003, 2004, 2005, etc).
    *
    * @returns {float} The current year.
    *
    * @see millis
    * @see second
    * @see minute
    * @see hour
    * @see day
    * @see month
    */
    p.year = function() {
      return new Date().getFullYear();
    };
    /**
    * Processing communicates with the clock on your computer.
    * The month() function returns the current month as a value from 1 - 12.
    *
    * @returns {float} The current month.
    *
    * @see millis
    * @see second
    * @see minute
    * @see hour
    * @see day
    * @see year
    */
    p.month = function() {
      return new Date().getMonth() + 1;
    };
    /**
    * Processing communicates with the clock on your computer.
    * The day() function returns the current day as a value from 1 - 31.
    *
    * @returns {float} The current day.
    *
    * @see millis
    * @see second
    * @see minute
    * @see hour
    * @see month
    * @see year
    */
    p.day = function() {
      return new Date().getDate();
    };
    /**
    * Processing communicates with the clock on your computer.
    * The hour() function returns the current hour as a value from 0 - 23.
    *
    * @returns {float} The current hour.
    *
    * @see millis
    * @see second
    * @see minute
    * @see month
    * @see day
    * @see year
    */
    p.hour = function() {
      return new Date().getHours();
    };
    /**
    * Processing communicates with the clock on your computer.
    * The minute() function returns the current minute as a value from 0 - 59.
    *
    * @returns {float} The current minute.
    *
    * @see millis
    * @see second
    * @see month
    * @see hour
    * @see day
    * @see year
    */
    p.minute = function() {
      return new Date().getMinutes();
    };
    /**
    * Processing communicates with the clock on your computer.
    * The second() function returns the current second as a value from 0 - 59.
    *
    * @returns {float} The current minute.
    *
    * @see millis
    * @see month
    * @see minute
    * @see hour
    * @see day
    * @see year
    */
    p.second = function() {
      return new Date().getSeconds();
    };
    /**
    * Returns the number of milliseconds (thousandths of a second) since starting a sketch.
    * This information is often used for timing animation sequences.
    *
    * @returns {long} The number of milliseconds since starting the sketch.
    *
    * @see month
    * @see second
    * @see minute
    * @see hour
    * @see day
    * @see year
    */
    p.millis = function() {
      return Date.now() - start;
    };

    /**
    * Executes the code within draw() one time. This functions allows the program to update
    * the display window only when necessary, for example when an event registered by
    * mousePressed() or keyPressed() occurs.
    * In structuring a program, it only makes sense to call redraw() within events such as
    * mousePressed(). This is because redraw() does not run draw() immediately (it only sets
    * a flag that indicates an update is needed).
    * Calling redraw() within draw() has no effect because draw() is continuously called anyway.
    *
    * @returns none
    *
    * @see noLoop
    * @see loop
    */
    function redrawHelper() {
      var sec = (Date.now() - timeSinceLastFPS) / 1000;
      framesSinceLastFPS++;
      var fps = framesSinceLastFPS / sec;

      // recalculate FPS every half second for better accuracy.
      if (sec > 0.5) {
        timeSinceLastFPS = Date.now();
        framesSinceLastFPS = 0;
        p.__frameRate = fps;
      }

      p.frameCount++;
    }

    Drawing2D.prototype.redraw = function() {
      redrawHelper();

      curContext.lineWidth = lineWidth;
      var pmouseXLastEvent = p.pmouseX,
          pmouseYLastEvent = p.pmouseY;
      p.pmouseX = pmouseXLastFrame;
      p.pmouseY = pmouseYLastFrame;

      saveContext();
      p.draw();
      restoreContext();

      pmouseXLastFrame = p.mouseX;
      pmouseYLastFrame = p.mouseY;
      p.pmouseX = pmouseXLastEvent;
      p.pmouseY = pmouseYLastEvent;
    };

    Drawing3D.prototype.redraw = function() {
      redrawHelper();

      var pmouseXLastEvent = p.pmouseX,
          pmouseYLastEvent = p.pmouseY;
      p.pmouseX = pmouseXLastFrame;
      p.pmouseY = pmouseYLastFrame;
      // even if the color buffer isn't cleared with background(),
      // the depth buffer needs to be cleared regardless.
      curContext.clear(curContext.DEPTH_BUFFER_BIT);
      curContextCache = { attributes: {}, locations: {} };
      // Delete all the lighting states and the materials the
      // user set in the last draw() call.
      p.noLights();
      p.lightFalloff(1, 0, 0);
      p.shininess(1);
      p.ambient(255, 255, 255);
      p.specular(0, 0, 0);
      p.emissive(0, 0, 0);
      p.camera();
      p.draw();

      pmouseXLastFrame = p.mouseX;
      pmouseYLastFrame = p.mouseY;
      p.pmouseX = pmouseXLastEvent;
      p.pmouseY = pmouseYLastEvent;
    };

    /**
    * Stops Processing from continuously executing the code within draw(). If loop() is
    * called, the code in draw() begin to run continuously again. If using noLoop() in
    * setup(), it should be the last line inside the block.
    * When noLoop() is used, it's not possible to manipulate or access the screen inside event
    * handling functions such as mousePressed() or keyPressed(). Instead, use those functions
    * to call redraw() or loop(), which will run draw(), which can update the screen properly.
    * This means that when noLoop() has been called, no drawing can happen, and functions like
    * saveFrame() or loadPixels() may not be used.
    * Note that if the sketch is resized, redraw() will be called to update the sketch, even
    * after noLoop() has been specified. Otherwise, the sketch would enter an odd state until
    * loop() was called.
    *
    * @returns none
    *
    * @see redraw
    * @see draw
    * @see loop
    */
    p.noLoop = function() {
      doLoop = false;
      loopStarted = false;
      clearInterval(looping);
      curSketch.onPause();
    };

    /**
    * Causes Processing to continuously execute the code within draw(). If noLoop() is called,
    * the code in draw() stops executing.
    *
    * @returns none
    *
    * @see noLoop
    */
    p.loop = function() {
      if (loopStarted) {
        return;
      }

      timeSinceLastFPS = Date.now();
      framesSinceLastFPS = 0;

      looping = window.setInterval(function() {
        try {
          curSketch.onFrameStart();
          p.redraw();
          curSketch.onFrameEnd();
        } catch(e_loop) {
          window.clearInterval(looping);
          throw e_loop;
        }
      }, curMsPerFrame);
      doLoop = true;
      loopStarted = true;
      curSketch.onLoop();
    };

    /**
    * Specifies the number of frames to be displayed every second. If the processor is not
    * fast enough to maintain the specified rate, it will not be achieved. For example, the
    * function call frameRate(30) will attempt to refresh 30 times a second. It is recommended
    * to set the frame rate within setup(). The default rate is 60 frames per second.
    *
    * @param {int} aRate        number of frames per second.
    *
    * @returns none
    *
    * @see delay
    */
    p.frameRate = function(aRate) {
      curFrameRate = aRate;
      curMsPerFrame = 1000 / curFrameRate;

      // clear and reset interval
      if (doLoop) {
        p.noLoop();
        p.loop();
      }
    };

    /**
    * Quits/stops/exits the program.
    * Rather than terminating immediately, exit() will cause the sketch to exit after draw()
    * has completed (or after setup() completes if called during the setup() method).
    *
    * @returns none
    */
    p.exit = function() {
      // cleanup
      window.clearInterval(looping);
      removeInstance(p.externals.canvas.id);
      delete(curElement.onmousedown);

      // Step through the libraries to detach them
      for (var lib in Processing.lib) {
        if (Processing.lib.hasOwnProperty(lib)) {
          if (Processing.lib[lib].hasOwnProperty("detach")) {
            Processing.lib[lib].detach(p);
          }
        }
      }

      // clean up all event handling
      var i = eventHandlers.length;
      while (i--) {
        detachEventHandler(eventHandlers[i]);
      }
      curSketch.onExit();
    };

    ////////////////////////////////////////////////////////////////////////////
    // MISC functions
    ////////////////////////////////////////////////////////////////////////////

    /**
    * Sets the cursor to a predefined symbol, an image, or turns it on if already hidden.
    * If you are trying to set an image as the cursor, it is recommended to make the size
    * 16x16 or 32x32 pixels. It is not possible to load an image as the cursor if you are
    * exporting your program for the Web. The values for parameters x and y must be less
    * than the dimensions of the image.
    *
    * @param {MODE} MODE either ARROW, CROSS, HAND, MOVE, TEXT, WAIT
    * @param {PImage} image       any variable of type PImage
    * @param {int}    x           the horizonal active spot of the cursor
    * @param {int}    y           the vertical active spot of the cursor
    *
    * @returns none
    *
    * @see noCursor
    */
    p.cursor = function() {
      if (arguments.length > 1 || (arguments.length === 1 && arguments[0] instanceof p.PImage)) {
        var image = arguments[0],
          x, y;
        if (arguments.length >= 3) {
          x = arguments[1];
          y = arguments[2];
          if (x < 0 || y < 0 || y >= image.height || x >= image.width) {
            throw "x and y must be non-negative and less than the dimensions of the image";
          }
        } else {
          x = image.width >>> 1;
          y = image.height >>> 1;
        }

        // see https://developer.mozilla.org/en/Using_URL_values_for_the_cursor_property
        var imageDataURL = image.toDataURL();
        var style = "url(\"" + imageDataURL + "\") " + x + " " + y + ", default";
        curCursor = curElement.style.cursor = style;
      } else if (arguments.length === 1) {
        var mode = arguments[0];
        curCursor = curElement.style.cursor = mode;
      } else {
        curCursor = curElement.style.cursor = oldCursor;
      }
    };

    /**
    * Hides the cursor from view.
    *
    * @returns none
    *
    * @see cursor
    */
    p.noCursor = function() {
      curCursor = curElement.style.cursor = PConstants.NOCURSOR;
    };

    /**
    * Links to a webpage either in the same window or in a new window. The complete URL
    * must be specified.
    *
    * @param {String} href      complete url as a String in quotes
    * @param {String} target    name of the window to load the URL as a string in quotes
    *
    * @returns none
    */
    p.link = function(href, target) {
      if (target !== undef) {
        window.open(href, target);
      } else {
        window.location = href;
      }
    };

    // PGraphics methods
    // These functions exist only for compatibility with P5
    p.beginDraw = noop;
    p.endDraw = noop;

    /**
     * This function takes content from a canvas and turns it into an ImageData object to be used with a PImage
     *
     * @returns {ImageData}        ImageData object to attach to a PImage (1D array of pixel data)
     *
     * @see PImage
     */
    Drawing2D.prototype.toImageData = function(x, y, w, h) {
      x = x !== undef ? x : 0;
      y = y !== undef ? y : 0;
      w = w !== undef ? w : p.width;
      h = h !== undef ? h : p.height;
      return curContext.getImageData(x, y, w, h);
    };

    Drawing3D.prototype.toImageData = function(x, y, w, h) {
      x = x !== undef ? x : 0;
      y = y !== undef ? y : 0;
      w = w !== undef ? w : p.width;
      h = h !== undef ? h : p.height;
      var c = document.createElement("canvas"),
          ctx = c.getContext("2d"),
          obj = ctx.createImageData(w, h),
          uBuff = new Uint8Array(w * h * 4);
      curContext.readPixels(x, y, w, h, curContext.RGBA, curContext.UNSIGNED_BYTE, uBuff);
      for (var i=0, ul=uBuff.length, obj_data=obj.data; i < ul; i++) {
        obj_data[i] = uBuff[(h - 1 - Math.floor(i / 4 / w)) * w * 4 + (i % (w * 4))];
      }
      return obj;
    };

    /**
    * Displays message in the browser's status area. This is the text area in the lower
    * left corner of the browser. The status() function will only work when the
    * Processing program is running in a web browser.
    *
    * @param {String} text      any valid String
    *
    * @returns none
    */
    p.status = function(text) {
      window.status = text;
    };

    ////////////////////////////////////////////////////////////////////////////
    // Binary Functions
    ////////////////////////////////////////////////////////////////////////////

    /**
    * Converts a byte, char, int, or color to a String containing the equivalent binary
    * notation. For example color(0, 102, 153, 255) will convert to the String
    * "11111111000000000110011010011001". This function can help make your geeky debugging
    * sessions much happier.
    *
    * @param {byte|char|int|color} num          byte, char, int, color: value to convert
    * @param {int} numBits                      number of digits to return
    *
    * @returns {String}
    *
    * @see unhex
    * @see hex
    * @see unbinary
    */
    p.binary = function(num, numBits) {
      var bit;
      if (numBits > 0) {
        bit = numBits;
      } else if(num instanceof Char) {
        bit = 16;
        num |= 0; // making it int
      } else {
        // autodetect, skipping zeros
        bit = 32;
        while (bit > 1 && !((num >>> (bit - 1)) & 1)) {
          bit--;
        }
      }
      var result = "";
      while (bit > 0) {
        result += ((num >>> (--bit)) & 1) ? "1" : "0";
      }
      return result;
    };

    /**
    * Converts a String representation of a binary number to its equivalent integer value.
    * For example, unbinary("00001000") will return 8.
    *
    * @param {String} binaryString String
    *
    * @returns {Int}
    *
    * @see hex
    * @see binary
    * @see unbinary
    */
    p.unbinary = function(binaryString) {
      var i = binaryString.length - 1, mask = 1, result = 0;
      while (i >= 0) {
        var ch = binaryString[i--];
        if (ch !== '0' && ch !== '1') {
          throw "the value passed into unbinary was not an 8 bit binary number";
        }
        if (ch === '1') {
          result += mask;
        }
        mask <<= 1;
      }
      return result;
    };

    var decimalToHex = function(d, padding) {
      //if there is no padding value added, default padding to 8 else go into while statement.
      padding = (padding === undef || padding === null) ? padding = 8 : padding;
      if (d < 0) {
        d = 0xFFFFFFFF + d + 1;
      }
      var hex = Number(d).toString(16).toUpperCase();
      while (hex.length < padding) {
        hex = "0" + hex;
      }
      if (hex.length >= padding) {
        hex = hex.substring(hex.length - padding, hex.length);
      }
      return hex;
    };

    // note: since we cannot keep track of byte, int types by default the returned string is 8 chars long
    // if no 2nd argument is passed.  closest compromise we can use to match java implementation Feb 5 2010
    // also the char parser has issues with chars that are not digits or letters IE: !@#$%^&*
    /**
    * Converts a byte, char, int, or color to a String containing the equivalent hexadecimal notation.
    * For example color(0, 102, 153, 255) will convert to the String "FF006699". This function can help
    * make your geeky debugging sessions much happier.
    *
    * @param {byte|char|int|Color} value   the value to turn into a hex string
    * @param {int} digits                 the number of digits to return
    *
    * @returns {String}
    *
    * @see unhex
    * @see binary
    * @see unbinary
    */
    p.hex = function(value, len) {
      if (arguments.length === 1) {
        if (value instanceof Char) {
          len = 4;
        } else { // int or byte, indistinguishable at the moment, default to 8
          len = 8;
        }
      }
      return decimalToHex(value, len);
    };

    function unhexScalar(hex) {
      var value = parseInt("0x" + hex, 16);

      // correct for int overflow java expectation
      if (value > 2147483647) {
        value -= 4294967296;
      }
      return value;
    }

    /**
    * Converts a String representation of a hexadecimal number to its equivalent integer value.
    *
    * @param {String} hex   the hex string to convert to an int
    *
    * @returns {int}
    *
    * @see hex
    * @see binary
    * @see unbinary
    */
    p.unhex = function(hex) {
      if (hex instanceof Array) {
        var arr = [];
        for (var i = 0; i < hex.length; i++) {
          arr.push(unhexScalar(hex[i]));
        }
        return arr;
      }
      return unhexScalar(hex);
    };

    // Load a file or URL into strings
    /**
    * Reads the contents of a file or url and creates a String array of its individual lines.
    * The filename parameter can also be a URL to a file found online.  If the file is not available or an error occurs,
    * null will be returned and an error message will be printed to the console. The error message does not halt
    * the program.
    *
    * @param {String} filename    name of the file or url to load
    *
    * @returns {String[]}
    *
    * @see loadBytes
    * @see saveStrings
    * @see saveBytes
    */
    p.loadStrings = function(filename) {
      if (localStorage[filename]) {
        return localStorage[filename].split("\n");
      }

      var filecontent = ajax(filename);
      if(typeof filecontent !== "string" || filecontent === "") {
        return [];
      }

      // deal with the fact that Windows uses \r\n, Unix uses \n,
      // Mac uses \r, and we actually expect \n
      filecontent = filecontent.replace(/(\r\n?)/g,"\n").replace(/\n$/,"");

      return filecontent.split("\n");
    };

    // Writes an array of strings to a file, one line per string
    /**
    * Writes an array of strings to a file, one line per string. This file is saved to the localStorage.
    *
    * @param {String} filename    name of the file to save to localStorage
    * @param {String[]} strings   string array to be written
    *
    * @see loadBytes
    * @see loadStrings
    * @see saveBytes
    */
    p.saveStrings = function(filename, strings) {
      localStorage[filename] = strings.join('\n');
    };

    /**
    * Reads the contents of a file or url and places it in a byte array. If a file is specified, it must be located in the localStorage.
    * The filename parameter can also be a URL to a file found online.
    *
    * @param {String} filename   name of a file in the localStorage or a URL.
    *
    * @returns {byte[]}
    *
    * @see loadStrings
    * @see saveStrings
    * @see saveBytes
    */
    p.loadBytes = function(url) {
      var string = ajax(url);
      var ret = [];

      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }

      return ret;
    };

    ////////////////////////////////////////////////////////////////////////////
    // String Functions
    ////////////////////////////////////////////////////////////////////////////
    /**
     * The matchAll() function is identical to match(), except that it returns an array of all matches in
     * the specified String, rather than just the first.
     *
     * @param {String} aString  the String to search inside
     * @param {String} aRegExp  the regexp to be used for matching
     *
     * @return {String[]} returns an array of matches
     *
     * @see #match
     */
    p.matchAll = function(aString, aRegExp) {
      var results = [],
          latest;
      var regexp = new RegExp(aRegExp, "g");
      while ((latest = regexp.exec(aString)) !== null) {
        results.push(latest);
        if (latest[0].length === 0) {
          ++regexp.lastIndex;
        }
      }
      return results.length > 0 ? results : null;
    };
    /**
     * The match() function matches a string with a regular expression, and returns the match as an
     * array. The first index is the matching expression, and array elements
     * [1] and higher represent each of the groups (sequences found in parens).
     *
     * @param {String} str      the String to be searched
     * @param {String} regexp   the regexp to be used for matching
     *
     * @return {String[]} an array of matching strings
     */
    p.match = function(str, regexp) {
      return str.match(regexp);
    };

    ////////////////////////////////////////////////////////////////////////////
    // Other java specific functions
    ////////////////////////////////////////////////////////////////////////////


    var logBuffer = [];

    /**
     * The println() function writes to the console area of the Processing environment.
     * Each call to this function creates a new line of output. Individual elements can be separated with quotes ("") and joined with the string concatenation operator (+).
     *
     * @param {String} message the string to write to the console
     *
     * @see #join
     * @see #print
     */
    p.println = function() {
      Processing.logger.println.apply(Processing.logger, arguments);
    };
    /**
     * The print() function writes to the console area of the Processing environment.
     *
     * @param {String} message the string to write to the console
     *
     * @see #join
     */
    p.print = function() {
      Processing.logger.print.apply(Processing.logger, arguments);
    };

    // Alphanumeric chars arguments automatically converted to numbers when
    // passed in, and will come out as numbers.
    p.str = function(val) {
      if (val instanceof Array) {
        var arr = [];
        for (var i = 0; i < val.length; i++) {
          arr.push(val[i].toString() + "");
        }
        return arr;
      }
      return (val.toString() + "");
    };


    // Conversion
    function booleanScalar(val) {
      if (typeof val === 'number') {
        return val !== 0;
      }
      if (typeof val === 'boolean') {
        return val;
      }
      if (typeof val === 'string') {
        return val.toLowerCase() === 'true';
      }
      if (val instanceof Char) {
        // 1, T or t
        return val.code === 49 || val.code === 84 || val.code === 116;
      }
    }

    /**
     * Converts the passed parameter to the function to its boolean value.
     * It will return an array of booleans if an array is passed in.
     *
     * @param {int, byte, string} val          the parameter to be converted to boolean
     * @param {int[], byte[], string[]} val    the array to be converted to boolean[]
     *
     * @return {boolean|boolean[]} returns a boolean or an array of booleans
     */
    p.parseBoolean = function (val) {
      if (val instanceof Array) {
        var ret = [];
        for (var i = 0; i < val.length; i++) {
          ret.push(booleanScalar(val[i]));
        }
        return ret;
      }
      return booleanScalar(val);
    };

    /**
     * Converts the passed parameter to the function to its byte value.
     * A byte is a number between -128 and 127.
     * It will return an array of bytes if an array is passed in.
     *
     * @param {int, char} what        the parameter to be conveted to byte
     * @param {int[], char[]} what    the array to be converted to byte[]
     *
     * @return {byte|byte[]} returns a byte or an array of bytes
     */
    p.parseByte = function(what) {
      if (what instanceof Array) {
        var bytes = [];
        for (var i = 0; i < what.length; i++) {
          bytes.push((0 - (what[i] & 0x80)) | (what[i] & 0x7F));
        }
        return bytes;
      }
      return (0 - (what & 0x80)) | (what & 0x7F);
    };

    /**
     * Converts the passed parameter to the function to its char value.
     * It will return an array of chars if an array is passed in.
     *
     * @param {int, byte} key        the parameter to be conveted to char
     * @param {int[], byte[]} key    the array to be converted to char[]
     *
     * @return {char|char[]} returns a char or an array of chars
     */
    p.parseChar = function(key) {
      if (typeof key === "number") {
        return new Char(String.fromCharCode(key & 0xFFFF));
      }
      if (key instanceof Array) {
        var ret = [];
        for (var i = 0; i < key.length; i++) {
          ret.push(new Char(String.fromCharCode(key[i] & 0xFFFF)));
        }
        return ret;
      }
      throw "char() may receive only one argument of type int, byte, int[], or byte[].";
    };

    // Processing doc claims good argument types are: int, char, byte, boolean,
    // String, int[], char[], byte[], boolean[], String[].
    // floats should not work. However, floats with only zeroes right of the
    // decimal will work because JS converts those to int.
    function floatScalar(val) {
      if (typeof val === 'number') {
        return val;
      }
      if (typeof val === 'boolean') {
        return val ? 1 : 0;
      }
      if (typeof val === 'string') {
        return parseFloat(val);
      }
      if (val instanceof Char) {
        return val.code;
      }
    }

    /**
     * Converts the passed parameter to the function to its float value.
     * It will return an array of floats if an array is passed in.
     *
     * @param {int, char, boolean, string} val            the parameter to be conveted to float
     * @param {int[], char[], boolean[], string[]} val    the array to be converted to float[]
     *
     * @return {float|float[]} returns a float or an array of floats
     */
    p.parseFloat = function(val) {
      if (val instanceof Array) {
        var ret = [];
        for (var i = 0; i < val.length; i++) {
          ret.push(floatScalar(val[i]));
        }
        return ret;
      }
      return floatScalar(val);
    };

    function intScalar(val, radix) {
      if (typeof val === 'number') {
        return val & 0xFFFFFFFF;
      }
      if (typeof val === 'boolean') {
        return val ? 1 : 0;
      }
      if (typeof val === 'string') {
        var number = parseInt(val, radix || 10); // Default to decimal radix.
        return number & 0xFFFFFFFF;
      }
      if (val instanceof Char) {
        return val.code;
      }
    }

    /**
     * Converts the passed parameter to the function to its int value.
     * It will return an array of ints if an array is passed in.
     *
     * @param {string, char, boolean, float} val            the parameter to be conveted to int
     * @param {string[], char[], boolean[], float[]} val    the array to be converted to int[]
     * @param {int} radix                                   optional the radix of the number (for js compatibility)
     *
     * @return {int|int[]} returns a int or an array of ints
     */
    p.parseInt = function(val, radix) {
      if (val instanceof Array) {
        var ret = [];
        for (var i = 0; i < val.length; i++) {
          if (typeof val[i] === 'string' && !/^\s*[+\-]?\d+\s*$/.test(val[i])) {
            ret.push(0);
          } else {
            ret.push(intScalar(val[i], radix));
          }
        }
        return ret;
      }
      return intScalar(val, radix);
    };

    p.__int_cast = function(val) {
      return 0|val;
    };

    p.__instanceof = function(obj, type) {
      if (typeof type !== "function") {
        throw "Function is expected as type argument for instanceof operator";
      }

      if (typeof obj === "string") {
        // special case for strings
        return type === Object || type === String;
      }

      if (obj instanceof type) {
        // fast check if obj is already of type instance
        return true;
      }

      if (typeof obj !== "object" || obj === null) {
        return false; // not an object or null
      }

      var objType = obj.constructor;
      if (type.$isInterface) {
        // expecting the interface
        // queueing interfaces from type and its base classes
        var interfaces = [];
        while (objType) {
          if (objType.$interfaces) {
            interfaces = interfaces.concat(objType.$interfaces);
          }
          objType = objType.$base;
        }
        while (interfaces.length > 0) {
          var i = interfaces.shift();
          if (i === type) {
            return true;
          }
          // wide search in base interfaces
          if (i.$interfaces) {
            interfaces = interfaces.concat(i.$interfaces);
          }
        }
        return false;
      }

      while (objType.hasOwnProperty("$base")) {
        objType = objType.$base;
        if (objType === type) {
          return true; // object was found
        }
      }

      return false;
    };

    /**
    * Defines the dimension of the display window in units of pixels. The size() function must
    * be the first line in setup(). If size() is not called, the default size of the window is
    * 100x100 pixels. The system variables width and height are set by the parameters passed to
    * the size() function.
    *
    * @param {int} aWidth     width of the display window in units of pixels
    * @param {int} aHeight    height of the display window in units of pixels
    * @param {MODE} aMode     Either P2D, P3D, JAVA2D, or OPENGL
    *
    * @see createGraphics
    * @see screen
    */
    DrawingShared.prototype.size = function(aWidth, aHeight, aMode) {
      if (doStroke) {
        p.stroke(0);
      }

      if (doFill) {
        p.fill(255);
      }

      // The default 2d context has already been created in the p.init() stage if
      // a 3d context was not specified. This is so that a 2d context will be
      // available if size() was not called.
      var savedProperties = {
        fillStyle: curContext.fillStyle,
        strokeStyle: curContext.strokeStyle,
        lineCap: curContext.lineCap,
        lineJoin: curContext.lineJoin
      };
      // remove the style width and height properties to ensure that the canvas gets set to
      // aWidth and aHeight coming in
      if (curElement.style.length > 0 ) {
        curElement.style.removeProperty("width");
        curElement.style.removeProperty("height");
      }

      curElement.width = p.width = aWidth || 100;
      curElement.height = p.height = aHeight || 100;

      for (var prop in savedProperties) {
        if (savedProperties.hasOwnProperty(prop)) {
          curContext[prop] = savedProperties[prop];
        }
      }

      // make sure to set the default font the first time round.
      p.textFont(curTextFont);

      // Set the background to whatever it was called last as if background() was called before size()
      // If background() hasn't been called before, set background() to a light gray
      p.background();

      // set 5% for pixels to cache (or 1000)
      maxPixelsCached = Math.max(1000, aWidth * aHeight * 0.05);

      // Externalize the context
      p.externals.context = curContext;

      for (var i = 0; i < PConstants.SINCOS_LENGTH; i++) {
        sinLUT[i] = p.sin(i * (PConstants.PI / 180) * 0.5);
        cosLUT[i] = p.cos(i * (PConstants.PI / 180) * 0.5);
      }
    };

    Drawing2D.prototype.size = function(aWidth, aHeight, aMode) {
      if (curContext === undef) {
        // size() was called without p.init() default context, i.e. p.createGraphics()
        curContext = curElement.getContext("2d");
        userMatrixStack = new PMatrixStack();
        userReverseMatrixStack = new PMatrixStack();
        modelView = new PMatrix2D();
        modelViewInv = new PMatrix2D();
      }

      DrawingShared.prototype.size.apply(this, arguments);
    };

    Drawing3D.prototype.size = (function() {
      var size3DCalled = false;

      return function size(aWidth, aHeight, aMode) {
        if (size3DCalled) {
          throw "Multiple calls to size() for 3D renders are not allowed.";
        }
        size3DCalled = true;

        function getGLContext(canvas) {
          var ctxNames = ['experimental-webgl', 'webgl', 'webkit-3d'],
              gl;

          for (var i=0, l=ctxNames.length; i<l; i++) {
            gl = canvas.getContext(ctxNames[i], {antialias: false, preserveDrawingBuffer: true});
            if (gl) {
              break;
            }
          }

          return gl;
        }

        // Get the 3D rendering context.
        try {
          // If the HTML <canvas> dimensions differ from the
          // dimensions specified in the size() call in the sketch, for
          // 3D sketches, browsers will either not render or render the
          // scene incorrectly. To fix this, we need to adjust the
          // width and height attributes of the canvas.
          curElement.width = p.width = aWidth || 100;
          curElement.height = p.height = aHeight || 100;
          curContext = getGLContext(curElement);
          canTex = curContext.createTexture();
          textTex = curContext.createTexture();
        } catch(e_size) {
          Processing.debug(e_size);
        }

        if (!curContext) {
          throw "WebGL context is not supported on this browser.";
        }

        // Set defaults
        curContext.viewport(0, 0, curElement.width, curElement.height);
        curContext.enable(curContext.DEPTH_TEST);
        curContext.enable(curContext.BLEND);
        curContext.blendFunc(curContext.SRC_ALPHA, curContext.ONE_MINUS_SRC_ALPHA);

        // Create the program objects to render 2D (points, lines) and
        // 3D (spheres, boxes) shapes. Because 2D shapes are not lit,
        // lighting calculations are ommitted from this program object.
        programObject2D = createProgramObject(curContext, vertexShaderSrc2D, fragmentShaderSrc2D);

        programObjectUnlitShape = createProgramObject(curContext, vertexShaderSrcUnlitShape, fragmentShaderSrcUnlitShape);

        // Set the default point and line width for the 2D and unlit shapes.
        p.strokeWeight(1);

        // Now that the programs have been compiled, we can set the default
        // states for the lights.
        programObject3D = createProgramObject(curContext, vertexShaderSrc3D, fragmentShaderSrc3D);
        curContext.useProgram(programObject3D);

        // Assume we aren't using textures by default.
        uniformi("usingTexture3d", programObject3D, "usingTexture", usingTexture);

        // Set some defaults.
        p.lightFalloff(1, 0, 0);
        p.shininess(1);
        p.ambient(255, 255, 255);
        p.specular(0, 0, 0);
        p.emissive(0, 0, 0);

        // Create buffers for 3D primitives
        boxBuffer = curContext.createBuffer();
        curContext.bindBuffer(curContext.ARRAY_BUFFER, boxBuffer);
        curContext.bufferData(curContext.ARRAY_BUFFER, boxVerts, curContext.STATIC_DRAW);

        boxNormBuffer = curContext.createBuffer();
        curContext.bindBuffer(curContext.ARRAY_BUFFER, boxNormBuffer);
        curContext.bufferData(curContext.ARRAY_BUFFER, boxNorms, curContext.STATIC_DRAW);

        boxOutlineBuffer = curContext.createBuffer();
        curContext.bindBuffer(curContext.ARRAY_BUFFER, boxOutlineBuffer);
        curContext.bufferData(curContext.ARRAY_BUFFER, boxOutlineVerts, curContext.STATIC_DRAW);

        // used to draw the rectangle and the outline
        rectBuffer = curContext.createBuffer();
        curContext.bindBuffer(curContext.ARRAY_BUFFER, rectBuffer);
        curContext.bufferData(curContext.ARRAY_BUFFER, rectVerts, curContext.STATIC_DRAW);

        rectNormBuffer = curContext.createBuffer();
        curContext.bindBuffer(curContext.ARRAY_BUFFER, rectNormBuffer);
        curContext.bufferData(curContext.ARRAY_BUFFER, rectNorms, curContext.STATIC_DRAW);

        // The sphere vertices are specified dynamically since the user
        // can change the level of detail. Everytime the user does that
        // using sphereDetail(), the new vertices are calculated.
        sphereBuffer = curContext.createBuffer();

        lineBuffer = curContext.createBuffer();

        // Shape buffers
        fillBuffer = curContext.createBuffer();
        fillColorBuffer = curContext.createBuffer();
        strokeColorBuffer = curContext.createBuffer();
        shapeTexVBO = curContext.createBuffer();

        pointBuffer = curContext.createBuffer();
        curContext.bindBuffer(curContext.ARRAY_BUFFER, pointBuffer);
        curContext.bufferData(curContext.ARRAY_BUFFER, new Float32Array([0, 0, 0]), curContext.STATIC_DRAW);

        textBuffer = curContext.createBuffer();
        curContext.bindBuffer(curContext.ARRAY_BUFFER, textBuffer );
        curContext.bufferData(curContext.ARRAY_BUFFER, new Float32Array([1,1,0,-1,1,0,-1,-1,0,1,-1,0]), curContext.STATIC_DRAW);

        textureBuffer = curContext.createBuffer();
        curContext.bindBuffer(curContext.ARRAY_BUFFER, textureBuffer);
        curContext.bufferData(curContext.ARRAY_BUFFER, new Float32Array([0,0,1,0,1,1,0,1]), curContext.STATIC_DRAW);

        indexBuffer = curContext.createBuffer();
        curContext.bindBuffer(curContext.ELEMENT_ARRAY_BUFFER, indexBuffer);
        curContext.bufferData(curContext.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,2,2,3,0]), curContext.STATIC_DRAW);

        cam = new PMatrix3D();
        cameraInv = new PMatrix3D();
        modelView = new PMatrix3D();
        modelViewInv = new PMatrix3D();
        projection = new PMatrix3D();
        p.camera();
        p.perspective();

        userMatrixStack = new PMatrixStack();
        userReverseMatrixStack = new PMatrixStack();
        // used by both curve and bezier, so just init here
        curveBasisMatrix = new PMatrix3D();
        curveToBezierMatrix = new PMatrix3D();
        curveDrawMatrix = new PMatrix3D();
        bezierDrawMatrix = new PMatrix3D();
        bezierBasisInverse = new PMatrix3D();
        bezierBasisMatrix = new PMatrix3D();
        bezierBasisMatrix.set(-1, 3, -3, 1, 3, -6, 3, 0, -3, 3, 0, 0, 1, 0, 0, 0);

        DrawingShared.prototype.size.apply(this, arguments);
      };
    }());

    ////////////////////////////////////////////////////////////////////////////
    // Lights
    ////////////////////////////////////////////////////////////////////////////

    /**
     * Adds an ambient light. Ambient light doesn't come from a specific direction,
     * the rays have light have bounced around so much that objects are evenly lit
     * from all sides. Ambient lights are almost always used in combination with
     * other types of lights. Lights need to be included in the <b>draw()</b> to
     * remain persistent in a looping program. Placing them in the <b>setup()</b>
     * of a looping program will cause them to only have an effect the first time
     * through the loop. The effect of the parameters is determined by the current
     * color mode.
     *
     * @param {int | float} r red or hue value
     * @param {int | float} g green or hue value
     * @param {int | float} b blue or hue value
     *
     * @param {int | float} x x position of light (used for falloff)
     * @param {int | float} y y position of light (used for falloff)
     * @param {int | float} z z position of light (used for falloff)
     *
     * @returns none
     *
     * @see lights
     * @see directionalLight
     * @see pointLight
     * @see spotLight
    */
    Drawing2D.prototype.ambientLight = DrawingShared.prototype.a3DOnlyFunction;

    Drawing3D.prototype.ambientLight = function(r, g, b, x, y, z) {
      if (lightCount === PConstants.MAX_LIGHTS) {
        throw "can only create " + PConstants.MAX_LIGHTS + " lights";
      }

      var pos = new PVector(x, y, z);
      var view = new PMatrix3D();
      view.scale(1, -1, 1);
      view.apply(modelView.array());
      view.mult(pos, pos);

      // Instead of calling p.color, we do the calculations ourselves to
      // reduce property lookups.
      var col = color$4(r, g, b, 0);
      var normalizedCol = [ ((col & PConstants.RED_MASK) >>> 16) / 255,
                            ((col & PConstants.GREEN_MASK) >>> 8) / 255,
                             (col & PConstants.BLUE_MASK) / 255 ];

      curContext.useProgram(programObject3D);
      uniformf("uLights.color.3d." + lightCount, programObject3D, "uLights" + lightCount + ".color", normalizedCol);
      uniformf("uLights.position.3d." + lightCount, programObject3D, "uLights" + lightCount + ".position", pos.array());
      uniformi("uLights.type.3d." + lightCount, programObject3D, "uLights" + lightCount + ".type", 0);
      uniformi("uLightCount3d", programObject3D, "uLightCount", ++lightCount);
    };

    /**
     * Adds a directional light. Directional light comes from one direction and
     * is stronger when hitting a surface squarely and weaker if it hits at a
     * gentle angle. After hitting a surface, a directional lights scatters in
     * all directions. Lights need to be included in the <b>draw()</b> to remain
     * persistent in a looping program. Placing them in the <b>setup()</b> of a
     * looping program will cause them to only have an effect the first time
     * through the loop. The affect of the <br>r</b>, <br>g</b>, and <br>b</b>
     * parameters is determined by the current color mode. The <b>nx</b>,
     * <b>ny</b>, and <b>nz</b> parameters specify the direction the light is
     * facing. For example, setting <b>ny</b> to -1 will cause the geometry to be
     * lit from below (the light is facing directly upward).
     *
     * @param {int | float} r red or hue value
     * @param {int | float} g green or hue value
     * @param {int | float} b blue or hue value
     *
     * @param {int | float} nx direction along the x axis
     * @param {int | float} ny direction along the y axis
     * @param {int | float} nz direction along the z axis
     *
     * @returns none
     *
     * @see lights
     * @see ambientLight
     * @see pointLight
     * @see spotLight
    */
    Drawing2D.prototype.directionalLight = DrawingShared.prototype.a3DOnlyFunction;

    Drawing3D.prototype.directionalLight = function(r, g, b, nx, ny, nz) {
      if (lightCount === PConstants.MAX_LIGHTS) {
        throw "can only create " + PConstants.MAX_LIGHTS + " lights";
      }

      curContext.useProgram(programObject3D);

      var mvm = new PMatrix3D();
      mvm.scale(1, -1, 1);
      mvm.apply(modelView.array());
      mvm = mvm.array();

      // We need to multiply the direction by the model view matrix, but
      // the mult function checks the w component of the vector, if it isn't
      // present, it uses 1, so we manually multiply.
      var dir = [
        mvm[0] * nx + mvm[4] * ny + mvm[8] * nz,
        mvm[1] * nx + mvm[5] * ny + mvm[9] * nz,
        mvm[2] * nx + mvm[6] * ny + mvm[10] * nz
      ];

      // Instead of calling p.color, we do the calculations ourselves to
      // reduce property lookups.
      var col = color$4(r, g, b, 0);
      var normalizedCol = [ ((col & PConstants.RED_MASK) >>> 16) / 255,
                            ((col & PConstants.GREEN_MASK) >>> 8) / 255,
                             (col & PConstants.BLUE_MASK) / 255 ];

      uniformf("uLights.color.3d." + lightCount, programObject3D, "uLights" + lightCount + ".color", normalizedCol);
      uniformf("uLights.position.3d." + lightCount, programObject3D, "uLights" + lightCount + ".position", dir);
      uniformi("uLights.type.3d." + lightCount, programObject3D, "uLights" + lightCount + ".type", 1);
      uniformi("uLightCount3d", programObject3D, "uLightCount", ++lightCount);
    };

    /**
     * Sets the falloff rates for point lights, spot lights, and ambient lights.
     * The parameters are used to determine the falloff with the following equation:
     *
     * d = distance from light position to vertex position
     * falloff = 1 / (CONSTANT + d * LINEAR + (d*d) * QUADRATIC)
     *
     * Like <b>fill()</b>, it affects only the elements which are created after it in the
     * code. The default value if <b>LightFalloff(1.0, 0.0, 0.0)</b>. Thinking about an
     * ambient light with a falloff can be tricky. It is used, for example, if you
     * wanted a region of your scene to be lit ambiently one color and another region
     * to be lit ambiently by another color, you would use an ambient light with location
     * and falloff. You can think of it as a point light that doesn't care which direction
     * a surface is facing.
     *
     * @param {int | float} constant constant value for determining falloff
     * @param {int | float} linear linear value for determining falloff
     * @param {int | float} quadratic quadratic value for determining falloff
     *
     * @returns none
     *
     * @see lights
     * @see ambientLight
     * @see pointLight
     * @see spotLight
     * @see lightSpecular
    */
    Drawing2D.prototype.lightFalloff = DrawingShared.prototype.a3DOnlyFunction;

    Drawing3D.prototype.lightFalloff = function(constant, linear, quadratic) {
      curContext.useProgram(programObject3D);
      uniformf("uFalloff3d", programObject3D, "uFalloff", [constant, linear, quadratic]);
    };

    /**
     * Sets the specular color for lights. Like <b>fill()</b>, it affects only the
     * elements which are created after it in the code. Specular refers to light
     * which bounces off a surface in a perferred direction (rather than bouncing
     * in all directions like a diffuse light) and is used for creating highlights.
     * The specular quality of a light interacts with the specular material qualities
     * set through the <b>specular()</b> and <b>shininess()</b> functions.
     *
     * @param {int | float} r red or hue value
     * @param {int | float} g green or hue value
     * @param {int | float} b blue or hue value
     *
     * @returns none
     *
     * @see lights
     * @see ambientLight
     * @see pointLight
     * @see spotLight
    */
    Drawing2D.prototype.lightSpecular = DrawingShared.prototype.a3DOnlyFunction;

    Drawing3D.prototype.lightSpecular = function(r, g, b) {

      // Instead of calling p.color, we do the calculations ourselves to
      // reduce property lookups.
      var col = color$4(r, g, b, 0);
      var normalizedCol = [ ((col & PConstants.RED_MASK) >>> 16) / 255,
                            ((col & PConstants.GREEN_MASK) >>> 8) / 255,
                             (col & PConstants.BLUE_MASK) / 255 ];

      curContext.useProgram(programObject3D);
      uniformf("uSpecular3d", programObject3D, "uSpecular", normalizedCol);
    };

    /**
     * Sets the default ambient light, directional light, falloff, and specular
     * values. The defaults are ambientLight(128, 128, 128) and
     * directionalLight(128, 128, 128, 0, 0, -1), lightFalloff(1, 0, 0), and
     * lightSpecular(0, 0, 0). Lights need to be included in the draw() to remain
     * persistent in a looping program. Placing them in the setup() of a looping
     * program will cause them to only have an effect the first time through the
     * loop.
     *
     * @returns none
     *
     * @see ambientLight
     * @see directionalLight
     * @see pointLight
     * @see spotLight
     * @see noLights
     *
    */
    p.lights = function() {
      p.ambientLight(128, 128, 128);
      p.directionalLight(128, 128, 128, 0, 0, -1);
      p.lightFalloff(1, 0, 0);
      p.lightSpecular(0, 0, 0);
    };

    /**
     * Adds a point light. Lights need to be included in the <b>draw()</b> to remain
     * persistent in a looping program. Placing them in the <b>setup()</b> of a
     * looping program will cause them to only have an effect the first time through
     * the loop. The affect of the <b>r</b>, <b>g</b>, and <b>b</b> parameters
     * is determined by the current color mode. The <b>x</b>, <b>y</b>, and <b>z</b>
     * parameters set the position of the light.
     *
     * @param {int | float} r red or hue value
     * @param {int | float} g green or hue value
     * @param {int | float} b blue or hue value
     * @param {int | float} x x coordinate of the light
     * @param {int | float} y y coordinate of the light
     * @param {int | float} z z coordinate of the light
     *
     * @returns none
     *
     * @see lights
     * @see directionalLight
     * @see ambientLight
     * @see spotLight
    */
    Drawing2D.prototype.pointLight = DrawingShared.prototype.a3DOnlyFunction;

    Drawing3D.prototype.pointLight = function(r, g, b, x, y, z) {
      if (lightCount === PConstants.MAX_LIGHTS) {
        throw "can only create " + PConstants.MAX_LIGHTS + " lights";
      }

      // Place the point in view space once instead of once per vertex
      // in the shader.
      var pos = new PVector(x, y, z);
      var view = new PMatrix3D();
      view.scale(1, -1, 1);
      view.apply(modelView.array());
      view.mult(pos, pos);

      // Instead of calling p.color, we do the calculations ourselves to
      // reduce property lookups.
      var col = color$4(r, g, b, 0);
      var normalizedCol = [ ((col & PConstants.RED_MASK) >>> 16) / 255,
                            ((col & PConstants.GREEN_MASK) >>> 8) / 255,
                             (col & PConstants.BLUE_MASK) / 255 ];

      curContext.useProgram(programObject3D);
      uniformf("uLights.color.3d." + lightCount, programObject3D, "uLights" + lightCount + ".color", normalizedCol);
      uniformf("uLights.position.3d." + lightCount, programObject3D, "uLights" + lightCount + ".position", pos.array());
      uniformi("uLights.type.3d." + lightCount, programObject3D, "uLights" + lightCount + ".type", 2);
      uniformi("uLightCount3d", programObject3D, "uLightCount", ++lightCount);
    };

    /**
     * Disable all lighting. Lighting is turned off by default and enabled with
     * the lights() method. This function can be used to disable lighting so
     * that 2D geometry (which does not require lighting) can be drawn after a
     * set of lighted 3D geometry.
     *
     * @returns none
     *
     * @see lights
    */
    Drawing2D.prototype.noLights = DrawingShared.prototype.a3DOnlyFunction;

    Drawing3D.prototype.noLights = function() {
      lightCount = 0;
      curContext.useProgram(programObject3D);
      uniformi("uLightCount3d", programObject3D, "uLightCount", lightCount);
    };

    /**
     * Adds a spot light. Lights need to be included in the <b>draw()</b> to
     * remain persistent in a looping program. Placing them in the <b>setup()</b>
     * of a looping program will cause them to only have an effect the first time
     * through the loop. The affect of the <b>r</b>, <b>g</b>, and <b>b</b> parameters
     * is determined by the current color mode. The <b>x</b>, <b>y</b>, and <b>z</b>
     * parameters specify the position of the light and <b>nx</b>, <b>ny</b>, <b>nz</b>
     * specify the direction or light. The angle parameter affects <b>angle</b> of the
     * spotlight cone.
     *
     * @param {int | float} r red or hue value
     * @param {int | float} g green or hue value
     * @param {int | float} b blue or hue value
     * @param {int | float} x coordinate of the light
     * @param {int | float} y coordinate of the light
     * @param {int | float} z coordinate of the light
     * @param {int | float} nx direction along the x axis
     * @param {int | float} ny direction along the y axis
     * @param {int | float} nz direction along the z axis
     * @param {float} angle angle of the spotlight cone
     * @param {float} concentration exponent determining the center bias of the cone
     *
     * @returns none
     *
     * @see lights
     * @see directionalLight
     * @see ambientLight
     * @see pointLight
    */
    Drawing2D.prototype.spotLight = DrawingShared.prototype.a3DOnlyFunction;

    Drawing3D.prototype.spotLight = function(r, g, b, x, y, z, nx, ny, nz, angle, concentration) {
      if (lightCount === PConstants.MAX_LIGHTS) {
        throw "can only create " + PConstants.MAX_LIGHTS + " lights";
      }

      curContext.useProgram(programObject3D);

      // multiply the position and direction by the model view matrix
      // once per object rather than once per vertex.
      var pos = new PVector(x, y, z);
      var mvm = new PMatrix3D();
      mvm.scale(1, -1, 1);
      mvm.apply(modelView.array());
      mvm.mult(pos, pos);

      // Convert to array since we need to directly access the elements.
      mvm = mvm.array();

      // We need to multiply the direction by the model view matrix, but
      // the mult function checks the w component of the vector, if it isn't
      // present, it uses 1, so we use a very small value as a work around.
      var dir = [
          mvm[0] * nx + mvm[4] * ny + mvm[8] * nz,
          mvm[1] * nx + mvm[5] * ny + mvm[9] * nz,
          mvm[2] * nx + mvm[6] * ny + mvm[10] * nz
      ];

      // Instead of calling p.color, we do the calculations ourselves to
      // reduce property lookups.
      var col = color$4(r, g, b, 0);
      var normalizedCol = [ ((col & PConstants.RED_MASK) >>> 16) / 255,
                            ((col & PConstants.GREEN_MASK) >>> 8) / 255,
                             (col & PConstants.BLUE_MASK) / 255 ];

      uniformf("uLights.color.3d." + lightCount, programObject3D, "uLights" + lightCount + ".color", normalizedCol);
      uniformf("uLights.position.3d." + lightCount, programObject3D, "uLights" + lightCount + ".position", pos.array());
      uniformf("uLights.direction.3d." + lightCount, programObject3D, "uLights" + lightCount + ".direction", dir);
      uniformf("uLights.concentration.3d." + lightCount, programObject3D, "uLights" + lightCount + ".concentration", concentration);
      uniformf("uLights.angle.3d." + lightCount, programObject3D, "uLights" + lightCount + ".angle", angle);
      uniformi("uLights.type.3d." + lightCount, programObject3D, "uLights" + lightCount + ".type", 3);
      uniformi("uLightCount3d", programObject3D, "uLightCount", ++lightCount);
    };

    ////////////////////////////////////////////////////////////////////////////
    // Camera functions
    ////////////////////////////////////////////////////////////////////////////

    /**
     * The <b>beginCamera()</b> and <b>endCamera()</b> functions enable advanced customization of the camera space.
     * The functions are useful if you want to more control over camera movement, however for most users, the <b>camera()</b>
     * function will be sufficient.<br /><br />The camera functions will replace any transformations (such as <b>rotate()</b>
     * or <b>translate()</b>) that occur before them in <b>draw()</b>, but they will not automatically replace the camera
     * transform itself. For this reason, camera functions should be placed at the beginning of <b>draw()</b> (so that
     * transformations happen afterwards), and the <b>camera()</b> function can be used after <b>beginCamera()</b> if
     * you want to reset the camera before applying transformations.<br /><br />This function sets the matrix mode to the
     * camera matrix so calls such as <b>translate()</b>, <b>rotate()</b>, applyMatrix() and resetMatrix() affect the camera.
     * <b>beginCamera()</b> should always be used with a following <b>endCamera()</b> and pairs of <b>beginCamera()</b> and
     * <b>endCamera()</b> cannot be nested.
     *
     * @see camera
     * @see endCamera
     * @see applyMatrix
     * @see resetMatrix
     * @see translate
     * @see rotate
     * @see scale
     */
    Drawing2D.prototype.beginCamera = function() {
      throw ("beginCamera() is not available in 2D mode");
    };

    Drawing3D.prototype.beginCamera = function() {
      if (manipulatingCamera) {
        throw ("You cannot call beginCamera() again before calling endCamera()");
      }
      manipulatingCamera = true;
      modelView = cameraInv;
      modelViewInv = cam;
    };

    /**
     * The <b>beginCamera()</b> and <b>endCamera()</b> functions enable advanced customization of the camera space.
     * Please see the reference for <b>beginCamera()</b> for a description of how the functions are used.
     *
     * @see beginCamera
     */
    Drawing2D.prototype.endCamera = function() {
      throw ("endCamera() is not available in 2D mode");
    };

    Drawing3D.prototype.endCamera = function() {
      if (!manipulatingCamera) {
        throw ("You cannot call endCamera() before calling beginCamera()");
      }
      modelView.set(cam);
      modelViewInv.set(cameraInv);
      manipulatingCamera = false;
    };

    /**
     * Sets the position of the camera through setting the eye position, the center of the scene, and which axis is facing
     * upward. Moving the eye position and the direction it is pointing (the center of the scene) allows the images to be
     * seen from different angles. The version without any parameters sets the camera to the default position, pointing to
     * the center of the display window with the Y axis as up. The default values are camera(width/2.0, height/2.0,
     * (height/2.0) / tan(PI*60.0 / 360.0), width/2.0, height/2.0, 0, 0, 1, 0). This function is similar to gluLookAt()
     * in OpenGL, but it first clears the current camera settings.
     *
     * @param {float} eyeX    x-coordinate for the eye
     * @param {float} eyeY    y-coordinate for the eye
     * @param {float} eyeZ    z-coordinate for the eye
     * @param {float} centerX x-coordinate for the center of the scene
     * @param {float} centerY y-coordinate for the center of the scene
     * @param {float} centerZ z-coordinate for the center of the scene
     * @param {float} upX     usually 0.0, 1.0, -1.0
     * @param {float} upY     usually 0.0, 1.0, -1.0
     * @param {float} upZ     usually 0.0, 1.0, -1.0
     *
     * @see beginCamera
     * @see endCamera
     * @see frustum
     */
    p.camera = function(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ) {
      if (eyeX === undef) {
        // Workaround if createGraphics is used.
        cameraX = p.width / 2;
        cameraY = p.height / 2;
        cameraZ = cameraY / Math.tan(cameraFOV / 2);
        eyeX = cameraX;
        eyeY = cameraY;
        eyeZ = cameraZ;
        centerX = cameraX;
        centerY = cameraY;
        centerZ = 0;
        upX = 0;
        upY = 1;
        upZ = 0;
      }

      var z = new PVector(eyeX - centerX, eyeY - centerY, eyeZ - centerZ);
      var y = new PVector(upX, upY, upZ);
      z.normalize();
      var x = PVector.cross(y, z);
      y = PVector.cross(z, x);
      x.normalize();
      y.normalize();

      var xX = x.x,
          xY = x.y,
          xZ = x.z;

      var yX = y.x,
          yY = y.y,
          yZ = y.z;

      var zX = z.x,
          zY = z.y,
          zZ = z.z;

      cam.set(xX, xY, xZ, 0, yX, yY, yZ, 0, zX, zY, zZ, 0, 0, 0, 0, 1);

      cam.translate(-eyeX, -eyeY, -eyeZ);

      cameraInv.reset();
      cameraInv.invApply(xX, xY, xZ, 0, yX, yY, yZ, 0, zX, zY, zZ, 0, 0, 0, 0, 1);

      cameraInv.translate(eyeX, eyeY, eyeZ);

      modelView.set(cam);
      modelViewInv.set(cameraInv);
    };

    /**
     * Sets a perspective projection applying foreshortening, making distant objects appear smaller than closer ones. The
     * parameters define a viewing volume with the shape of truncated pyramid. Objects near to the front of the volume appear
     * their actual size, while farther objects appear smaller. This projection simulates the perspective of the world more
     * accurately than orthographic projection. The version of perspective without parameters sets the default perspective and
     * the version with four parameters allows the programmer to set the area precisely. The default values are:
     * perspective(PI/3.0, width/height, cameraZ/10.0, cameraZ*10.0) where cameraZ is ((height/2.0) / tan(PI*60.0/360.0));
     *
     * @param {float} fov     field-of-view angle (in radians) for vertical direction
     * @param {float} aspect  ratio of width to height
     * @param {float} zNear   z-position of nearest clipping plane
     * @param {float} zFar    z-positions of farthest clipping plane
     */
    p.perspective = function(fov, aspect, near, far) {
      if (arguments.length === 0) {
        //in case canvas is resized
        cameraY = curElement.height / 2;
        cameraZ = cameraY / Math.tan(cameraFOV / 2);
        cameraNear = cameraZ / 10;
        cameraFar = cameraZ * 10;
        cameraAspect = p.width / p.height;
        fov = cameraFOV;
        aspect = cameraAspect;
        near = cameraNear;
        far = cameraFar;
      }

      var yMax, yMin, xMax, xMin;
      yMax = near * Math.tan(fov / 2);
      yMin = -yMax;
      xMax = yMax * aspect;
      xMin = yMin * aspect;
      p.frustum(xMin, xMax, yMin, yMax, near, far);
    };

    /**
     * Sets a perspective matrix defined through the parameters. Works like glFrustum, except it wipes out the current
     * perspective matrix rather than muliplying itself with it.
     *
     * @param {float} left   left coordinate of the clipping plane
     * @param {float} right  right coordinate of the clipping plane
     * @param {float} bottom bottom coordinate of the clipping plane
     * @param {float} top    top coordinate of the clipping plane
     * @param {float} near   near coordinate of the clipping plane
     * @param {float} far    far coordinate of the clipping plane
     *
     * @see beginCamera
     * @see camera
     * @see endCamera
     * @see perspective
     */
    Drawing2D.prototype.frustum = function() {
      throw("Processing.js: frustum() is not supported in 2D mode");
    };

    Drawing3D.prototype.frustum = function(left, right, bottom, top, near, far) {
      frustumMode = true;
      projection = new PMatrix3D();
      projection.set((2 * near) / (right - left), 0, (right + left) / (right - left),
                     0, 0, (2 * near) / (top - bottom), (top + bottom) / (top - bottom),
                     0, 0, 0, -(far + near) / (far - near), -(2 * far * near) / (far - near),
                     0, 0, -1, 0);
      var proj = new PMatrix3D();
      proj.set(projection);
      proj.transpose();
      curContext.useProgram(programObject2D);
      uniformMatrix("projection2d", programObject2D, "uProjection", false, proj.array());
      curContext.useProgram(programObject3D);
      uniformMatrix("projection3d", programObject3D, "uProjection", false, proj.array());
      curContext.useProgram(programObjectUnlitShape);
      uniformMatrix("uProjectionUS", programObjectUnlitShape, "uProjection", false, proj.array());
    };

    /**
     * Sets an orthographic projection and defines a parallel clipping volume. All objects with the same dimension appear
     * the same size, regardless of whether they are near or far from the camera. The parameters to this function specify
     * the clipping volume where left and right are the minimum and maximum x values, top and bottom are the minimum and
     * maximum y values, and near and far are the minimum and maximum z values. If no parameters are given, the default
     * is used: ortho(0, width, 0, height, -10, 10).
     *
     * @param {float} left   left plane of the clipping volume
     * @param {float} right  right plane of the clipping volume
     * @param {float} bottom bottom plane of the clipping volume
     * @param {float} top    top plane of the clipping volume
     * @param {float} near   maximum distance from the origin to the viewer
     * @param {float} far    maximum distance from the origin away from the viewer
     */
    p.ortho = function(left, right, bottom, top, near, far) {
      if (arguments.length === 0) {
        left = 0;
        right = p.width;
        bottom = 0;
        top = p.height;
        near = -10;
        far = 10;
      }

      var x = 2 / (right - left);
      var y = 2 / (top - bottom);
      var z = -2 / (far - near);

      var tx = -(right + left) / (right - left);
      var ty = -(top + bottom) / (top - bottom);
      var tz = -(far + near) / (far - near);

      projection = new PMatrix3D();
      projection.set(x, 0, 0, tx, 0, y, 0, ty, 0, 0, z, tz, 0, 0, 0, 1);

      var proj = new PMatrix3D();
      proj.set(projection);
      proj.transpose();
      curContext.useProgram(programObject2D);
      uniformMatrix("projection2d", programObject2D, "uProjection", false, proj.array());
      curContext.useProgram(programObject3D);
      uniformMatrix("projection3d", programObject3D, "uProjection", false, proj.array());
      curContext.useProgram(programObjectUnlitShape);
      uniformMatrix("uProjectionUS", programObjectUnlitShape, "uProjection", false, proj.array());
      frustumMode = false;
    };
    /**
     * The printProjection() prints the current projection matrix to the text window.
     */
    p.printProjection = function() {
      projection.print();
    };
    /**
     * The printCamera() function prints the current camera matrix.
     */
    p.printCamera = function() {
      cam.print();
    };

    ////////////////////////////////////////////////////////////////////////////
    // Shapes
    ////////////////////////////////////////////////////////////////////////////
    /**
     * The box() function renders a box. A box is an extruded rectangle. A box with equal dimension on all sides is a cube.
     * Calling this function with only one parameter will create a cube.
     *
     * @param {int|float} w  dimension of the box in the x-dimension
     * @param {int|float} h  dimension of the box in the y-dimension
     * @param {int|float} d  dimension of the box in the z-dimension
     */
    Drawing2D.prototype.box = DrawingShared.prototype.a3DOnlyFunction;

    Drawing3D.prototype.box = function(w, h, d) {
      // user can uniformly scale the box by
      // passing in only one argument.
      if (!h || !d) {
        h = d = w;
      }

      // Modeling transformation
      var model = new PMatrix3D();
      model.scale(w, h, d);

      // Viewing transformation needs to have Y flipped
      // becuase that's what Processing does.
      var view = new PMatrix3D();
      view.scale(1, -1, 1);
      view.apply(modelView.array());
      view.transpose();

      if (doFill) {
        curContext.useProgram(programObject3D);
        uniformMatrix("model3d", programObject3D, "uModel", false, model.array());
        uniformMatrix("view3d", programObject3D, "uView", false, view.array());
        // Fix stitching problems. (lines get occluded by triangles
        // since they share the same depth values). This is not entirely
        // working, but it's a start for drawing the outline. So
        // developers can start playing around with styles.
        curContext.enable(curContext.POLYGON_OFFSET_FILL);
        curContext.polygonOffset(1, 1);
        uniformf("color3d", programObject3D, "uColor", fillStyle);

        // Calculating the normal matrix can be expensive, so only
        // do it if it's necessary.
        if(lightCount > 0){
          // Create the normal transformation matrix.
          var v = new PMatrix3D();
          v.set(view);

          var m = new PMatrix3D();
          m.set(model);

          v.mult(m);

          var normalMatrix = new PMatrix3D();
          normalMatrix.set(v);
          normalMatrix.invert();
          normalMatrix.transpose();

          uniformMatrix("uNormalTransform3d", programObject3D, "uNormalTransform", false, normalMatrix.array());
          vertexAttribPointer("aNormal3d", programObject3D, "aNormal", 3, boxNormBuffer);
        }
        else{
          disableVertexAttribPointer("aNormal3d", programObject3D, "aNormal");
        }

        vertexAttribPointer("aVertex3d", programObject3D, "aVertex", 3, boxBuffer);

        // Turn off per vertex colors.
        disableVertexAttribPointer("aColor3d", programObject3D, "aColor");
        disableVertexAttribPointer("aTexture3d", programObject3D, "aTexture");

        curContext.drawArrays(curContext.TRIANGLES, 0, boxVerts.length / 3);
        curContext.disable(curContext.POLYGON_OFFSET_FILL);
      }

      // Draw the box outline.
      if (lineWidth > 0 && doStroke) {
        curContext.useProgram(programObject2D);
        uniformMatrix("uModel2d", programObject2D, "uModel", false, model.array());
        uniformMatrix("uView2d", programObject2D, "uView", false, view.array());
        uniformf("uColor2d", programObject2D, "uColor", strokeStyle);
        uniformi("uIsDrawingText2d", programObject2D, "uIsDrawingText", false);
        vertexAttribPointer("vertex2d", programObject2D, "aVertex", 3, boxOutlineBuffer);
        disableVertexAttribPointer("aTextureCoord2d", programObject2D, "aTextureCoord");
        curContext.drawArrays(curContext.LINES, 0, boxOutlineVerts.length / 3);
      }
    };

    /**
     * The initSphere() function is a helper function used by <b>sphereDetail()</b>
     * This function creates and stores sphere vertices every time the user changes sphere detail.
     *
     * @see #sphereDetail
     */
    var initSphere = function() {
      var i;
      sphereVerts = [];

      for (i = 0; i < sphereDetailU; i++) {
        sphereVerts.push(0);
        sphereVerts.push(-1);
        sphereVerts.push(0);
        sphereVerts.push(sphereX[i]);
        sphereVerts.push(sphereY[i]);
        sphereVerts.push(sphereZ[i]);
      }
      sphereVerts.push(0);
      sphereVerts.push(-1);
      sphereVerts.push(0);
      sphereVerts.push(sphereX[0]);
      sphereVerts.push(sphereY[0]);
      sphereVerts.push(sphereZ[0]);

      var v1, v11, v2;

      // middle rings
      var voff = 0;
      for (i = 2; i < sphereDetailV; i++) {
        v1 = v11 = voff;
        voff += sphereDetailU;
        v2 = voff;
        for (var j = 0; j < sphereDetailU; j++) {
          sphereVerts.push(sphereX[v1]);
          sphereVerts.push(sphereY[v1]);
          sphereVerts.push(sphereZ[v1++]);
          sphereVerts.push(sphereX[v2]);
          sphereVerts.push(sphereY[v2]);
          sphereVerts.push(sphereZ[v2++]);
        }

        // close each ring
        v1 = v11;
        v2 = voff;

        sphereVerts.push(sphereX[v1]);
        sphereVerts.push(sphereY[v1]);
        sphereVerts.push(sphereZ[v1]);
        sphereVerts.push(sphereX[v2]);
        sphereVerts.push(sphereY[v2]);
        sphereVerts.push(sphereZ[v2]);
      }

      // add the northern cap
      for (i = 0; i < sphereDetailU; i++) {
        v2 = voff + i;

        sphereVerts.push(sphereX[v2]);
        sphereVerts.push(sphereY[v2]);
        sphereVerts.push(sphereZ[v2]);
        sphereVerts.push(0);
        sphereVerts.push(1);
        sphereVerts.push(0);
      }

      sphereVerts.push(sphereX[voff]);
      sphereVerts.push(sphereY[voff]);
      sphereVerts.push(sphereZ[voff]);
      sphereVerts.push(0);
      sphereVerts.push(1);
      sphereVerts.push(0);

      //set the buffer data
      curContext.bindBuffer(curContext.ARRAY_BUFFER, sphereBuffer);
      curContext.bufferData(curContext.ARRAY_BUFFER, new Float32Array(sphereVerts), curContext.STATIC_DRAW);
    };

    /**
     * The sphereDetail() function controls the detail used to render a sphere by adjusting the number of
     * vertices of the sphere mesh. The default resolution is 30, which creates
     * a fairly detailed sphere definition with vertices every 360/30 = 12
     * degrees. If you're going to render a great number of spheres per frame,
     * it is advised to reduce the level of detail using this function.
     * The setting stays active until <b>sphereDetail()</b> is called again with
     * a new parameter and so should <i>not</i> be called prior to every
     * <b>sphere()</b> statement, unless you wish to render spheres with
     * different settings, e.g. using less detail for smaller spheres or ones
     * further away from the camera. To control the detail of the horizontal
     * and vertical resolution independently, use the version of the functions
     * with two parameters. Calling this function with one parameter sets the number of segments
     *(minimum of 3) used per full circle revolution. This is equivalent to calling the function with
     * two identical values.
     *
     * @param {int} ures    number of segments used horizontally (longitudinally) per full circle revolution
     * @param {int} vres    number of segments used vertically (latitudinally) from top to bottom
     *
     * @see #sphere()
     */
    p.sphereDetail = function(ures, vres) {
      var i;

      if (arguments.length === 1) {
        ures = vres = arguments[0];
      }

      if (ures < 3) {
        ures = 3;
      } // force a minimum res
      if (vres < 2) {
        vres = 2;
      } // force a minimum res
      // if it hasn't changed do nothing
      if ((ures === sphereDetailU) && (vres === sphereDetailV)) {
        return;
      }

      var delta = PConstants.SINCOS_LENGTH / ures;
      var cx = new Float32Array(ures);
      var cz = new Float32Array(ures);
      // calc unit circle in XZ plane
      for (i = 0; i < ures; i++) {
        cx[i] = cosLUT[((i * delta) % PConstants.SINCOS_LENGTH) | 0];
        cz[i] = sinLUT[((i * delta) % PConstants.SINCOS_LENGTH) | 0];
      }

      // computing vertexlist
      // vertexlist starts at south pole
      var vertCount = ures * (vres - 1) + 2;
      var currVert = 0;

      // re-init arrays to store vertices
      sphereX = new Float32Array(vertCount);
      sphereY = new Float32Array(vertCount);
      sphereZ = new Float32Array(vertCount);

      var angle_step = (PConstants.SINCOS_LENGTH * 0.5) / vres;
      var angle = angle_step;

      // step along Y axis
      for (i = 1; i < vres; i++) {
        var curradius = sinLUT[(angle % PConstants.SINCOS_LENGTH) | 0];
        var currY = -cosLUT[(angle % PConstants.SINCOS_LENGTH) | 0];
        for (var j = 0; j < ures; j++) {
          sphereX[currVert] = cx[j] * curradius;
          sphereY[currVert] = currY;
          sphereZ[currVert++] = cz[j] * curradius;
        }
        angle += angle_step;
      }
      sphereDetailU = ures;
      sphereDetailV = vres;

      // make the sphere verts and norms
      initSphere();
    };

    /**
     * The sphere() function draws a sphere with radius r centered at coordinate 0, 0, 0.
     * A sphere is a hollow ball made from tessellated triangles.
     *
     * @param {int|float} r the radius of the sphere
     */
    Drawing2D.prototype.sphere = DrawingShared.prototype.a3DOnlyFunction;

    Drawing3D.prototype.sphere = function() {
      var sRad = arguments[0];

      if ((sphereDetailU < 3) || (sphereDetailV < 2)) {
        p.sphereDetail(30);
      }

      // Modeling transformation.
      var model = new PMatrix3D();
      model.scale(sRad, sRad, sRad);

      // viewing transformation needs to have Y flipped
      // becuase that's what Processing does.
      var view = new PMatrix3D();
      view.scale(1, -1, 1);
      view.apply(modelView.array());
      view.transpose();

      if (doFill) {
        // Calculating the normal matrix can be expensive, so only
        // do it if it's necessary.
        if(lightCount > 0){
          // Create a normal transformation matrix.
          var v = new PMatrix3D();
          v.set(view);

          var m = new PMatrix3D();
          m.set(model);

          v.mult(m);

          var normalMatrix = new PMatrix3D();
          normalMatrix.set(v);
          normalMatrix.invert();
          normalMatrix.transpose();

          uniformMatrix("uNormalTransform3d", programObject3D, "uNormalTransform", false, normalMatrix.array());
          vertexAttribPointer("aNormal3d", programObject3D, "aNormal", 3, sphereBuffer);
        }
        else{
          disableVertexAttribPointer("aNormal3d", programObject3D, "aNormal");
        }

        curContext.useProgram(programObject3D);
        disableVertexAttribPointer("aTexture3d", programObject3D, "aTexture");

        uniformMatrix("uModel3d", programObject3D, "uModel", false, model.array());
        uniformMatrix("uView3d", programObject3D, "uView", false, view.array());
        vertexAttribPointer("aVertex3d", programObject3D, "aVertex", 3, sphereBuffer);

        // Turn off per vertex colors.
        disableVertexAttribPointer("aColor3d", programObject3D, "aColor");

        // fix stitching problems. (lines get occluded by triangles
        // since they share the same depth values). This is not entirely
        // working, but it's a start for drawing the outline. So
        // developers can start playing around with styles.
        curContext.enable(curContext.POLYGON_OFFSET_FILL);
        curContext.polygonOffset(1, 1);
        uniformf("uColor3d", programObject3D, "uColor", fillStyle);
        curContext.drawArrays(curContext.TRIANGLE_STRIP, 0, sphereVerts.length / 3);
        curContext.disable(curContext.POLYGON_OFFSET_FILL);
      }

      // Draw the sphere outline.
      if (lineWidth > 0 && doStroke) {
        curContext.useProgram(programObject2D);
        uniformMatrix("uModel2d", programObject2D, "uModel", false, model.array());
        uniformMatrix("uView2d", programObject2D, "uView", false, view.array());
        vertexAttribPointer("aVertex2d", programObject2D, "aVertex", 3, sphereBuffer);
        disableVertexAttribPointer("aTextureCoord2d", programObject2D, "aTextureCoord");
        uniformf("uColor2d", programObject2D, "uColor", strokeStyle);
        uniformi("uIsDrawingText", programObject2D, "uIsDrawingText", false);
        curContext.drawArrays(curContext.LINE_STRIP, 0, sphereVerts.length / 3);
      }
    };

    ////////////////////////////////////////////////////////////////////////////
    // Coordinates
    ////////////////////////////////////////////////////////////////////////////

    /**
     * Returns the three-dimensional X, Y, Z position in model space. This returns
     * the X value for a given coordinate based on the current set of transformations
     * (scale, rotate, translate, etc.) The X value can be used to place an object
     * in space relative to the location of the original point once the transformations
     * are no longer in use.<br />
     * <br />
     *
     * @param {int | float} x 3D x coordinate to be mapped
     * @param {int | float} y 3D y coordinate to be mapped
     * @param {int | float} z 3D z coordinate to be mapped
     *
     * @returns {float}
     *
     * @see modelY
     * @see modelZ
    */
    p.modelX = function(x, y, z) {
      var mv = modelView.array();
      var ci = cameraInv.array();

      var ax = mv[0] * x + mv[1] * y + mv[2] * z + mv[3];
      var ay = mv[4] * x + mv[5] * y + mv[6] * z + mv[7];
      var az = mv[8] * x + mv[9] * y + mv[10] * z + mv[11];
      var aw = mv[12] * x + mv[13] * y + mv[14] * z + mv[15];

      var ox = ci[0] * ax + ci[1] * ay + ci[2] * az + ci[3] * aw;
      var ow = ci[12] * ax + ci[13] * ay + ci[14] * az + ci[15] * aw;

      return (ow !== 0) ? ox / ow : ox;
    };

    /**
     * Returns the three-dimensional X, Y, Z position in model space. This returns
     * the Y value for a given coordinate based on the current set of transformations
     * (scale, rotate, translate, etc.) The Y value can be used to place an object in
     * space relative to the location of the original point once the transformations
     * are no longer in use.<br />
     * <br />
     *
     * @param {int | float} x 3D x coordinate to be mapped
     * @param {int | float} y 3D y coordinate to be mapped
     * @param {int | float} z 3D z coordinate to be mapped
     *
     * @returns {float}
     *
     * @see modelX
     * @see modelZ
    */
    p.modelY = function(x, y, z) {
      var mv = modelView.array();
      var ci = cameraInv.array();

      var ax = mv[0] * x + mv[1] * y + mv[2] * z + mv[3];
      var ay = mv[4] * x + mv[5] * y + mv[6] * z + mv[7];
      var az = mv[8] * x + mv[9] * y + mv[10] * z + mv[11];
      var aw = mv[12] * x + mv[13] * y + mv[14] * z + mv[15];

      var oy = ci[4] * ax + ci[5] * ay + ci[6] * az + ci[7] * aw;
      var ow = ci[12] * ax + ci[13] * ay + ci[14] * az + ci[15] * aw;

      return (ow !== 0) ? oy / ow : oy;
    };

    /**
     * Returns the three-dimensional X, Y, Z position in model space. This returns
     * the Z value for a given coordinate based on the current set of transformations
     * (scale, rotate, translate, etc.) The Z value can be used to place an object in
     * space relative to the location of the original point once the transformations
     * are no longer in use.
     *
     * @param {int | float} x 3D x coordinate to be mapped
     * @param {int | float} y 3D y coordinate to be mapped
     * @param {int | float} z 3D z coordinate to be mapped
     *
     * @returns {float}
     *
     * @see modelX
     * @see modelY
    */
    p.modelZ = function(x, y, z) {
      var mv = modelView.array();
      var ci = cameraInv.array();

      var ax = mv[0] * x + mv[1] * y + mv[2] * z + mv[3];
      var ay = mv[4] * x + mv[5] * y + mv[6] * z + mv[7];
      var az = mv[8] * x + mv[9] * y + mv[10] * z + mv[11];
      var aw = mv[12] * x + mv[13] * y + mv[14] * z + mv[15];

      var oz = ci[8] * ax + ci[9] * ay + ci[10] * az + ci[11] * aw;
      var ow = ci[12] * ax + ci[13] * ay + ci[14] * az + ci[15] * aw;

      return (ow !== 0) ? oz / ow : oz;
    };

    ////////////////////////////////////////////////////////////////////////////
    // Material Properties
    ////////////////////////////////////////////////////////////////////////////

    /**
     * Sets the ambient reflectance for shapes drawn to the screen. This is
     * combined with the ambient light component of environment. The color
     * components set through the parameters define the reflectance. For example in
     * the default color mode, setting v1=255, v2=126, v3=0, would cause all the
     * red light to reflect and half of the green light to reflect. Used in combination
     * with <b>emissive()</b>, <b>specular()</b>, and <b>shininess()</b> in setting
     * the materal properties of shapes.
     *
     * @param {int | float} gray
     *
     * @returns none
     *
     * @see emissive
     * @see specular
     * @see shininess
    */
    Drawing2D.prototype.ambient = DrawingShared.prototype.a3DOnlyFunction;

    Drawing3D.prototype.ambient = function(v1, v2, v3) {
      curContext.useProgram(programObject3D);
      uniformi("uUsingMat3d", programObject3D, "uUsingMat", true);
      var col = p.color(v1, v2, v3);
      uniformf("uMaterialAmbient3d", programObject3D, "uMaterialAmbient", p.color.toGLArray(col).slice(0, 3));
    };

    /**
     * Sets the emissive color of the material used for drawing shapes
     * drawn to the screen. Used in combination with ambient(), specular(),
     * and shininess() in setting the material properties of shapes.
     *
     * Can be called in the following ways:
     *
     * emissive(gray)
     * @param {int | float} gray number specifying value between white and black
     *
     * emissive(color)
     * @param {color} color any value of the color datatype
     *
     * emissive(v1, v2, v3)
     * @param {int | float} v1 red or hue value
     * @param {int | float} v2 green or saturation value
     * @param {int | float} v3 blue or brightness value
     *
     * @returns none
     *
     * @see ambient
     * @see specular
     * @see shininess
    */
    Drawing2D.prototype.emissive = DrawingShared.prototype.a3DOnlyFunction;

    Drawing3D.prototype.emissive = function(v1, v2, v3) {
      curContext.useProgram(programObject3D);
      uniformi("uUsingMat3d", programObject3D, "uUsingMat", true);
      var col = p.color(v1, v2, v3);
      uniformf("uMaterialEmissive3d", programObject3D, "uMaterialEmissive", p.color.toGLArray(col).slice(0, 3));
    };

    /**
     * Sets the amount of gloss in the surface of shapes. Used in combination with
     * <b>ambient()</b>, <b>specular()</b>, and <b>emissive()</b> in setting the
     * material properties of shapes.
     *
     * @param {float} shine degree of shininess
     *
     * @returns none
    */
    Drawing2D.prototype.shininess = DrawingShared.prototype.a3DOnlyFunction;

    Drawing3D.prototype.shininess = function(shine) {
      curContext.useProgram(programObject3D);
      uniformi("uUsingMat3d", programObject3D, "uUsingMat", true);
      uniformf("uShininess3d", programObject3D, "uShininess", shine);
    };

    /**
     * Sets the specular color of the materials used for shapes drawn to the screen,
     * which sets the color of hightlights. Specular refers to light which bounces
     * off a surface in a perferred direction (rather than bouncing in all directions
     * like a diffuse light). Used in combination with emissive(), ambient(), and
     * shininess() in setting the material properties of shapes.
     *
     * Can be called in the following ways:
     *
     * specular(gray)
     * @param {int | float} gray number specifying value between white and black
     *
     * specular(gray, alpha)
     * @param {int | float} gray number specifying value between white and black
     * @param {int | float} alpha opacity
     *
     * specular(color)
     * @param {color} color any value of the color datatype
     *
     * specular(v1, v2, v3)
     * @param {int | float} v1 red or hue value
     * @param {int | float} v2 green or saturation value
     * @param {int | float} v3 blue or brightness value
     *
     * specular(v1, v2, v3, alpha)
     * @param {int | float} v1 red or hue value
     * @param {int | float} v2 green or saturation value
     * @param {int | float} v3 blue or brightness value
     * @param {int | float} alpha opacity
     *
     * @returns none
     *
     * @see ambient
     * @see emissive
     * @see shininess
    */
    Drawing2D.prototype.specular = DrawingShared.prototype.a3DOnlyFunction;

    Drawing3D.prototype.specular = function(v1, v2, v3) {
      curContext.useProgram(programObject3D);
      uniformi("uUsingMat3d", programObject3D, "uUsingMat", true);
      var col = p.color(v1, v2, v3);
      uniformf("uMaterialSpecular3d", programObject3D, "uMaterialSpecular", p.color.toGLArray(col).slice(0, 3));
    };

    ////////////////////////////////////////////////////////////////////////////
    // Coordinates
    ////////////////////////////////////////////////////////////////////////////

    /**
     * Takes a three-dimensional X, Y, Z position and returns the X value for
     * where it will appear on a (two-dimensional) screen.
     *
     * @param {int | float} x 3D x coordinate to be mapped
     * @param {int | float} y 3D y coordinate to be mapped
     * @param {int | float} z 3D z optional coordinate to be mapped
     *
     * @returns {float}
     *
     * @see screenY
     * @see screenZ
    */
    p.screenX = function( x, y, z ) {
      var mv = modelView.array();
      if( mv.length === 16 )
      {
        var ax = mv[ 0]*x + mv[ 1]*y + mv[ 2]*z + mv[ 3];
        var ay = mv[ 4]*x + mv[ 5]*y + mv[ 6]*z + mv[ 7];
        var az = mv[ 8]*x + mv[ 9]*y + mv[10]*z + mv[11];
        var aw = mv[12]*x + mv[13]*y + mv[14]*z + mv[15];

        var pj = projection.array();

        var ox = pj[ 0]*ax + pj[ 1]*ay + pj[ 2]*az + pj[ 3]*aw;
        var ow = pj[12]*ax + pj[13]*ay + pj[14]*az + pj[15]*aw;

        if ( ow !== 0 ){
          ox /= ow;
        }
        return p.width * ( 1 + ox ) / 2.0;
      }
      // We assume that we're in 2D
      return modelView.multX(x, y);
    };

    /**
     * Takes a three-dimensional X, Y, Z position and returns the Y value for
     * where it will appear on a (two-dimensional) screen.
     *
     * @param {int | float} x 3D x coordinate to be mapped
     * @param {int | float} y 3D y coordinate to be mapped
     * @param {int | float} z 3D z optional coordinate to be mapped
     *
     * @returns {float}
     *
     * @see screenX
     * @see screenZ
    */
    p.screenY = function screenY( x, y, z ) {
      var mv = modelView.array();
      if( mv.length === 16 ) {
        var ax = mv[ 0]*x + mv[ 1]*y + mv[ 2]*z + mv[ 3];
        var ay = mv[ 4]*x + mv[ 5]*y + mv[ 6]*z + mv[ 7];
        var az = mv[ 8]*x + mv[ 9]*y + mv[10]*z + mv[11];
        var aw = mv[12]*x + mv[13]*y + mv[14]*z + mv[15];

        var pj = projection.array();

        var oy = pj[ 4]*ax + pj[ 5]*ay + pj[ 6]*az + pj[ 7]*aw;
        var ow = pj[12]*ax + pj[13]*ay + pj[14]*az + pj[15]*aw;

        if ( ow !== 0 ){
          oy /= ow;
        }
        return p.height * ( 1 + oy ) / 2.0;
      }
      // We assume that we're in 2D
      return modelView.multY(x, y);
    };

    /**
     * Takes a three-dimensional X, Y, Z position and returns the Z value for
     * where it will appear on a (two-dimensional) screen.
     *
     * @param {int | float} x 3D x coordinate to be mapped
     * @param {int | float} y 3D y coordinate to be mapped
     * @param {int | float} z 3D z coordinate to be mapped
     *
     * @returns {float}
     *
     * @see screenX
     * @see screenY
    */
    p.screenZ = function screenZ( x, y, z ) {
      var mv = modelView.array();
      if( mv.length !== 16 ) {
        return 0;
      }

      var pj = projection.array();

      var ax = mv[ 0]*x + mv[ 1]*y + mv[ 2]*z + mv[ 3];
      var ay = mv[ 4]*x + mv[ 5]*y + mv[ 6]*z + mv[ 7];
      var az = mv[ 8]*x + mv[ 9]*y + mv[10]*z + mv[11];
      var aw = mv[12]*x + mv[13]*y + mv[14]*z + mv[15];

      var oz = pj[ 8]*ax + pj[ 9]*ay + pj[10]*az + pj[11]*aw;
      var ow = pj[12]*ax + pj[13]*ay + pj[14]*az + pj[15]*aw;

      if ( ow !== 0 ) {
        oz /= ow;
      }
      return ( oz + 1 ) / 2.0;
    };

    ////////////////////////////////////////////////////////////////////////////
    // Style functions
    ////////////////////////////////////////////////////////////////////////////
    /**
     * The fill() function sets the color used to fill shapes. For example, if you run <b>fill(204, 102, 0)</b>, all subsequent shapes will be filled with orange.
     * This color is either specified in terms of the RGB or HSB color depending on the current <b>colorMode()</b>
     *(the default color space is RGB, with each value in the range from 0 to 255).
     * <br><br>When using hexadecimal notation to specify a color, use "#" or "0x" before the values (e.g. #CCFFAA, 0xFFCCFFAA).
     * The # syntax uses six digits to specify a color (the way colors are specified in HTML and CSS). When using the hexadecimal notation starting with "0x",
     * the hexadecimal value must be specified with eight characters; the first two characters define the alpha component and the remainder the red, green, and blue components.
     * <br><br>The value for the parameter "gray" must be less than or equal to the current maximum value as specified by <b>colorMode()</b>. The default maximum value is 255.
     * <br><br>To change the color of an image (or a texture), use tint().
     *
     * @param {int|float} gray    number specifying value between white and black
     * @param {int|float} value1  red or hue value
     * @param {int|float} value2  green or saturation value
     * @param {int|float} value3  blue or brightness value
     * @param {int|float} alpha   opacity of the fill
     * @param {Color} color       any value of the color datatype
     * @param {int} hex           color value in hexadecimal notation (i.e. #FFCC00 or 0xFFFFCC00)
     *
     * @see #noFill()
     * @see #stroke()
     * @see #tint()
     * @see #background()
     * @see #colorMode()
     */
    DrawingShared.prototype.fill = function() {
      var color = p.color.apply(this, arguments);
      if(color === currentFillColor && doFill) {
        return;
      }
      doFill = true;
      currentFillColor = color;
    };

    Drawing2D.prototype.fill = function() {
      DrawingShared.prototype.fill.apply(this, arguments);
      isFillDirty = true;
    };

    Drawing3D.prototype.fill = function() {
      DrawingShared.prototype.fill.apply(this, arguments);
      fillStyle = p.color.toGLArray(currentFillColor);
    };

    function executeContextFill() {
      if(doFill) {
        if(isFillDirty) {
          curContext.fillStyle = p.color.toString(currentFillColor);
          isFillDirty = false;
        }
        curContext.fill();
      }
    }

    /**
     * The noFill() function disables filling geometry. If both <b>noStroke()</b> and <b>noFill()</b>
     * are called, no shapes will be drawn to the screen.
     *
     * @see #fill()
     *
     */
    p.noFill = function() {
      doFill = false;
    };

    /**
     * The stroke() function sets the color used to draw lines and borders around shapes. This color
     * is either specified in terms of the RGB or HSB color depending on the
     * current <b>colorMode()</b> (the default color space is RGB, with each
     * value in the range from 0 to 255).
     * <br><br>When using hexadecimal notation to specify a color, use "#" or
     * "0x" before the values (e.g. #CCFFAA, 0xFFCCFFAA). The # syntax uses six
     * digits to specify a color (the way colors are specified in HTML and CSS).
     * When using the hexadecimal notation starting with "0x", the hexadecimal
     * value must be specified with eight characters; the first two characters
     * define the alpha component and the remainder the red, green, and blue
     * components.
     * <br><br>The value for the parameter "gray" must be less than or equal
     * to the current maximum value as specified by <b>colorMode()</b>.
     * The default maximum value is 255.
     *
     * @param {int|float} gray    number specifying value between white and black
     * @param {int|float} value1  red or hue value
     * @param {int|float} value2  green or saturation value
     * @param {int|float} value3  blue or brightness value
     * @param {int|float} alpha   opacity of the stroke
     * @param {Color} color       any value of the color datatype
     * @param {int} hex           color value in hexadecimal notation (i.e. #FFCC00 or 0xFFFFCC00)
     *
     * @see #fill()
     * @see #noStroke()
     * @see #tint()
     * @see #background()
     * @see #colorMode()
     */
    DrawingShared.prototype.stroke = function() {
      var color = p.color.apply(this, arguments);
      if(color === currentStrokeColor && doStroke) {
        return;
      }
      doStroke = true;
      currentStrokeColor = color;
    };

    Drawing2D.prototype.stroke = function() {
      DrawingShared.prototype.stroke.apply(this, arguments);
      isStrokeDirty = true;
    };

    Drawing3D.prototype.stroke = function() {
      DrawingShared.prototype.stroke.apply(this, arguments);
      strokeStyle = p.color.toGLArray(currentStrokeColor);
    };

    function executeContextStroke() {
      if(doStroke) {
        if(isStrokeDirty) {
          curContext.strokeStyle = p.color.toString(currentStrokeColor);
          isStrokeDirty = false;
        }
        curContext.stroke();
      }
    }

    /**
     * The noStroke() function disables drawing the stroke (outline). If both <b>noStroke()</b> and
     * <b>noFill()</b> are called, no shapes will be drawn to the screen.
     *
     * @see #stroke()
     */
    p.noStroke = function() {
      doStroke = false;
    };

    /**
     * The strokeWeight() function sets the width of the stroke used for lines, points, and the border around shapes.
     * All widths are set in units of pixels.
     *
     * @param {int|float} w the weight (in pixels) of the stroke
     */
    DrawingShared.prototype.strokeWeight = function(w) {
      lineWidth = w;
    };

    Drawing2D.prototype.strokeWeight = function(w) {
      DrawingShared.prototype.strokeWeight.apply(this, arguments);
      curContext.lineWidth = w;
    };

    Drawing3D.prototype.strokeWeight = function(w) {
      DrawingShared.prototype.strokeWeight.apply(this, arguments);

      // Processing groups the weight of points and lines under this one function,
      // but for WebGL, we need to set a uniform for points and call a function for line.

      curContext.useProgram(programObject2D);
      uniformf("pointSize2d", programObject2D, "uPointSize", w);

      curContext.useProgram(programObjectUnlitShape);
      uniformf("pointSizeUnlitShape", programObjectUnlitShape, "uPointSize", w);

      curContext.lineWidth(w);
    };

    /**
     * The strokeCap() function sets the style for rendering line endings. These ends are either squared, extended, or rounded and
     * specified with the corresponding parameters SQUARE, PROJECT, and ROUND. The default cap is ROUND.
     * This function is not available with the P2D, P3D, or OPENGL renderers
     *
     * @param {int} value Either SQUARE, PROJECT, or ROUND
     */
    p.strokeCap = function(value) {
      drawing.$ensureContext().lineCap = value;
    };

    /**
     * The strokeJoin() function sets the style of the joints which connect line segments.
     * These joints are either mitered, beveled, or rounded and specified with the corresponding parameters MITER, BEVEL, and ROUND. The default joint is MITER.
     * This function is not available with the P2D, P3D, or OPENGL renderers
     *
     * @param {int} value Either SQUARE, PROJECT, or ROUND
     */
    p.strokeJoin = function(value) {
      drawing.$ensureContext().lineJoin = value;
    };

    /**
     * The smooth() function draws all geometry with smooth (anti-aliased) edges. This will slow down the frame rate of the application,
     * but will enhance the visual refinement. <br/><br/>
     * Note that smooth() will also improve image quality of resized images, and noSmooth() will disable image (and font) smoothing altogether.
     * When working with a 3D sketch, smooth will draw points as circles rather than squares.
     *
     * @see #noSmooth()
     * @see #hint()
     * @see #size()
     */

    Drawing2D.prototype.smooth = function() {
      renderSmooth = true;
      var style = curElement.style;
      style.setProperty("image-rendering", "optimizeQuality", "important");
      style.setProperty("-ms-interpolation-mode", "bicubic", "important");
      if (curContext.hasOwnProperty("mozImageSmoothingEnabled")) {
        curContext.mozImageSmoothingEnabled = true;
      }
    };

    Drawing3D.prototype.smooth = function(){
      renderSmooth = true;
    };

    /**
     * The noSmooth() function draws all geometry with jagged (aliased) edges.
     *
     * @see #smooth()
     */

    Drawing2D.prototype.noSmooth = function() {
      renderSmooth = false;
      var style = curElement.style;
      style.setProperty("image-rendering", "optimizeSpeed", "important");
      style.setProperty("image-rendering", "-moz-crisp-edges", "important");
      style.setProperty("image-rendering", "-webkit-optimize-contrast", "important");
      style.setProperty("image-rendering", "optimize-contrast", "important");
      style.setProperty("-ms-interpolation-mode", "nearest-neighbor", "important");
      if (curContext.hasOwnProperty("mozImageSmoothingEnabled")) {
        curContext.mozImageSmoothingEnabled = false;
      }
    };

    Drawing3D.prototype.noSmooth = function(){
      renderSmooth = false;
    };

    ////////////////////////////////////////////////////////////////////////////
    // Vector drawing functions
    ////////////////////////////////////////////////////////////////////////////
    /**
     * The point() function draws a point, a coordinate in space at the dimension of one pixel.
     * The first parameter is the horizontal value for the point, the second
     * value is the vertical value for the point, and the optional third value
     * is the depth value. Drawing this shape in 3D using the <b>z</b>
     * parameter requires the P3D or OPENGL parameter in combination with
     * size as shown in the above example.
     *
     * @param {int|float} x x-coordinate of the point
     * @param {int|float} y y-coordinate of the point
     * @param {int|float} z z-coordinate of the point
     *
     * @see #beginShape()
     */
    Drawing2D.prototype.point = function(x, y) {
      if (!doStroke) {
        return;
      }
      if (!renderSmooth) {
        x = Math.round(x);
        y = Math.round(y);
      }
      curContext.fillStyle = p.color.toString(currentStrokeColor);
      isFillDirty = true;
      // Draw a circle for any point larger than 1px
      if (lineWidth > 1) {
        curContext.beginPath();
        curContext.arc(x, y, lineWidth / 2, 0, PConstants.TWO_PI, false);
        curContext.fill();
      } else {
        curContext.fillRect(x, y, 1, 1);
      }
    };

    Drawing3D.prototype.point = function(x, y, z) {
      var model = new PMatrix3D();

      // move point to position
      model.translate(x, y, z || 0);
      model.transpose();

      var view = new PMatrix3D();
      view.scale(1, -1, 1);
      view.apply(modelView.array());
      view.transpose();

      curContext.useProgram(programObject2D);
      uniformMatrix("uModel2d", programObject2D, "uModel", false, model.array());
      uniformMatrix("uView2d", programObject2D, "uView", false, view.array());

      if (lineWidth > 0 && doStroke) {
        // this will be replaced with the new bit shifting color code
        uniformf("uColor2d", programObject2D, "uColor", strokeStyle);
        uniformi("uIsDrawingText2d", programObject2D, "uIsDrawingText", false);
        uniformi("uSmooth2d", programObject2D, "uSmooth", renderSmooth);
        vertexAttribPointer("aVertex2d", programObject2D, "aVertex", 3, pointBuffer);
        disableVertexAttribPointer("aTextureCoord2d", programObject2D, "aTextureCoord");
        curContext.drawArrays(curContext.POINTS, 0, 1);
      }
    };

    /**
     * Using the <b>beginShape()</b> and <b>endShape()</b> functions allow creating more complex forms.
     * <b>beginShape()</b> begins recording vertices for a shape and <b>endShape()</b> stops recording.
     * The value of the <b>MODE</b> parameter tells it which types of shapes to create from the provided vertices.
     * With no mode specified, the shape can be any irregular polygon. After calling the <b>beginShape()</b> function,
     * a series of <b>vertex()</b> commands must follow. To stop drawing the shape, call <b>endShape()</b>.
     * The <b>vertex()</b> function with two parameters specifies a position in 2D and the <b>vertex()</b>
     * function with three parameters specifies a position in 3D. Each shape will be outlined with the current
     * stroke color and filled with the fill color.
     *
     * @param {int} MODE either POINTS, LINES, TRIANGLES, TRIANGLE_FAN, TRIANGLE_STRIP, QUADS, and QUAD_STRIP.
     *
     * @see endShape
     * @see vertex
     * @see curveVertex
     * @see bezierVertex
     */
    p.beginShape = function(type) {
      curShape = type;
      curvePoints = [];
      vertArray = [];
    };

    /**
     * All shapes are constructed by connecting a series of vertices. <b>vertex()</b> is used to specify the vertex
     * coordinates for points, lines, triangles, quads, and polygons and is used exclusively within the <b>beginShape()</b>
     * and <b>endShape()</b> function. <br /><br />Drawing a vertex in 3D using the <b>z</b> parameter requires the P3D or
     * OPENGL parameter in combination with size as shown in the above example.<br /><br />This function is also used to map a
     * texture onto the geometry. The <b>texture()</b> function declares the texture to apply to the geometry and the <b>u</b>
     * and <b>v</b> coordinates set define the mapping of this texture to the form. By default, the coordinates used for
     * <b>u</b> and <b>v</b> are specified in relation to the image's size in pixels, but this relation can be changed with
     * <b>textureMode()</b>.
     *
     * @param {int | float} x x-coordinate of the vertex
     * @param {int | float} y y-coordinate of the vertex
     * @param {boolean} moveto flag to indicate whether this is a new subpath
     *
     * @see beginShape
     * @see endShape
     * @see bezierVertex
     * @see curveVertex
     * @see texture
     */

    Drawing2D.prototype.vertex = function(x, y, moveTo) {
      var vert = [];

      if (firstVert) { firstVert = false; }
      vert.isVert = true;

      vert[0] = x;
      vert[1] = y;
      vert[2] = 0;
      vert[3] = 0;
      vert[4] = 0;

      // fill and stroke color
      vert[5] = currentFillColor;
      vert[6] = currentStrokeColor;

      vertArray.push(vert);
      if (moveTo) {
        vertArray[vertArray.length-1].moveTo = moveTo;
      }
    };

    Drawing3D.prototype.vertex = function(x, y, z, u, v) {
      var vert = [];

      if (firstVert) { firstVert = false; }
      vert.isVert = true;

      if (v === undef && usingTexture) {
        v = u;
        u = z;
        z = 0;
      }

      // Convert u and v to normalized coordinates
      if (u !== undef && v !== undef) {
        if (curTextureMode === PConstants.IMAGE) {
          u /= curTexture.width;
          v /= curTexture.height;
        }
        u = u > 1 ? 1 : u;
        u = u < 0 ? 0 : u;
        v = v > 1 ? 1 : v;
        v = v < 0 ? 0 : v;
      }

      vert[0] = x;
      vert[1] = y;
      vert[2] = z || 0;
      vert[3] = u || 0;
      vert[4] = v || 0;

      // fill rgba
      vert[5] = fillStyle[0];
      vert[6] = fillStyle[1];
      vert[7] = fillStyle[2];
      vert[8] = fillStyle[3];
      // stroke rgba
      vert[9] = strokeStyle[0];
      vert[10] = strokeStyle[1];
      vert[11] = strokeStyle[2];
      vert[12] = strokeStyle[3];
      //normals
      vert[13] = normalX;
      vert[14] = normalY;
      vert[15] = normalZ;

      vertArray.push(vert);
    };

    /**
     * @private
     * Renders 3D points created from calls to vertex and beginShape/endShape
     *
     * @param {Array} vArray an array of vertex coordinate
     * @param {Array} cArray an array of colours used for the vertices
     *
     * @see beginShape
     * @see endShape
     * @see vertex
     */
    var point3D = function(vArray, cArray){
      var view = new PMatrix3D();
      view.scale(1, -1, 1);
      view.apply(modelView.array());
      view.transpose();

      curContext.useProgram(programObjectUnlitShape);

      uniformMatrix("uViewUS", programObjectUnlitShape, "uView", false, view.array());
      uniformi("uSmoothUS", programObjectUnlitShape, "uSmooth", renderSmooth);

      vertexAttribPointer("aVertexUS", programObjectUnlitShape, "aVertex", 3, pointBuffer);
      curContext.bufferData(curContext.ARRAY_BUFFER, new Float32Array(vArray), curContext.STREAM_DRAW);

      vertexAttribPointer("aColorUS", programObjectUnlitShape, "aColor", 4, fillColorBuffer);
      curContext.bufferData(curContext.ARRAY_BUFFER, new Float32Array(cArray), curContext.STREAM_DRAW);

      curContext.drawArrays(curContext.POINTS, 0, vArray.length/3);
    };

    /**
     * @private
     * Renders 3D lines created from calls to beginShape/vertex/endShape - based on the mode specified LINES, LINE_LOOP, etc.
     *
     * @param {Array} vArray an array of vertex coordinate
     * @param {String} mode  either LINES, LINE_LOOP, or LINE_STRIP
     * @param {Array} cArray an array of colours used for the vertices
     *
     * @see beginShape
     * @see endShape
     * @see vertex
     */
    var line3D = function(vArray, mode, cArray){
      var ctxMode;
      if (mode === "LINES"){
        ctxMode = curContext.LINES;
      }
      else if(mode === "LINE_LOOP"){
        ctxMode = curContext.LINE_LOOP;
      }
      else{
        ctxMode = curContext.LINE_STRIP;
      }

      var view = new PMatrix3D();
      view.scale(1, -1, 1);
      view.apply(modelView.array());
      view.transpose();

      curContext.useProgram(programObjectUnlitShape);
      uniformMatrix("uViewUS", programObjectUnlitShape, "uView", false, view.array());
      vertexAttribPointer("aVertexUS", programObjectUnlitShape, "aVertex", 3, lineBuffer);
      curContext.bufferData(curContext.ARRAY_BUFFER, new Float32Array(vArray), curContext.STREAM_DRAW);
      vertexAttribPointer("aColorUS", programObjectUnlitShape, "aColor", 4, strokeColorBuffer);
      curContext.bufferData(curContext.ARRAY_BUFFER, new Float32Array(cArray), curContext.STREAM_DRAW);
      curContext.drawArrays(ctxMode, 0, vArray.length/3);
    };

    /**
     * @private
     * Render filled shapes created from calls to beginShape/vertex/endShape - based on the mode specified TRIANGLES, etc.
     *
     * @param {Array} vArray an array of vertex coordinate
     * @param {String} mode  either LINES, LINE_LOOP, or LINE_STRIP
     * @param {Array} cArray an array of colours used for the vertices
     * @param {Array} tArray an array of u,v coordinates for textures
     *
     * @see beginShape
     * @see endShape
     * @see vertex
     */
    var fill3D = function(vArray, mode, cArray, tArray){
      var ctxMode;
      if (mode === "TRIANGLES") {
        ctxMode = curContext.TRIANGLES;
      } else if(mode === "TRIANGLE_FAN") {
        ctxMode = curContext.TRIANGLE_FAN;
      } else {
        ctxMode = curContext.TRIANGLE_STRIP;
      }

      var view = new PMatrix3D();
      view.scale( 1, -1, 1 );
      view.apply( modelView.array() );
      view.transpose();

      curContext.useProgram( programObject3D );
      uniformMatrix( "model3d", programObject3D, "uModel", false,  [1,0,0,0,  0,1,0,0,   0,0,1,0,   0,0,0,1] );
      uniformMatrix( "view3d", programObject3D, "uView", false, view.array() );
      curContext.enable( curContext.POLYGON_OFFSET_FILL );
      curContext.polygonOffset( 1, 1 );
      uniformf( "color3d", programObject3D, "uColor", [-1,0,0,0] );
      vertexAttribPointer( "vertex3d", programObject3D, "aVertex", 3, fillBuffer );
      curContext.bufferData( curContext.ARRAY_BUFFER, new Float32Array(vArray), curContext.STREAM_DRAW );

      // if we are using a texture and a tint, then overwrite the
      // contents of the color buffer with the current tint
      if ( usingTexture && curTint !== null ){
        curTint3d( cArray );
      }

      vertexAttribPointer( "aColor3d", programObject3D, "aColor", 4, fillColorBuffer );
      curContext.bufferData( curContext.ARRAY_BUFFER, new Float32Array(cArray), curContext.STREAM_DRAW );

      // No support for lights....yet
      disableVertexAttribPointer( "aNormal3d", programObject3D, "aNormal" );

      if ( usingTexture ) {
        uniformi( "uUsingTexture3d", programObject3D, "uUsingTexture", usingTexture );
        vertexAttribPointer( "aTexture3d", programObject3D, "aTexture", 2, shapeTexVBO );
        curContext.bufferData( curContext.ARRAY_BUFFER, new Float32Array(tArray), curContext.STREAM_DRAW );
      }

      curContext.drawArrays( ctxMode, 0, vArray.length/3 );
      curContext.disable( curContext.POLYGON_OFFSET_FILL );
    };

    /**
     * this series of three operations is used a lot in Drawing2D.prototype.endShape
     * and has been split off as its own function, to tighten the code and allow for
     * fewer bugs.
     */
    function fillStrokeClose() {
      executeContextFill();
      executeContextStroke();
      curContext.closePath();
    }

    /**
     * The endShape() function is the companion to beginShape() and may only be called after beginShape().
     * When endshape() is called, all of image data defined since the previous call to beginShape() is written
     * into the image buffer.
     *
     * @param {int} MODE Use CLOSE to close the shape
     *
     * @see beginShape
     */
    Drawing2D.prototype.endShape = function(mode) {
      // Duplicated in Drawing3D; too many variables used
      if (vertArray.length === 0) { return; }

      var closeShape = mode === PConstants.CLOSE;

      // if the shape is closed, the first element is also the last element
      if (closeShape) {
        vertArray.push(vertArray[0]);
      }

      var lineVertArray = [];
      var fillVertArray = [];
      var colorVertArray = [];
      var strokeVertArray = [];
      var texVertArray = [];
      var cachedVertArray;

      firstVert = true;
      var i, j, k;
      var vertArrayLength = vertArray.length;

      for (i = 0; i < vertArrayLength; i++) {
        cachedVertArray = vertArray[i];
        for (j = 0; j < 3; j++) {
          fillVertArray.push(cachedVertArray[j]);
        }
      }

      // 5,6,7,8
      // R,G,B,A - fill colour
      for (i = 0; i < vertArrayLength; i++) {
        cachedVertArray = vertArray[i];
        for (j = 5; j < 9; j++) {
          colorVertArray.push(cachedVertArray[j]);
        }
      }

      // 9,10,11,12
      // R, G, B, A - stroke colour
      for (i = 0; i < vertArrayLength; i++) {
        cachedVertArray = vertArray[i];
        for (j = 9; j < 13; j++) {
          strokeVertArray.push(cachedVertArray[j]);
        }
      }

      // texture u,v
      for (i = 0; i < vertArrayLength; i++) {
        cachedVertArray = vertArray[i];
        texVertArray.push(cachedVertArray[3]);
        texVertArray.push(cachedVertArray[4]);
      }

      // curveVertex
      if ( isCurve && (curShape === PConstants.POLYGON || curShape === undef) ) {
        if (vertArrayLength > 3) {
          var b = [],
              s = 1 - curTightness;
          curContext.beginPath();
          curContext.moveTo(vertArray[1][0], vertArray[1][1]);
            /*
            * Matrix to convert from Catmull-Rom to cubic Bezier
            * where t = curTightness
            * |0         1          0         0       |
            * |(t-1)/6   1          (1-t)/6   0       |
            * |0         (1-t)/6    1         (t-1)/6 |
            * |0         0          0         0       |
            */
          for (i = 1; (i+2) < vertArrayLength; i++) {
            cachedVertArray = vertArray[i];
            b[0] = [cachedVertArray[0], cachedVertArray[1]];
            b[1] = [cachedVertArray[0] + (s * vertArray[i+1][0] - s * vertArray[i-1][0]) / 6,
                   cachedVertArray[1] + (s * vertArray[i+1][1] - s * vertArray[i-1][1]) / 6];
            b[2] = [vertArray[i+1][0] + (s * vertArray[i][0] - s * vertArray[i+2][0]) / 6,
                   vertArray[i+1][1] + (s * vertArray[i][1] - s * vertArray[i+2][1]) / 6];
            b[3] = [vertArray[i+1][0], vertArray[i+1][1]];
            curContext.bezierCurveTo(b[1][0], b[1][1], b[2][0], b[2][1], b[3][0], b[3][1]);
          }
          fillStrokeClose();
        }
      }

      // bezierVertex
      else if ( isBezier && (curShape === PConstants.POLYGON || curShape === undef) ) {
        curContext.beginPath();
        for (i = 0; i < vertArrayLength; i++) {
          cachedVertArray = vertArray[i];
          if (vertArray[i].isVert) { //if it is a vertex move to the position
            if (vertArray[i].moveTo) {
              curContext.moveTo(cachedVertArray[0], cachedVertArray[1]);
            } else {
              curContext.lineTo(cachedVertArray[0], cachedVertArray[1]);
            }
          } else { //otherwise continue drawing bezier
            curContext.bezierCurveTo(vertArray[i][0], vertArray[i][1], vertArray[i][2], vertArray[i][3], vertArray[i][4], vertArray[i][5]);
          }
        }
        fillStrokeClose();
      }

      // render the vertices provided
      else {
        if (curShape === PConstants.POINTS) {
          for (i = 0; i < vertArrayLength; i++) {
            cachedVertArray = vertArray[i];
            if (doStroke) {
              p.stroke(cachedVertArray[6]);
            }
            p.point(cachedVertArray[0], cachedVertArray[1]);
          }
        } else if (curShape === PConstants.LINES) {
          for (i = 0; (i + 1) < vertArrayLength; i+=2) {
            cachedVertArray = vertArray[i];
            if (doStroke) {
              p.stroke(vertArray[i+1][6]);
            }
            p.line(cachedVertArray[0], cachedVertArray[1], vertArray[i+1][0], vertArray[i+1][1]);
          }
        } else if (curShape === PConstants.TRIANGLES) {
          for (i = 0; (i + 2) < vertArrayLength; i+=3) {
            cachedVertArray = vertArray[i];
            curContext.beginPath();
            curContext.moveTo(cachedVertArray[0], cachedVertArray[1]);
            curContext.lineTo(vertArray[i+1][0], vertArray[i+1][1]);
            curContext.lineTo(vertArray[i+2][0], vertArray[i+2][1]);
            curContext.lineTo(cachedVertArray[0], cachedVertArray[1]);

            if (doFill) {
              p.fill(vertArray[i+2][5]);
              executeContextFill();
            }
            if (doStroke) {
              p.stroke(vertArray[i+2][6]);
              executeContextStroke();
            }

            curContext.closePath();
          }
        } else if (curShape === PConstants.TRIANGLE_STRIP) {
          for (i = 0; (i+1) < vertArrayLength; i++) {
            cachedVertArray = vertArray[i];
            curContext.beginPath();
            curContext.moveTo(vertArray[i+1][0], vertArray[i+1][1]);
            curContext.lineTo(cachedVertArray[0], cachedVertArray[1]);

            if (doStroke) {
              p.stroke(vertArray[i+1][6]);
            }
            if (doFill) {
              p.fill(vertArray[i+1][5]);
            }

            if (i + 2 < vertArrayLength) {
              curContext.lineTo(vertArray[i+2][0], vertArray[i+2][1]);
              if (doStroke) {
                p.stroke(vertArray[i+2][6]);
              }
              if (doFill) {
                p.fill(vertArray[i+2][5]);
              }
            }
            fillStrokeClose();
          }
        } else if (curShape === PConstants.TRIANGLE_FAN) {
          if (vertArrayLength > 2) {
            curContext.beginPath();
            curContext.moveTo(vertArray[0][0], vertArray[0][1]);
            curContext.lineTo(vertArray[1][0], vertArray[1][1]);
            curContext.lineTo(vertArray[2][0], vertArray[2][1]);

            if (doFill) {
              p.fill(vertArray[2][5]);
              executeContextFill();
            }
            if (doStroke) {
              p.stroke(vertArray[2][6]);
              executeContextStroke();
            }

            curContext.closePath();
            for (i = 3; i < vertArrayLength; i++) {
              cachedVertArray = vertArray[i];
              curContext.beginPath();
              curContext.moveTo(vertArray[0][0], vertArray[0][1]);
              curContext.lineTo(vertArray[i-1][0], vertArray[i-1][1]);
              curContext.lineTo(cachedVertArray[0], cachedVertArray[1]);

              if (doFill) {
                p.fill(cachedVertArray[5]);
                executeContextFill();
              }
              if (doStroke) {
                p.stroke(cachedVertArray[6]);
                executeContextStroke();
              }

              curContext.closePath();
            }
          }
        } else if (curShape === PConstants.QUADS) {
          for (i = 0; (i + 3) < vertArrayLength; i+=4) {
            cachedVertArray = vertArray[i];
            curContext.beginPath();
            curContext.moveTo(cachedVertArray[0], cachedVertArray[1]);
            for (j = 1; j < 4; j++) {
              curContext.lineTo(vertArray[i+j][0], vertArray[i+j][1]);
            }
            curContext.lineTo(cachedVertArray[0], cachedVertArray[1]);

            if (doFill) {
              p.fill(vertArray[i+3][5]);
              executeContextFill();
            }
            if (doStroke) {
              p.stroke(vertArray[i+3][6]);
              executeContextStroke();
            }

            curContext.closePath();
          }
        } else if (curShape === PConstants.QUAD_STRIP) {
          if (vertArrayLength > 3) {
            for (i = 0; (i+1) < vertArrayLength; i+=2) {
              cachedVertArray = vertArray[i];
              curContext.beginPath();
              if (i+3 < vertArrayLength) {
                curContext.moveTo(vertArray[i+2][0], vertArray[i+2][1]);
                curContext.lineTo(cachedVertArray[0], cachedVertArray[1]);
                curContext.lineTo(vertArray[i+1][0], vertArray[i+1][1]);
                curContext.lineTo(vertArray[i+3][0], vertArray[i+3][1]);

                if (doFill) {
                  p.fill(vertArray[i+3][5]);
                }
                if (doStroke) {
                  p.stroke(vertArray[i+3][6]);
                }
              } else {
                curContext.moveTo(cachedVertArray[0], cachedVertArray[1]);
                curContext.lineTo(vertArray[i+1][0], vertArray[i+1][1]);
              }
              fillStrokeClose();
            }
          }
        } else {
          curContext.beginPath();
          curContext.moveTo(vertArray[0][0], vertArray[0][1]);
          for (i = 1; i < vertArrayLength; i++) {
            cachedVertArray = vertArray[i];
            if (cachedVertArray.isVert) { //if it is a vertex move to the position
              if (cachedVertArray.moveTo) {
                curContext.moveTo(cachedVertArray[0], cachedVertArray[1]);
              } else {
                curContext.lineTo(cachedVertArray[0], cachedVertArray[1]);
              }
            }
          }
          fillStrokeClose();
        }
      }

      // Reset some settings
      isCurve = false;
      isBezier = false;
      curveVertArray = [];
      curveVertCount = 0;

      // If the shape is closed, the first element was added as last element.
      // We must remove it again to prevent the list of vertices from growing
      // over successive calls to endShape(CLOSE)
      if (closeShape) {
        vertArray.pop();
      }
    };

    Drawing3D.prototype.endShape = function(mode) {
      // Duplicated in Drawing3D; too many variables used
      if (vertArray.length === 0) { return; }

      var closeShape = mode === PConstants.CLOSE;
      var lineVertArray = [];
      var fillVertArray = [];
      var colorVertArray = [];
      var strokeVertArray = [];
      var texVertArray = [];
      var cachedVertArray;

      firstVert = true;
      var i, j, k;
      var vertArrayLength = vertArray.length;

      for (i = 0; i < vertArrayLength; i++) {
        cachedVertArray = vertArray[i];
        for (j = 0; j < 3; j++) {
          fillVertArray.push(cachedVertArray[j]);
        }
      }

      // 5,6,7,8
      // R,G,B,A - fill colour
      for (i = 0; i < vertArrayLength; i++) {
        cachedVertArray = vertArray[i];
        for (j = 5; j < 9; j++) {
          colorVertArray.push(cachedVertArray[j]);
        }
      }

      // 9,10,11,12
      // R, G, B, A - stroke colour
      for (i = 0; i < vertArrayLength; i++) {
        cachedVertArray = vertArray[i];
        for (j = 9; j < 13; j++) {
          strokeVertArray.push(cachedVertArray[j]);
        }
      }

      // texture u,v
      for (i = 0; i < vertArrayLength; i++) {
        cachedVertArray = vertArray[i];
        texVertArray.push(cachedVertArray[3]);
        texVertArray.push(cachedVertArray[4]);
      }

      // if shape is closed, push the first point into the last point (including colours)
      if (closeShape) {
        fillVertArray.push(vertArray[0][0]);
        fillVertArray.push(vertArray[0][1]);
        fillVertArray.push(vertArray[0][2]);

        for (i = 5; i < 9; i++) {
          colorVertArray.push(vertArray[0][i]);
        }

        for (i = 9; i < 13; i++) {
          strokeVertArray.push(vertArray[0][i]);
        }

        texVertArray.push(vertArray[0][3]);
        texVertArray.push(vertArray[0][4]);
      }
      // End duplication

      // curveVertex
      if ( isCurve && (curShape === PConstants.POLYGON || curShape === undef) ) {
        lineVertArray = fillVertArray;
        if (doStroke) {
          line3D(lineVertArray, null, strokeVertArray);
        }
        if (doFill) {
          fill3D(fillVertArray, null, colorVertArray);
        }
      }
      // bezierVertex
      else if ( isBezier && (curShape === PConstants.POLYGON || curShape === undef) ) {
        lineVertArray = fillVertArray;
        lineVertArray.splice(lineVertArray.length - 3);
        strokeVertArray.splice(strokeVertArray.length - 4);
        if (doStroke) {
          line3D(lineVertArray, null, strokeVertArray);
        }
        if (doFill) {
          fill3D(fillVertArray, "TRIANGLES", colorVertArray);
        }
      }

      // render the vertices provided
      else {
        if (curShape === PConstants.POINTS) {       // if POINTS was the specified parameter in beginShape
          for (i = 0; i < vertArrayLength; i++) {  // loop through and push the point location information to the array
            cachedVertArray = vertArray[i];
            for (j = 0; j < 3; j++) {
              lineVertArray.push(cachedVertArray[j]);
            }
          }
          point3D(lineVertArray, strokeVertArray);  // render function for points
        } else if (curShape === PConstants.LINES) { // if LINES was the specified parameter in beginShape
          for (i = 0; i < vertArrayLength; i++) {  // loop through and push the point location information to the array
            cachedVertArray = vertArray[i];
            for (j = 0; j < 3; j++) {
              lineVertArray.push(cachedVertArray[j]);
            }
          }
          for (i = 0; i < vertArrayLength; i++) {  // loop through and push the color information to the array
            cachedVertArray = vertArray[i];
            for (j = 5; j < 9; j++) {
              colorVertArray.push(cachedVertArray[j]);
            }
          }
          line3D(lineVertArray, "LINES", strokeVertArray);  // render function for lines
        } else if (curShape === PConstants.TRIANGLES) {     // if TRIANGLES was the specified parameter in beginShape
          if (vertArrayLength > 2) {
            for (i = 0; (i+2) < vertArrayLength; i+=3) {   // loop through the array per triangle
              fillVertArray = [];
              texVertArray = [];
              lineVertArray = [];
              colorVertArray = [];
              strokeVertArray = [];
              for (j = 0; j < 3; j++) {
                for (k = 0; k < 3; k++) {                   // loop through and push
                  lineVertArray.push(vertArray[i+j][k]);    // the line point location information
                  fillVertArray.push(vertArray[i+j][k]);    // and fill point location information
                }
              }
              for (j = 0; j < 3; j++) {                     // loop through and push the texture information
                for (k = 3; k < 5; k++) {
                  texVertArray.push(vertArray[i+j][k]);
                }
              }
              for (j = 0; j < 3; j++) {
                for (k = 5; k < 9; k++) {                   // loop through and push
                  colorVertArray.push(vertArray[i+j][k]);   // the colour information
                  strokeVertArray.push(vertArray[i+j][k+4]);// and the stroke information
                }
              }
              if (doStroke) {
                line3D(lineVertArray, "LINE_LOOP", strokeVertArray );               // line render function
              }
              if (doFill || usingTexture) {
                fill3D(fillVertArray, "TRIANGLES", colorVertArray, texVertArray);   // fill shape render function
              }
            }
          }
        } else if (curShape === PConstants.TRIANGLE_STRIP) {    // if TRIANGLE_STRIP was the specified parameter in beginShape
          if (vertArrayLength > 2) {
            for (i = 0; (i+2) < vertArrayLength; i++) {
              lineVertArray = [];
              fillVertArray = [];
              strokeVertArray = [];
              colorVertArray = [];
              texVertArray = [];
              for (j = 0; j < 3; j++) {
                for (k = 0; k < 3; k++) {
                  lineVertArray.push(vertArray[i+j][k]);
                  fillVertArray.push(vertArray[i+j][k]);
                }
              }
              for (j = 0; j < 3; j++) {
                for (k = 3; k < 5; k++) {
                  texVertArray.push(vertArray[i+j][k]);
                }
              }
              for (j = 0; j < 3; j++) {
                for (k = 5; k < 9; k++) {
                  strokeVertArray.push(vertArray[i+j][k+4]);
                  colorVertArray.push(vertArray[i+j][k]);
                }
              }

              if (doFill || usingTexture) {
                fill3D(fillVertArray, "TRIANGLE_STRIP", colorVertArray, texVertArray);
              }
              if (doStroke) {
                line3D(lineVertArray, "LINE_LOOP", strokeVertArray);
              }
            }
          }
        } else if (curShape === PConstants.TRIANGLE_FAN) {
          if (vertArrayLength > 2) {
            for (i = 0; i < 3; i++) {
              cachedVertArray = vertArray[i];
              for (j = 0; j < 3; j++) {
                lineVertArray.push(cachedVertArray[j]);
              }
            }
            for (i = 0; i < 3; i++) {
              cachedVertArray = vertArray[i];
              for (j = 9; j < 13; j++) {
                strokeVertArray.push(cachedVertArray[j]);
              }
            }
            if (doStroke) {
              line3D(lineVertArray, "LINE_LOOP", strokeVertArray);
            }

            for (i = 2; (i+1) < vertArrayLength; i++) {
              lineVertArray = [];
              strokeVertArray = [];
              lineVertArray.push(vertArray[0][0]);
              lineVertArray.push(vertArray[0][1]);
              lineVertArray.push(vertArray[0][2]);

              strokeVertArray.push(vertArray[0][9]);
              strokeVertArray.push(vertArray[0][10]);
              strokeVertArray.push(vertArray[0][11]);
              strokeVertArray.push(vertArray[0][12]);

              for (j = 0; j < 2; j++) {
                for (k = 0; k < 3; k++) {
                  lineVertArray.push(vertArray[i+j][k]);
                }
              }
              for (j = 0; j < 2; j++) {
                for (k = 9; k < 13; k++) {
                  strokeVertArray.push(vertArray[i+j][k]);
                }
              }
              if (doStroke) {
                line3D(lineVertArray, "LINE_STRIP",strokeVertArray);
              }
            }
            if (doFill || usingTexture) {
              fill3D(fillVertArray, "TRIANGLE_FAN", colorVertArray, texVertArray);
            }
          }
        } else if (curShape === PConstants.QUADS) {
          for (i = 0; (i + 3) < vertArrayLength; i+=4) {
            lineVertArray = [];
            for (j = 0; j < 4; j++) {
              cachedVertArray = vertArray[i+j];
              for (k = 0; k < 3; k++) {
                lineVertArray.push(cachedVertArray[k]);
              }
            }
            if (doStroke) {
              line3D(lineVertArray, "LINE_LOOP",strokeVertArray);
            }

            if (doFill) {
              fillVertArray = [];
              colorVertArray = [];
              texVertArray = [];
              for (j = 0; j < 3; j++) {
                fillVertArray.push(vertArray[i][j]);
              }
              for (j = 5; j < 9; j++) {
                colorVertArray.push(vertArray[i][j]);
              }

              for (j = 0; j < 3; j++) {
                fillVertArray.push(vertArray[i+1][j]);
              }
              for (j = 5; j < 9; j++) {
                colorVertArray.push(vertArray[i+1][j]);
              }

              for (j = 0; j < 3; j++) {
                fillVertArray.push(vertArray[i+3][j]);
              }
              for (j = 5; j < 9; j++) {
                colorVertArray.push(vertArray[i+3][j]);
              }

              for (j = 0; j < 3; j++) {
                fillVertArray.push(vertArray[i+2][j]);
              }
              for (j = 5; j < 9; j++) {
                colorVertArray.push(vertArray[i+2][j]);
              }

              if (usingTexture) {
                texVertArray.push(vertArray[i+0][3]);
                texVertArray.push(vertArray[i+0][4]);
                texVertArray.push(vertArray[i+1][3]);
                texVertArray.push(vertArray[i+1][4]);
                texVertArray.push(vertArray[i+3][3]);
                texVertArray.push(vertArray[i+3][4]);
                texVertArray.push(vertArray[i+2][3]);
                texVertArray.push(vertArray[i+2][4]);
              }

              fill3D(fillVertArray, "TRIANGLE_STRIP", colorVertArray, texVertArray);
            }
          }
        } else if (curShape === PConstants.QUAD_STRIP) {
          var tempArray = [];
          if (vertArrayLength > 3) {
            for (i = 0; i < 2; i++) {
              cachedVertArray = vertArray[i];
              for (j = 0; j < 3; j++) {
                lineVertArray.push(cachedVertArray[j]);
              }
            }

            for (i = 0; i < 2; i++) {
              cachedVertArray = vertArray[i];
              for (j = 9; j < 13; j++) {
                strokeVertArray.push(cachedVertArray[j]);
              }
            }

            line3D(lineVertArray, "LINE_STRIP", strokeVertArray);
            if (vertArrayLength > 4 && vertArrayLength % 2 > 0) {
              tempArray = fillVertArray.splice(fillVertArray.length - 3);
              vertArray.pop();
            }
            for (i = 0; (i+3) < vertArrayLength; i+=2) {
              lineVertArray = [];
              strokeVertArray = [];
              for (j = 0; j < 3; j++) {
                lineVertArray.push(vertArray[i+1][j]);
              }
              for (j = 0; j < 3; j++) {
                lineVertArray.push(vertArray[i+3][j]);
              }
              for (j = 0; j < 3; j++) {
                lineVertArray.push(vertArray[i+2][j]);
              }
              for (j = 0; j < 3; j++) {
                lineVertArray.push(vertArray[i+0][j]);
              }
              for (j = 9; j < 13; j++) {
                strokeVertArray.push(vertArray[i+1][j]);
              }
              for (j = 9; j < 13; j++) {
                strokeVertArray.push(vertArray[i+3][j]);
              }
              for (j = 9; j < 13; j++) {
                strokeVertArray.push(vertArray[i+2][j]);
              }
              for (j = 9; j < 13; j++) {
                strokeVertArray.push(vertArray[i+0][j]);
              }
              if (doStroke) {
                line3D(lineVertArray, "LINE_STRIP", strokeVertArray);
              }
            }

            if (doFill || usingTexture) {
              fill3D(fillVertArray, "TRIANGLE_LIST", colorVertArray, texVertArray);
            }
          }
        }
        // If the user didn't specify a type (LINES, TRIANGLES, etc)
        else {
          // If only one vertex was specified, it must be a point
          if (vertArrayLength === 1) {
            for (j = 0; j < 3; j++) {
              lineVertArray.push(vertArray[0][j]);
            }
            for (j = 9; j < 13; j++) {
              strokeVertArray.push(vertArray[0][j]);
            }
            point3D(lineVertArray,strokeVertArray);
          } else {
            for (i = 0; i < vertArrayLength; i++) {
              cachedVertArray = vertArray[i];
              for (j = 0; j < 3; j++) {
                lineVertArray.push(cachedVertArray[j]);
              }
              for (j = 5; j < 9; j++) {
                strokeVertArray.push(cachedVertArray[j]);
              }
            }
            if (doStroke && closeShape) {
              line3D(lineVertArray, "LINE_LOOP", strokeVertArray);
            } else if (doStroke && !closeShape) {
              line3D(lineVertArray, "LINE_STRIP", strokeVertArray);
            }

            // fill is ignored if textures are used
            if (doFill || usingTexture) {
              fill3D(fillVertArray, "TRIANGLE_FAN", colorVertArray, texVertArray);
            }
          }
        }
        // everytime beginShape is followed by a call to
        // texture(), texturing it turned back on. We do this to
        // figure out if the shape should be textured or filled
        // with a color.
        usingTexture = false;
        curContext.useProgram(programObject3D);
        uniformi("usingTexture3d", programObject3D, "uUsingTexture", usingTexture);
      }

      // Reset some settings
      isCurve = false;
      isBezier = false;
      curveVertArray = [];
      curveVertCount = 0;
    };

    /**
     * The function splineForward() setup forward-differencing matrix to be used for speedy
     * curve rendering. It's based on using a specific number
     * of curve segments and just doing incremental adds for each
     * vertex of the segment, rather than running the mathematically
     * expensive cubic equation. This function is used by both curveDetail and bezierDetail.
     *
     * @param {int} segments      number of curve segments to use when drawing
     * @param {PMatrix3D} matrix  target object for the new matrix
     */
    var splineForward = function(segments, matrix) {
      var f = 1.0 / segments;
      var ff = f * f;
      var fff = ff * f;

      matrix.set(0, 0, 0, 1, fff, ff, f, 0, 6 * fff, 2 * ff, 0, 0, 6 * fff, 0, 0, 0);
    };

    /**
     * The curveInit() function set the number of segments to use when drawing a Catmull-Rom
     * curve, and setting the s parameter, which defines how tightly
     * the curve fits to each vertex. Catmull-Rom curves are actually
     * a subset of this curve type where the s is set to zero.
     * This in an internal function used by curveDetail() and curveTightness().
     */
    var curveInit = function() {
      // allocate only if/when used to save startup time
      if (!curveDrawMatrix) {
        curveBasisMatrix = new PMatrix3D();
        curveDrawMatrix = new PMatrix3D();
        curveInited = true;
      }

      var s = curTightness;
      curveBasisMatrix.set((s - 1) / 2, (s + 3) / 2, (-3 - s) / 2, (1 - s) / 2,
                           (1 - s), (-5 - s) / 2, (s + 2), (s - 1) / 2,
                           (s - 1) / 2, 0, (1 - s) / 2, 0, 0, 1, 0, 0);

      splineForward(curveDet, curveDrawMatrix);

      if (!bezierBasisInverse) {
        //bezierBasisInverse = bezierBasisMatrix.get();
        //bezierBasisInverse.invert();
        curveToBezierMatrix = new PMatrix3D();
      }

      // TODO only needed for PGraphicsJava2D? if so, move it there
      // actually, it's generally useful for other renderers, so keep it
      // or hide the implementation elsewhere.
      curveToBezierMatrix.set(curveBasisMatrix);
      curveToBezierMatrix.preApply(bezierBasisInverse);

      // multiply the basis and forward diff matrices together
      // saves much time since this needn't be done for each curve
      curveDrawMatrix.apply(curveBasisMatrix);
    };

    /**
     * Specifies vertex coordinates for Bezier curves. Each call to <b>bezierVertex()</b> defines the position of two control
     * points and one anchor point of a Bezier curve, adding a new segment to a line or shape. The first time
     * <b>bezierVertex()</b> is used within a <b>beginShape()</b> call, it must be prefaced with a call to <b>vertex()</b>
     * to set the first anchor point. This function must be used between <b>beginShape()</b> and <b>endShape()</b> and only
     * when there is no MODE parameter specified to <b>beginShape()</b>. Using the 3D version of requires rendering with P3D
     * or OPENGL (see the Environment reference for more information). <br /> <br /> <b>NOTE: </b> Fill does not work properly yet.
     *
     * @param {float | int} cx1 The x-coordinate of 1st control point
     * @param {float | int} cy1 The y-coordinate of 1st control point
     * @param {float | int} cz1 The z-coordinate of 1st control point
     * @param {float | int} cx2 The x-coordinate of 2nd control point
     * @param {float | int} cy2 The y-coordinate of 2nd control point
     * @param {float | int} cz2 The z-coordinate of 2nd control point
     * @param {float | int} x   The x-coordinate of the anchor point
     * @param {float | int} y   The y-coordinate of the anchor point
     * @param {float | int} z   The z-coordinate of the anchor point
     *
     * @see curveVertex
     * @see vertex
     * @see bezier
     */
    Drawing2D.prototype.bezierVertex = function() {
      isBezier = true;
      var vert = [];
      if (firstVert) {
        throw ("vertex() must be used at least once before calling bezierVertex()");
      }

      for (var i = 0; i < arguments.length; i++) {
        vert[i] = arguments[i];
      }
      vertArray.push(vert);
      vertArray[vertArray.length -1].isVert = false;
    };

    Drawing3D.prototype.bezierVertex = function() {
      isBezier = true;
      var vert = [];
      if (firstVert) {
        throw ("vertex() must be used at least once before calling bezierVertex()");
      }

      if (arguments.length === 9) {
        if (bezierDrawMatrix === undef) {
          bezierDrawMatrix = new PMatrix3D();
        }
        // setup matrix for forward differencing to speed up drawing
        var lastPoint = vertArray.length - 1;
        splineForward( bezDetail, bezierDrawMatrix );
        bezierDrawMatrix.apply( bezierBasisMatrix );
        var draw = bezierDrawMatrix.array();
        var x1 = vertArray[lastPoint][0],
            y1 = vertArray[lastPoint][1],
            z1 = vertArray[lastPoint][2];
        var xplot1 = draw[4] * x1 + draw[5] * arguments[0] + draw[6] * arguments[3] + draw[7] * arguments[6];
        var xplot2 = draw[8] * x1 + draw[9] * arguments[0] + draw[10]* arguments[3] + draw[11]* arguments[6];
        var xplot3 = draw[12]* x1 + draw[13]* arguments[0] + draw[14]* arguments[3] + draw[15]* arguments[6];

        var yplot1 = draw[4] * y1 + draw[5] * arguments[1] + draw[6] * arguments[4] + draw[7] * arguments[7];
        var yplot2 = draw[8] * y1 + draw[9] * arguments[1] + draw[10]* arguments[4] + draw[11]* arguments[7];
        var yplot3 = draw[12]* y1 + draw[13]* arguments[1] + draw[14]* arguments[4] + draw[15]* arguments[7];

        var zplot1 = draw[4] * z1 + draw[5] * arguments[2] + draw[6] * arguments[5] + draw[7] * arguments[8];
        var zplot2 = draw[8] * z1 + draw[9] * arguments[2] + draw[10]* arguments[5] + draw[11]* arguments[8];
        var zplot3 = draw[12]* z1 + draw[13]* arguments[2] + draw[14]* arguments[5] + draw[15]* arguments[8];
        for (var j = 0; j < bezDetail; j++) {
          x1 += xplot1; xplot1 += xplot2; xplot2 += xplot3;
          y1 += yplot1; yplot1 += yplot2; yplot2 += yplot3;
          z1 += zplot1; zplot1 += zplot2; zplot2 += zplot3;
          p.vertex(x1, y1, z1);
        }
        p.vertex(arguments[6], arguments[7], arguments[8]);
      }
    };

    /**
     * Sets a texture to be applied to vertex points. The <b>texture()</b> function
     * must be called between <b>beginShape()</b> and <b>endShape()</b> and before
     * any calls to vertex().
     *
     * When textures are in use, the fill color is ignored. Instead, use tint() to
     * specify the color of the texture as it is applied to the shape.
     *
     * @param {PImage} pimage the texture to apply
     *
     * @returns none
     *
     * @see textureMode
     * @see beginShape
     * @see endShape
     * @see vertex
    */
    p.texture = function(pimage) {
      var curContext = drawing.$ensureContext();

      if (pimage.__texture) {
        curContext.bindTexture(curContext.TEXTURE_2D, pimage.__texture);
      } else if (pimage.localName === "canvas") {
        curContext.bindTexture(curContext.TEXTURE_2D, canTex);
        curContext.texImage2D(curContext.TEXTURE_2D, 0, curContext.RGBA, curContext.RGBA, curContext.UNSIGNED_BYTE, pimage);
        curContext.texParameteri(curContext.TEXTURE_2D, curContext.TEXTURE_MAG_FILTER, curContext.LINEAR);
        curContext.texParameteri(curContext.TEXTURE_2D, curContext.TEXTURE_MIN_FILTER, curContext.LINEAR);
        curContext.generateMipmap(curContext.TEXTURE_2D);
        curTexture.width = pimage.width;
        curTexture.height = pimage.height;
      } else {
        var texture = curContext.createTexture(),
            cvs = document.createElement('canvas'),
            cvsTextureCtx = cvs.getContext('2d'),
            pot;

        // WebGL requires power of two textures
        if (pimage.width & (pimage.width-1) === 0) {
          cvs.width = pimage.width;
        } else {
          pot = 1;
          while (pot < pimage.width) {
            pot *= 2;
          }
          cvs.width = pot;
        }

        if (pimage.height & (pimage.height-1) === 0) {
          cvs.height = pimage.height;
        } else {
          pot = 1;
          while (pot < pimage.height) {
            pot *= 2;
          }
          cvs.height = pot;
        }

        cvsTextureCtx.drawImage(pimage.sourceImg, 0, 0, pimage.width, pimage.height, 0, 0, cvs.width, cvs.height);

        curContext.bindTexture(curContext.TEXTURE_2D, texture);
        curContext.texParameteri(curContext.TEXTURE_2D, curContext.TEXTURE_MIN_FILTER, curContext.LINEAR_MIPMAP_LINEAR);
        curContext.texParameteri(curContext.TEXTURE_2D, curContext.TEXTURE_MAG_FILTER, curContext.LINEAR);
        curContext.texParameteri(curContext.TEXTURE_2D, curContext.TEXTURE_WRAP_T, curContext.CLAMP_TO_EDGE);
        curContext.texParameteri(curContext.TEXTURE_2D, curContext.TEXTURE_WRAP_S, curContext.CLAMP_TO_EDGE);
        curContext.texImage2D(curContext.TEXTURE_2D, 0, curContext.RGBA, curContext.RGBA, curContext.UNSIGNED_BYTE, cvs);
        curContext.generateMipmap(curContext.TEXTURE_2D);

        pimage.__texture = texture;
        curTexture.width = pimage.width;
        curTexture.height = pimage.height;
      }

      usingTexture = true;
      curContext.useProgram(programObject3D);
      uniformi("usingTexture3d", programObject3D, "uUsingTexture", usingTexture);
    };

    /**
     * Sets the coordinate space for texture mapping. There are two options, IMAGE,
     * which refers to the actual coordinates of the image, and NORMALIZED, which
     * refers to a normalized space of values ranging from 0 to 1. The default mode
     * is IMAGE. In IMAGE, if an image is 100 x 200 pixels, mapping the image onto
     * the entire size of a quad would require the points (0,0) (0,100) (100,200) (0,200).
     * The same mapping in NORMAL_SPACE is (0,0) (0,1) (1,1) (0,1).
     *
     * @param MODE either IMAGE or NORMALIZED
     *
     * @returns none
     *
     * @see texture
    */
    p.textureMode = function(mode){
      curTextureMode = mode;
    };
    /**
     * The curveVertexSegment() function handle emitting a specific segment of Catmull-Rom curve. Internal helper function used by <b>curveVertex()</b>.
     */
    var curveVertexSegment = function(x1, y1, z1, x2, y2, z2, x3, y3, z3, x4, y4, z4) {
      var x0 = x2;
      var y0 = y2;
      var z0 = z2;

      var draw = curveDrawMatrix.array();

      var xplot1 = draw[4] * x1 + draw[5] * x2 + draw[6] * x3 + draw[7] * x4;
      var xplot2 = draw[8] * x1 + draw[9] * x2 + draw[10] * x3 + draw[11] * x4;
      var xplot3 = draw[12] * x1 + draw[13] * x2 + draw[14] * x3 + draw[15] * x4;

      var yplot1 = draw[4] * y1 + draw[5] * y2 + draw[6] * y3 + draw[7] * y4;
      var yplot2 = draw[8] * y1 + draw[9] * y2 + draw[10] * y3 + draw[11] * y4;
      var yplot3 = draw[12] * y1 + draw[13] * y2 + draw[14] * y3 + draw[15] * y4;

      var zplot1 = draw[4] * z1 + draw[5] * z2 + draw[6] * z3 + draw[7] * z4;
      var zplot2 = draw[8] * z1 + draw[9] * z2 + draw[10] * z3 + draw[11] * z4;
      var zplot3 = draw[12] * z1 + draw[13] * z2 + draw[14] * z3 + draw[15] * z4;

      p.vertex(x0, y0, z0);
      for (var j = 0; j < curveDet; j++) {
        x0 += xplot1; xplot1 += xplot2; xplot2 += xplot3;
        y0 += yplot1; yplot1 += yplot2; yplot2 += yplot3;
        z0 += zplot1; zplot1 += zplot2; zplot2 += zplot3;
        p.vertex(x0, y0, z0);
      }
    };

    /**
     * Specifies vertex coordinates for curves. This function may only be used between <b>beginShape()</b> and
     * <b>endShape()</b> and only when there is no MODE parameter specified to <b>beginShape()</b>. The first and last points
     * in a series of <b>curveVertex()</b> lines will be used to guide the beginning and end of a the curve. A minimum of four
     * points is required to draw a tiny curve between the second and third points. Adding a fifth point with
     * <b>curveVertex()</b> will draw the curve between the second, third, and fourth points. The <b>curveVertex()</b> function
     * is an implementation of Catmull-Rom splines. Using the 3D version of requires rendering with P3D or OPENGL (see the
     * Environment reference for more information). <br /> <br /><b>NOTE: </b> Fill does not work properly yet.
     *
     * @param {float | int} x The x-coordinate of the vertex
     * @param {float | int} y The y-coordinate of the vertex
     * @param {float | int} z The z-coordinate of the vertex
     *
     * @see curve
     * @see beginShape
     * @see endShape
     * @see vertex
     * @see bezierVertex
     */
    Drawing2D.prototype.curveVertex = function(x, y) {
      isCurve = true;

      p.vertex(x, y);
    };

    Drawing3D.prototype.curveVertex = function(x, y, z) {
      isCurve = true;

      if (!curveInited) {
        curveInit();
      }
      var vert = [];
      vert[0] = x;
      vert[1] = y;
      vert[2] = z;
      curveVertArray.push(vert);
      curveVertCount++;

      if (curveVertCount > 3) {
        curveVertexSegment( curveVertArray[curveVertCount-4][0],
                            curveVertArray[curveVertCount-4][1],
                            curveVertArray[curveVertCount-4][2],
                            curveVertArray[curveVertCount-3][0],
                            curveVertArray[curveVertCount-3][1],
                            curveVertArray[curveVertCount-3][2],
                            curveVertArray[curveVertCount-2][0],
                            curveVertArray[curveVertCount-2][1],
                            curveVertArray[curveVertCount-2][2],
                            curveVertArray[curveVertCount-1][0],
                            curveVertArray[curveVertCount-1][1],
                            curveVertArray[curveVertCount-1][2] );
      }
    };

    /**
     * The curve() function draws a curved line on the screen. The first and second parameters
     * specify the beginning control point and the last two parameters specify
     * the ending control point. The middle parameters specify the start and
     * stop of the curve. Longer curves can be created by putting a series of
     * <b>curve()</b> functions together or using <b>curveVertex()</b>.
     * An additional function called <b>curveTightness()</b> provides control
     * for the visual quality of the curve. The <b>curve()</b> function is an
     * implementation of Catmull-Rom splines. Using the 3D version of requires
     * rendering with P3D or OPENGL (see the Environment reference for more
     * information).
     *
     * @param {int|float} x1 coordinates for the beginning control point
     * @param {int|float} y1 coordinates for the beginning control point
     * @param {int|float} z1 coordinates for the beginning control point
     * @param {int|float} x2 coordinates for the first point
     * @param {int|float} y2 coordinates for the first point
     * @param {int|float} z2 coordinates for the first point
     * @param {int|float} x3 coordinates for the second point
     * @param {int|float} y3 coordinates for the second point
     * @param {int|float} z3 coordinates for the second point
     * @param {int|float} x4 coordinates for the ending control point
     * @param {int|float} y4 coordinates for the ending control point
     * @param {int|float} z4 coordinates for the ending control point
     *
     * @see #curveVertex()
     * @see #curveTightness()
     * @see #bezier()
     */
    Drawing2D.prototype.curve = function(x1, y1, x2, y2, x3, y3, x4, y4) {
      p.beginShape();
      p.curveVertex(x1, y1);
      p.curveVertex(x2, y2);
      p.curveVertex(x3, y3);
      p.curveVertex(x4, y4);
      p.endShape();
    };

    Drawing3D.prototype.curve = function(x1, y1, z1, x2, y2, z2, x3, y3, z3, x4, y4, z4) {
      if (z4 !== undef) {
        p.beginShape();
        p.curveVertex(x1, y1, z1);
        p.curveVertex(x2, y2, z2);
        p.curveVertex(x3, y3, z3);
        p.curveVertex(x4, y4, z4);
        p.endShape();
        return;
      }
      p.beginShape();
      p.curveVertex(x1, y1);
      p.curveVertex(z1, x2);
      p.curveVertex(y2, z2);
      p.curveVertex(x3, y3);
      p.endShape();
    };

    /**
     * The curveTightness() function modifies the quality of forms created with <b>curve()</b> and
     * <b>curveVertex()</b>. The parameter <b>squishy</b> determines how the
     * curve fits to the vertex points. The value 0.0 is the default value for
     * <b>squishy</b> (this value defines the curves to be Catmull-Rom splines)
     * and the value 1.0 connects all the points with straight lines.
     * Values within the range -5.0 and 5.0 will deform the curves but
     * will leave them recognizable and as values increase in magnitude,
     * they will continue to deform.
     *
     * @param {float} tightness amount of deformation from the original vertices
     *
     * @see #curve()
     * @see #curveVertex()
     *
     */
    p.curveTightness = function(tightness) {
      curTightness = tightness;
    };

    /**
     * The curveDetail() function sets the resolution at which curves display. The default value is 20.
     * This function is only useful when using the P3D or OPENGL renderer.
     *
     * @param {int} detail resolution of the curves
     *
     * @see curve()
     * @see curveVertex()
     * @see curveTightness()
     */
    p.curveDetail = function(detail) {
      curveDet = detail;
      curveInit();
    };

    /**
    * Modifies the location from which rectangles draw. The default mode is rectMode(CORNER), which
    * specifies the location to be the upper left corner of the shape and uses the third and fourth
    * parameters of rect() to specify the width and height. The syntax rectMode(CORNERS) uses the
    * first and second parameters of rect() to set the location of one corner and uses the third and
    * fourth parameters to set the opposite corner. The syntax rectMode(CENTER) draws the image from
    * its center point and uses the third and forth parameters of rect() to specify the image's width
    * and height. The syntax rectMode(RADIUS) draws the image from its center point and uses the third
    * and forth parameters of rect()  to specify half of the image's width and height. The parameter must
    * be written in ALL CAPS because Processing is a case sensitive language. Note: In version 125, the
    * mode named CENTER_RADIUS was shortened to RADIUS.
    *
    * @param {MODE} MODE      Either CORNER, CORNERS, CENTER, or RADIUS
    *
    * @see rect
    */
    p.rectMode = function(aRectMode) {
      curRectMode = aRectMode;
    };

    /**
    * Modifies the location from which images draw. The default mode is imageMode(CORNER), which specifies
    * the location to be the upper left corner and uses the fourth and fifth parameters of image() to set
    * the image's width and height. The syntax imageMode(CORNERS) uses the second and third parameters of
    * image() to set the location of one corner of the image and uses the fourth and fifth parameters to
    * set the opposite corner. Use imageMode(CENTER) to draw images centered at the given x and y position.
    * The parameter to imageMode() must be written in ALL CAPS because Processing is a case sensitive language.
    *
    * @param {MODE} MODE      Either CORNER, CORNERS, or CENTER
    *
    * @see loadImage
    * @see PImage
    * @see image
    * @see background
    */
    p.imageMode = function(mode) {
      switch (mode) {
      case PConstants.CORNER:
        imageModeConvert = imageModeCorner;
        break;
      case PConstants.CORNERS:
        imageModeConvert = imageModeCorners;
        break;
      case PConstants.CENTER:
        imageModeConvert = imageModeCenter;
        break;
      default:
        throw "Invalid imageMode";
      }
    };

    /**
    * The origin of the ellipse is modified by the ellipseMode() function. The default configuration is
    * ellipseMode(CENTER), which specifies the location of the ellipse as the center of the shape. The RADIUS
    * mode is the same, but the width and height parameters to ellipse()  specify the radius of the ellipse,
    * rather than the diameter. The CORNER mode draws the shape from the upper-left corner of its bounding box.
    * The CORNERS mode uses the four parameters to ellipse() to set two opposing corners of the ellipse's bounding
    * box. The parameter must be written in "ALL CAPS" because Processing is a case sensitive language.
    *
    * @param {MODE} MODE      Either CENTER, RADIUS, CORNER, or CORNERS.
    *
    * @see ellipse
    */
    p.ellipseMode = function(aEllipseMode) {
      curEllipseMode = aEllipseMode;
    };

    /**
     * The arc() function draws an arc in the display window.
     * Arcs are drawn along the outer edge of an ellipse defined by the
     * <b>x</b>, <b>y</b>, <b>width</b> and <b>height</b> parameters.
     * The origin or the arc's ellipse may be changed with the
     * <b>ellipseMode()</b> function.
     * The <b>start</b> and <b>stop</b> parameters specify the angles
     * at which to draw the arc.
     *
     * @param {float} a       x-coordinate of the arc's ellipse
     * @param {float} b       y-coordinate of the arc's ellipse
     * @param {float} c       width of the arc's ellipse
     * @param {float} d       height of the arc's ellipse
     * @param {float} start   angle to start the arc, specified in radians
     * @param {float} stop    angle to stop the arc, specified in radians
     * @param {enum}  mode    drawing mode (OPEN, CHORD, PIE)
     *
     * @see #ellipseMode()
     * @see #ellipse()
     */
    p.arc = function(x, y, width, height, start, stop, mode) {
      if (width <= 0 || stop < start) { return; }

      if (curEllipseMode === PConstants.CORNERS) {
        width = width - x;
        height = height - y;
      } else if (curEllipseMode === PConstants.RADIUS) {
        x = x - width;
        y = y - height;
        width = width * 2;
        height = height * 2;
      } else if (curEllipseMode === PConstants.CENTER) {
        x = x - width/2;
        y = y - height/2;
      }
      // make sure that we're starting at a useful point
      while (start < 0) {
        start += PConstants.TWO_PI;
        stop += PConstants.TWO_PI;
      }
      if (stop - start > PConstants.TWO_PI) {
        // don't change start, it is visible in PIE mode
        stop = start + PConstants.TWO_PI;
      }
      var hr = width / 2,
          vr = height / 2,
          centerX = x + hr,
          centerY = y + vr,
          step = 1/(hr+vr);

      var drawSlice = (function(x, y, start, step, stop) {
        return function(p, closed, i, a, e) {
          i = 0;
          a = start;
          e = stop + step;
          p.beginShape();
          if(closed) { p.vertex(x-0.5, y-0.5); }
          for (; a < e; i++, a = i*step + start) {
            p.vertex(
              (x + Math.cos(a) * hr)|0,
              (y + Math.sin(a) * vr)|0
            );
          }

          if (mode === PConstants.OPEN && doFill) {
            p.vertex(centerX + Math.cos(start) * hr, centerY + Math.sin(start) * vr);
          } else if (mode === PConstants.CHORD) {
            p.vertex(centerX + Math.cos(start) * hr, centerY + Math.sin(start) * vr);
          } else if (mode === PConstants.PIE) {
            p.line(centerX + Math.cos(start) * hr, centerY + Math.sin(start) * vr, centerX, centerY);
            p.line(centerX, centerY, centerX + Math.cos(stop) * hr, centerY + Math.sin(stop) * vr);
          }

          p.endShape(closed ? PConstants.CLOSE : undefined);
        };
      }(centerX+0.5, centerY+0.5, start, step, stop));

      if (doFill) {
        var savedStroke = doStroke;
        doStroke = false;
        drawSlice(p, true);
        doStroke = savedStroke;
      }

      if (doStroke) {
        var savedFill = doFill;
        doFill = false;
        drawSlice(p);
        doFill = savedFill;
      }
    };

    /**
    * Draws a line (a direct path between two points) to the screen. The version of line() with four parameters
    * draws the line in 2D. To color a line, use the stroke() function. A line cannot be filled, therefore the
    * fill()  method will not affect the color of a line. 2D lines are drawn with a width of one pixel by default,
    * but this can be changed with the strokeWeight()  function. The version with six parameters allows the line
    * to be placed anywhere within XYZ space. Drawing this shape in 3D using the z parameter requires the P3D or
    * OPENGL parameter in combination with size.
    *
    * @param {int|float} x1       x-coordinate of the first point
    * @param {int|float} y1       y-coordinate of the first point
    * @param {int|float} z1       z-coordinate of the first point
    * @param {int|float} x2       x-coordinate of the second point
    * @param {int|float} y2       y-coordinate of the second point
    * @param {int|float} z2       z-coordinate of the second point
    *
    * @see strokeWeight
    * @see strokeJoin
    * @see strokeCap
    * @see beginShape
    */
    Drawing2D.prototype.line = function(x1, y1, x2, y2) {
      if (!doStroke) {
        return;
      }
      if (!renderSmooth) {
        x1 = Math.round(x1);
        x2 = Math.round(x2);
        y1 = Math.round(y1);
        y2 = Math.round(y2);
      }

      // A line is only defined if it has different start and end coordinates.
      // If they are the same, we call point instead.
      if (x1 === x2 && y1 === y2) {
        p.point(x1, y1);
        return;
      }

      var swap = undef,
          lineCap = undef,
          drawCrisp = true,
          currentModelView = modelView.array(),
          identityMatrix = [1, 0, 0, 0, 1, 0];
      // Test if any transformations have been applied to the sketch
      for (var i = 0; i < 6 && drawCrisp; i++) {
        drawCrisp = currentModelView[i] === identityMatrix[i];
      }
      /* Draw crisp lines if the line is vertical or horizontal with the following method
       * If any transformations have been applied to the sketch, don't make the line crisp
       * If the line is directed up or to the left, reverse it by swapping x1/x2 or y1/y2
       * Make the line 1 pixel longer to work around cross-platform canvas implementations
       * If the lineWidth is odd, translate the line by 0.5 in the perpendicular direction
       * Even lineWidths do not need to be translated because the canvas will draw them on pixel boundaries
       * Change the cap to butt-end to work around cross-platform canvas implementations
       * Reverse the translate and lineCap canvas state changes after drawing the line
       */
      if (drawCrisp) {
        if (x1 === x2) {
          if (y1 > y2) {
            swap = y1;
            y1 = y2;
            y2 = swap;
          }
          y2++;
          if (lineWidth % 2 === 1) {
            curContext.translate(0.5, 0.0);
          }
        } else if (y1 === y2) {
          if (x1 > x2) {
            swap = x1;
            x1 = x2;
            x2 = swap;
          }
          x2++;
          if (lineWidth % 2 === 1) {
            curContext.translate(0.0, 0.5);
          }
        }
        if (lineWidth === 1) {
          lineCap = curContext.lineCap;
          curContext.lineCap = 'butt';
        }
      }
      curContext.beginPath();
      curContext.moveTo(x1 || 0, y1 || 0);
      curContext.lineTo(x2 || 0, y2 || 0);
      executeContextStroke();
      if (drawCrisp) {
        if (x1 === x2 && lineWidth % 2 === 1) {
          curContext.translate(-0.5, 0.0);
        } else if (y1 === y2 && lineWidth % 2 === 1) {
          curContext.translate(0.0, -0.5);
        }
        if (lineWidth === 1) {
          curContext.lineCap = lineCap;
        }
      }
    };

    Drawing3D.prototype.line = function(x1, y1, z1, x2, y2, z2) {
      if (y2 === undef || z2 === undef) { // 2D line called in 3D context
        z2 = 0;
        y2 = x2;
        x2 = z1;
        z1 = 0;
      }

      // a line is only defined if it has different start and end coordinates.
      // If they are the same, we call point instead.
      if (x1===x2 && y1===y2 && z1===z2) {
        p.point(x1,y1,z1);
        return;
      }

      var lineVerts = [x1, y1, z1, x2, y2, z2];

      var view = new PMatrix3D();
      view.scale(1, -1, 1);
      view.apply(modelView.array());
      view.transpose();

      if (lineWidth > 0 && doStroke) {
        curContext.useProgram(programObject2D);

        uniformMatrix("uModel2d", programObject2D, "uModel", false, [1,0,0,0,  0,1,0,0,  0,0,1,0,  0,0,0,1]);
        uniformMatrix("uView2d", programObject2D, "uView", false, view.array());

        uniformf("uColor2d", programObject2D, "uColor", strokeStyle);
        uniformi("uIsDrawingText", programObject2D, "uIsDrawingText", false);

        vertexAttribPointer("aVertex2d", programObject2D, "aVertex", 3, lineBuffer);
        disableVertexAttribPointer("aTextureCoord2d", programObject2D, "aTextureCoord");

        curContext.bufferData(curContext.ARRAY_BUFFER, new Float32Array(lineVerts), curContext.STREAM_DRAW);
        curContext.drawArrays(curContext.LINES, 0, 2);
      }
    };

    /**
     * Draws a Bezier curve on the screen. These curves are defined by a series of anchor and control points. The first
     * two parameters specify the first anchor point and the last two parameters specify the other anchor point. The
     * middle parameters specify the control points which define the shape of the curve. Bezier curves were developed
     * by French engineer Pierre Bezier. Using the 3D version of requires rendering with P3D or OPENGL (see the
     * Environment reference for more information).
     *
     * @param {int | float} x1,y1,z1    coordinates for the first anchor point
     * @param {int | float} cx1,cy1,cz1 coordinates for the first control point
     * @param {int | float} cx2,cy2,cz2 coordinates for the second control point
     * @param {int | float} x2,y2,z2    coordinates for the second anchor point
     *
     * @see bezierVertex
     * @see curve
     */
    Drawing2D.prototype.bezier = function() {
      if (arguments.length !== 8) {
        throw("You must use 8 parameters for bezier() in 2D mode");
      }

      p.beginShape();
      p.vertex( arguments[0], arguments[1] );
      p.bezierVertex( arguments[2], arguments[3],
                      arguments[4], arguments[5],
                      arguments[6], arguments[7] );
      p.endShape();
    };

    Drawing3D.prototype.bezier = function() {
      if (arguments.length !== 12) {
        throw("You must use 12 parameters for bezier() in 3D mode");
      }

      p.beginShape();
      p.vertex( arguments[0], arguments[1], arguments[2] );
      p.bezierVertex( arguments[3], arguments[4], arguments[5],
                      arguments[6], arguments[7], arguments[8],
                      arguments[9], arguments[10], arguments[11] );
      p.endShape();
    };

    /**
     * Sets the resolution at which Beziers display. The default value is 20. This function is only useful when using the P3D
     * or OPENGL renderer as the default (JAVA2D) renderer does not use this information.
     *
     * @param {int} detail resolution of the curves
     *
     * @see curve
     * @see curveVertex
     * @see curveTightness
     */
    p.bezierDetail = function( detail ){
      bezDetail = detail;
    };

    /**
     * The bezierPoint() function evalutes quadratic bezier at point t for points a, b, c, d.
     * The parameter t varies between 0 and 1. The a and d parameters are the
     * on-curve points, b and c are the control points. To make a two-dimensional
     * curve, call this function once with the x coordinates and a second time
     * with the y coordinates to get the location of a bezier curve at t.
     *
     * @param {float} a   coordinate of first point on the curve
     * @param {float} b   coordinate of first control point
     * @param {float} c   coordinate of second control point
     * @param {float} d   coordinate of second point on the curve
     * @param {float} t   value between 0 and 1
     *
     * @see #bezier()
     * @see #bezierVertex()
     * @see #curvePoint()
     */
    p.bezierPoint = function(a, b, c, d, t) {
      return (1 - t) * (1 - t) * (1 - t) * a + 3 * (1 - t) * (1 - t) * t * b + 3 * (1 - t) * t * t * c + t * t * t * d;
    };

    /**
     * The bezierTangent() function calculates the tangent of a point on a Bezier curve. There is a good
     * definition of "tangent" at Wikipedia: <a href="http://en.wikipedia.org/wiki/Tangent" target="new">http://en.wikipedia.org/wiki/Tangent</a>
     *
     * @param {float} a   coordinate of first point on the curve
     * @param {float} b   coordinate of first control point
     * @param {float} c   coordinate of second control point
     * @param {float} d   coordinate of second point on the curve
     * @param {float} t   value between 0 and 1
     *
     * @see #bezier()
     * @see #bezierVertex()
     * @see #curvePoint()
     */
    p.bezierTangent = function(a, b, c, d, t) {
      return (3 * t * t * (-a + 3 * b - 3 * c + d) + 6 * t * (a - 2 * b + c) + 3 * (-a + b));
    };

    /**
     * The curvePoint() function evalutes the Catmull-Rom curve at point t for points a, b, c, d. The
     * parameter t varies between 0 and 1, a and d are points on the curve,
     * and b and c are the control points. This can be done once with the x
     * coordinates and a second time with the y coordinates to get the
     * location of a curve at t.
     *
     * @param {int|float} a   coordinate of first point on the curve
     * @param {int|float} b   coordinate of second point on the curve
     * @param {int|float} c   coordinate of third point on the curve
     * @param {int|float} d   coordinate of fourth point on the curve
     * @param {float} t       value between 0 and 1
     *
     * @see #curve()
     * @see #curveVertex()
     * @see #bezierPoint()
     */
    p.curvePoint = function(a, b, c, d, t) {
      return 0.5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
    };

    /**
     * The curveTangent() function calculates the tangent of a point on a Catmull-Rom curve.
     * There is a good definition of "tangent" at Wikipedia: <a href="http://en.wikipedia.org/wiki/Tangent" target="new">http://en.wikipedia.org/wiki/Tangent</a>.
     *
     * @param {int|float} a   coordinate of first point on the curve
     * @param {int|float} b   coordinate of first control point
     * @param {int|float} c   coordinate of second control point
     * @param {int|float} d   coordinate of second point on the curve
     * @param {float} t       value between 0 and 1
     *
     * @see #curve()
     * @see #curveVertex()
     * @see #curvePoint()
     * @see #bezierTangent()
     */
    p.curveTangent = function(a, b, c, d, t) {
      return 0.5 * ((-a + c) + 2 * (2 * a - 5 * b + 4 * c - d) * t + 3 * (-a + 3 * b - 3 * c + d) * t * t);
    };

    /**
     * A triangle is a plane created by connecting three points. The first two arguments specify the first point,
     * the middle two arguments specify the second point, and the last two arguments specify the third point.
     *
     * @param {int | float} x1 x-coordinate of the first point
     * @param {int | float} y1 y-coordinate of the first point
     * @param {int | float} x2 x-coordinate of the second point
     * @param {int | float} y2 y-coordinate of the second point
     * @param {int | float} x3 x-coordinate of the third point
     * @param {int | float} y3 y-coordinate of the third point
     */
    p.triangle = function(x1, y1, x2, y2, x3, y3) {
      p.beginShape(PConstants.TRIANGLES);
      p.vertex(x1, y1, 0);
      p.vertex(x2, y2, 0);
      p.vertex(x3, y3, 0);
      p.endShape();
    };

    /**
     * A quad is a quadrilateral, a four sided polygon. It is similar to a rectangle, but the angles between its
     * edges are not constrained to ninety degrees. The first pair of parameters (x1,y1) sets the first vertex
     * and the subsequent pairs should proceed clockwise or counter-clockwise around the defined shape.
     *
     * @param {float | int} x1 x-coordinate of the first corner
     * @param {float | int} y1 y-coordinate of the first corner
     * @param {float | int} x2 x-coordinate of the second corner
     * @param {float | int} y2 y-coordinate of the second corner
     * @param {float | int} x3 x-coordinate of the third corner
     * @param {float | int} y3 y-coordinate of the third corner
     * @param {float | int} x4 x-coordinate of the fourth corner
     * @param {float | int} y4 y-coordinate of the fourth corner
     */
    p.quad = function(x1, y1, x2, y2, x3, y3, x4, y4) {
      p.beginShape(PConstants.QUADS);
      p.vertex(x1, y1, 0);
      p.vertex(x2, y2, 0);
      p.vertex(x3, y3, 0);
      p.vertex(x4, y4, 0);
      p.endShape();
    };

    var roundedRect$2d = function(x, y, width, height, tl, tr, br, bl) {
      if (bl === undef) {
        tr = tl;
        br = tl;
        bl = tl;
      }
      var halfWidth = width / 2,
          halfHeight = height / 2;
      if (tl > halfWidth || tl > halfHeight) {
        tl = Math.min(halfWidth, halfHeight);
      }
      if (tr > halfWidth || tr > halfHeight) {
        tr = Math.min(halfWidth, halfHeight);
      }
      if (br > halfWidth || br > halfHeight) {
        br = Math.min(halfWidth, halfHeight);
      }
      if (bl > halfWidth || bl > halfHeight) {
        bl = Math.min(halfWidth, halfHeight);
      }
      // Translate the stroke by (0.5, 0.5) to draw a crisp border
      if (!doFill || doStroke) {
        curContext.translate(0.5, 0.5);
      }
      curContext.beginPath();
      curContext.moveTo(x + tl, y);
      curContext.lineTo(x + width - tr, y);
      curContext.quadraticCurveTo(x + width, y, x + width, y + tr);
      curContext.lineTo(x + width, y + height - br);
      curContext.quadraticCurveTo(x + width, y + height, x + width - br, y + height);
      curContext.lineTo(x + bl, y + height);
      curContext.quadraticCurveTo(x, y + height, x, y + height - bl);
      curContext.lineTo(x, y + tl);
      curContext.quadraticCurveTo(x, y, x + tl, y);
      if (!doFill || doStroke) {
        curContext.translate(-0.5, -0.5);
      }
      executeContextFill();
      executeContextStroke();
    };

    /**
    * Draws a rectangle to the screen. A rectangle is a four-sided shape with every angle at ninety
    * degrees. The first two parameters set the location, the third sets the width, and the fourth
    * sets the height. The origin is changed with the rectMode() function.
    *
    * @param {int|float} x        x-coordinate of the rectangle
    * @param {int|float} y        y-coordinate of the rectangle
    * @param {int|float} width    width of the rectangle
    * @param {int|float} height   height of the rectangle
    *
    * @see rectMode
    * @see quad
    */
    Drawing2D.prototype.rect = function(x, y, width, height, tl, tr, br, bl) {
      // width and height need to be defined, numerical values
      if (width!=''+width && height!=''+height) {
        return;
      }

      if (curRectMode === PConstants.CORNERS) {
        width -= x;
        height -= y;
      } else if (curRectMode === PConstants.RADIUS) {
        width *= 2;
        height *= 2;
        x -= width / 2;
        y -= height / 2;
      } else if (curRectMode === PConstants.CENTER) {
        x -= width / 2;
        y -= height / 2;
      }

      if (!renderSmooth) {
        x = Math.round(x);
        y = Math.round(y);
        width = Math.round(width);
        height = Math.round(height);
      }
      if (tl !== undef) {
        roundedRect$2d(x, y, width, height, tl, tr, br, bl);
        return;
      }

      // Translate the line by (0.5, 0.5) to draw a crisp rectangle border
      if (doStroke && lineWidth % 2 === 1) {
        curContext.translate(0.5, 0.5);
      }
      curContext.beginPath();
      curContext.rect(x, y, width, height);
      executeContextFill();
      executeContextStroke();
      if (doStroke && lineWidth % 2 === 1) {
        curContext.translate(-0.5, -0.5);
      }
    };

    Drawing3D.prototype.rect = function(x, y, width, height, tl, tr, br, bl) {
      if (tl !== undef) {
        throw "rect() with rounded corners is not supported in 3D mode";
      }

      if (curRectMode === PConstants.CORNERS) {
        width -= x;
        height -= y;
      } else if (curRectMode === PConstants.RADIUS) {
        width *= 2;
        height *= 2;
        x -= width / 2;
        y -= height / 2;
      } else if (curRectMode === PConstants.CENTER) {
        x -= width / 2;
        y -= height / 2;
      }

      // Modeling transformation
      var model = new PMatrix3D();
      model.translate(x, y, 0);
      model.scale(width, height, 1);
      model.transpose();

      // viewing transformation needs to have Y flipped
      // becuase that's what Processing does.
      var view = new PMatrix3D();
      view.scale(1, -1, 1);
      view.apply(modelView.array());
      view.transpose();

      if (lineWidth > 0 && doStroke) {
        curContext.useProgram(programObject2D);
        uniformMatrix("uModel2d", programObject2D, "uModel", false, model.array());
        uniformMatrix("uView2d", programObject2D, "uView", false, view.array());
        uniformf("uColor2d", programObject2D, "uColor", strokeStyle);
        uniformi("uIsDrawingText2d", programObject2D, "uIsDrawingText", false);
        vertexAttribPointer("aVertex2d", programObject2D, "aVertex", 3, rectBuffer);
        disableVertexAttribPointer("aTextureCoord2d", programObject2D, "aTextureCoord");
        curContext.drawArrays(curContext.LINE_LOOP, 0, rectVerts.length / 3);
      }

      if (doFill) {
        curContext.useProgram(programObject3D);
        uniformMatrix("uModel3d", programObject3D, "uModel", false, model.array());
        uniformMatrix("uView3d", programObject3D, "uView", false, view.array());

        // fix stitching problems. (lines get occluded by triangles
        // since they share the same depth values). This is not entirely
        // working, but it's a start for drawing the outline. So
        // developers can start playing around with styles.
        curContext.enable(curContext.POLYGON_OFFSET_FILL);
        curContext.polygonOffset(1, 1);

        uniformf("color3d", programObject3D, "uColor", fillStyle);

        if(lightCount > 0){
          var v = new PMatrix3D();
          v.set(view);

          var m = new PMatrix3D();
          m.set(model);

          v.mult(m);

          var normalMatrix = new PMatrix3D();
          normalMatrix.set(v);
          normalMatrix.invert();
          normalMatrix.transpose();

          uniformMatrix("uNormalTransform3d", programObject3D, "uNormalTransform", false, normalMatrix.array());
          vertexAttribPointer("aNormal3d", programObject3D, "aNormal", 3, rectNormBuffer);
        }
        else{
          disableVertexAttribPointer("normal3d", programObject3D, "aNormal");
        }

        vertexAttribPointer("vertex3d", programObject3D, "aVertex", 3, rectBuffer);

        curContext.drawArrays(curContext.TRIANGLE_FAN, 0, rectVerts.length / 3);
        curContext.disable(curContext.POLYGON_OFFSET_FILL);
      }
    };

    /**
     * Draws an ellipse (oval) in the display window. An ellipse with an equal <b>width</b> and <b>height</b> is a circle.
     * The first two parameters set the location, the third sets the width, and the fourth sets the height. The origin may be
     * changed with the <b>ellipseMode()</b> function.
     *
     * @param {float|int} x      x-coordinate of the ellipse
     * @param {float|int} y      y-coordinate of the ellipse
     * @param {float|int} width  width of the ellipse
     * @param {float|int} height height of the ellipse
     *
     * @see ellipseMode
     */
    Drawing2D.prototype.ellipse = function(x, y, width, height) {
      x = x || 0;
      y = y || 0;

      if (width <= 0 && height <= 0) {
        return;
      }

      if (curEllipseMode === PConstants.RADIUS) {
        width *= 2;
        height *= 2;
      } else if (curEllipseMode === PConstants.CORNERS) {
        width = width - x;
        height = height - y;
        x += width / 2;
        y += height / 2;
      } else if (curEllipseMode === PConstants.CORNER) {
        x += width / 2;
        y += height / 2;
      }

      // Shortcut for drawing a 2D circle
      if (width === height) {
        curContext.beginPath();
        curContext.arc(x, y, width / 2, 0, PConstants.TWO_PI, false);
        executeContextFill();
        executeContextStroke();
      } else {
        var w = width / 2,
            h = height / 2,
            C = 0.5522847498307933,
            c_x = C * w,
            c_y = C * h;

        p.beginShape();
        p.vertex(x + w, y);
        p.bezierVertex(x + w, y - c_y, x + c_x, y - h, x, y - h);
        p.bezierVertex(x - c_x, y - h, x - w, y - c_y, x - w, y);
        p.bezierVertex(x - w, y + c_y, x - c_x, y + h, x, y + h);
        p.bezierVertex(x + c_x, y + h, x + w, y + c_y, x + w, y);
        p.endShape();
      }
    };

    Drawing3D.prototype.ellipse = function(x, y, width, height) {
      x = x || 0;
      y = y || 0;

      if (width <= 0 && height <= 0) {
        return;
      }

      if (curEllipseMode === PConstants.RADIUS) {
        width *= 2;
        height *= 2;
      } else if (curEllipseMode === PConstants.CORNERS) {
        width = width - x;
        height = height - y;
        x += width / 2;
        y += height / 2;
      } else if (curEllipseMode === PConstants.CORNER) {
        x += width / 2;
        y += height / 2;
      }

      var w = width / 2,
          h = height / 2,
          C = 0.5522847498307933,
          c_x = C * w,
          c_y = C * h;

      p.beginShape();
      p.vertex(x + w, y);
      p.bezierVertex(x + w, y - c_y, 0, x + c_x, y - h, 0, x, y - h, 0);
      p.bezierVertex(x - c_x, y - h, 0, x - w, y - c_y, 0, x - w, y, 0);
      p.bezierVertex(x - w, y + c_y, 0, x - c_x, y + h, 0, x, y + h, 0);
      p.bezierVertex(x + c_x, y + h, 0, x + w, y + c_y, 0, x + w, y, 0);
      p.endShape();

      if (doFill) {
        //temporary workaround to not working fills for bezier -- will fix later
        var xAv = 0, yAv = 0, i, j;
        for (i = 0; i < vertArray.length; i++) {
          xAv += vertArray[i][0];
          yAv += vertArray[i][1];
        }
        xAv /= vertArray.length;
        yAv /= vertArray.length;
        var vert = [],
            fillVertArray = [],
            colorVertArray = [];
        vert[0] = xAv;
        vert[1] = yAv;
        vert[2] = 0;
        vert[3] = 0;
        vert[4] = 0;
        vert[5] = fillStyle[0];
        vert[6] = fillStyle[1];
        vert[7] = fillStyle[2];
        vert[8] = fillStyle[3];
        vert[9] = strokeStyle[0];
        vert[10] = strokeStyle[1];
        vert[11] = strokeStyle[2];
        vert[12] = strokeStyle[3];
        vert[13] = normalX;
        vert[14] = normalY;
        vert[15] = normalZ;
        vertArray.unshift(vert);
        for (i = 0; i < vertArray.length; i++) {
          for (j = 0; j < 3; j++) {
            fillVertArray.push(vertArray[i][j]);
          }
          for (j = 5; j < 9; j++) {
            colorVertArray.push(vertArray[i][j]);
          }
        }
        fill3D(fillVertArray, "TRIANGLE_FAN", colorVertArray);
      }
    };

    /**
    * Sets the current normal vector. This is for drawing three dimensional shapes and surfaces and
    * specifies a vector perpendicular to the surface of the shape which determines how lighting affects
    * it. Processing attempts to automatically assign normals to shapes, but since that's imperfect,
    * this is a better option when you want more control. This function is identical to glNormal3f() in OpenGL.
    *
    * @param {float} nx       x direction
    * @param {float} ny       y direction
    * @param {float} nz       z direction
    *
    * @see beginShape
    * @see endShape
    * @see lights
    */
    p.normal = function(nx, ny, nz) {
      if (arguments.length !== 3 || !(typeof nx === "number" && typeof ny === "number" && typeof nz === "number")) {
        throw "normal() requires three numeric arguments.";
      }

      normalX = nx;
      normalY = ny;
      normalZ = nz;

      if (curShape !== 0) {
        if (normalMode === PConstants.NORMAL_MODE_AUTO) {
          normalMode = PConstants.NORMAL_MODE_SHAPE;
        } else if (normalMode === PConstants.NORMAL_MODE_SHAPE) {
          normalMode = PConstants.NORMAL_MODE_VERTEX;
        }
      }
    };

    ////////////////////////////////////////////////////////////////////////////
    // Raster drawing functions
    ////////////////////////////////////////////////////////////////////////////

    /**
    * Saves an image from the display window. Images are saved in TIFF, TARGA, JPEG, and PNG format
    * depending on the extension within the filename  parameter. For example, "image.tif" will have
    * a TIFF image and "image.png" will save a PNG image. If no extension is included in the filename,
    * the image will save in TIFF format and .tif will be added to the name. These files are saved to
    * the sketch's folder, which may be opened by selecting "Show sketch folder" from the "Sketch" menu.
    * It is not possible to use save() while running the program in a web browser.  All images saved
    * from the main drawing window will be opaque. To save images without a background, use createGraphics().
    *
    * @param {String} filename      any sequence of letters and numbers
    *
    * @see saveFrame
    * @see createGraphics
    */
    p.save = function(file, img) {
      // file is unused at the moment
      // may implement this differently in later release
      if (img !== undef) {
        return window.open(img.toDataURL(),"_blank");
      }
      return window.open(p.externals.canvas.toDataURL(),"_blank");
    };

    var saveNumber = 0;

    p.saveFrame = function(file) {
      if(file === undef) {
        // use default name template if parameter is not specified
        file = "screen-####.png";
      }
      // Increment changeable part: screen-0000.png, screen-0001.png, ...
      var frameFilename = file.replace(/#+/, function(all) {
        var s = "" + (saveNumber++);
        while(s.length < all.length) {
          s = "0" + s;
        }
        return s;
      });
      p.save(frameFilename);
    };

    var utilityContext2d = document.createElement("canvas").getContext("2d");

    var canvasDataCache = [undef, undef, undef]; // we need three for now

    function getCanvasData(obj, w, h) {
      var canvasData = canvasDataCache.shift();

      if (canvasData === undef) {
        canvasData = {};
        canvasData.canvas = document.createElement("canvas");
        canvasData.context = canvasData.canvas.getContext('2d');
      }

      canvasDataCache.push(canvasData);

      var canvas = canvasData.canvas, context = canvasData.context,
          width = w || obj.width, height = h || obj.height;

      canvas.width = width;
      canvas.height = height;

      if (!obj) {
        context.clearRect(0, 0, width, height);
      } else if ("data" in obj) { // ImageData
        context.putImageData(obj, 0, 0);
      } else {
        context.clearRect(0, 0, width, height);
        context.drawImage(obj, 0, 0, width, height);
      }
      return canvasData;
    }

    /**
     * Handle the sketch code for pixels[] and pixels.length
     * parser code converts pixels[] to getPixels()
     * or setPixels(), .length becomes getLength()
     */
    function buildPixelsObject(pImage) {
      return {

        getLength: (function(aImg) {
          return function() {
            if (aImg.isRemote) {
              throw "Image is loaded remotely. Cannot get length.";
            } else {
              return aImg.imageData.data.length ? aImg.imageData.data.length/4 : 0;
            }
          };
        }(pImage)),

        getPixel: (function(aImg) {
          return function(i) {
            var offset = i*4,
              data = aImg.imageData.data;

            if (aImg.isRemote) {
              throw "Image is loaded remotely. Cannot get pixels.";
            }

            return (data[offset+3] << 24) & PConstants.ALPHA_MASK |
                   (data[offset] << 16) & PConstants.RED_MASK |
                   (data[offset+1] << 8) & PConstants.GREEN_MASK |
                   data[offset+2] & PConstants.BLUE_MASK;
          };
        }(pImage)),

        setPixel: (function(aImg) {
          return function(i, c) {
            var offset = i*4,
              data = aImg.imageData.data;

            if (aImg.isRemote) {
              throw "Image is loaded remotely. Cannot set pixel.";
            }

            data[offset+0] = (c & PConstants.RED_MASK) >>> 16;
            data[offset+1] = (c & PConstants.GREEN_MASK) >>> 8;
            data[offset+2] = (c & PConstants.BLUE_MASK);
            data[offset+3] = (c & PConstants.ALPHA_MASK) >>> 24;
            aImg.__isDirty = true;
          };
        }(pImage)),

        toArray: (function(aImg) {
          return function() {
            var arr = [],
              data = aImg.imageData.data,
              length = aImg.width * aImg.height;

            if (aImg.isRemote) {
              throw "Image is loaded remotely. Cannot get pixels.";
            }

            for (var i = 0, offset = 0; i < length; i++, offset += 4) {
              arr.push( (data[offset+3] << 24) & PConstants.ALPHA_MASK |
                        (data[offset] << 16) & PConstants.RED_MASK |
                        (data[offset+1] << 8) & PConstants.GREEN_MASK |
                        data[offset+2] & PConstants.BLUE_MASK );
            }
            return arr;
          };
        }(pImage)),

        set: (function(aImg) {
          return function(arr) {
            var offset,
              data,
              c;
            if (this.isRemote) {
              throw "Image is loaded remotely. Cannot set pixels.";
            }

            data = aImg.imageData.data;
            for (var i = 0, aL = arr.length; i < aL; i++) {
              c = arr[i];
              offset = i*4;

              data[offset+0] = (c & PConstants.RED_MASK) >>> 16;
              data[offset+1] = (c & PConstants.GREEN_MASK) >>> 8;
              data[offset+2] = (c & PConstants.BLUE_MASK);
              data[offset+3] = (c & PConstants.ALPHA_MASK) >>> 24;
            }
            aImg.__isDirty = true;
          };
        }(pImage))

      };
    }

    /**
    * Datatype for storing images. Processing can display .gif, .jpg, .tga, and .png images. Images may be
    * displayed in 2D and 3D space. Before an image is used, it must be loaded with the loadImage() function.
    * The PImage object contains fields for the width and height of the image, as well as an array called
    * pixels[]  which contains the values for every pixel in the image. A group of methods, described below,
    * allow easy access to the image's pixels and alpha channel and simplify the process of compositing.
    * Before using the pixels[] array, be sure to use the loadPixels() method on the image to make sure that the
    * pixel data is properly loaded. To create a new image, use the createImage() function (do not use new PImage()).
    *
    * @param {int} width                image width
    * @param {int} height               image height
    * @param {MODE} format              Either RGB, ARGB, ALPHA (grayscale alpha channel)
    *
    * @returns {PImage}
    *
    * @see loadImage
    * @see imageMode
    * @see createImage
    */
    var PImage = function(aWidth, aHeight, aFormat) {

      // Keep track of whether or not the cached imageData has been touched.
      this.__isDirty = false;

      if (aWidth instanceof HTMLImageElement) {
        // convert an <img> to a PImage
        this.fromHTMLImageData(aWidth);
      } else if (aHeight || aFormat) {
        this.width = aWidth || 1;
        this.height = aHeight || 1;

        // Stuff a canvas into sourceImg so image() calls can use drawImage like an <img>
        var canvas = this.sourceImg = document.createElement("canvas");
        canvas.width = this.width;
        canvas.height = this.height;

        var imageData = this.imageData = canvas.getContext('2d').createImageData(this.width, this.height);
        this.format = (aFormat === PConstants.ARGB || aFormat === PConstants.ALPHA) ? aFormat : PConstants.RGB;
        if (this.format === PConstants.RGB) {
          // Set the alpha channel of an RGB image to opaque.
          for (var i = 3, data = this.imageData.data, len = data.length; i < len; i += 4) {
            data[i] = 255;
          }
        }

        this.__isDirty = true;
        this.updatePixels();
      } else {
        this.width = 0;
        this.height = 0;
        this.imageData = utilityContext2d.createImageData(1, 1);
        this.format = PConstants.ARGB;
      }

      this.pixels = buildPixelsObject(this);
    };
    PImage.prototype = {

      /**
       * Temporary hack to deal with cross-Processing-instance created PImage.  See
       * tickets #1623 and #1644.
       */
      __isPImage: true,

      /**
      * @member PImage
      * Updates the image with the data in its pixels[] array. Use in conjunction with loadPixels(). If
      * you're only reading pixels from the array, there's no need to call updatePixels().
      * Certain renderers may or may not seem to require loadPixels() or updatePixels(). However, the rule
      * is that any time you want to manipulate the pixels[] array, you must first call loadPixels(), and
      * after changes have been made, call updatePixels(). Even if the renderer may not seem to use this
      * function in the current Processing release, this will always be subject to change.
      * Currently, none of the renderers use the additional parameters to updatePixels().
      */
      updatePixels: function() {
        var canvas = this.sourceImg;
        if (canvas && canvas instanceof HTMLCanvasElement && this.__isDirty) {
          canvas.getContext('2d').putImageData(this.imageData, 0, 0);
        }
        this.__isDirty = false;
      },

      fromHTMLImageData: function(htmlImg) {
        // convert an <img> to a PImage
        var canvasData = getCanvasData(htmlImg);
        try {
          var imageData = canvasData.context.getImageData(0, 0, htmlImg.width, htmlImg.height);
          this.fromImageData(imageData);
        } catch(e) {
          if (htmlImg.width && htmlImg.height) {
            this.isRemote = true;
            this.width = htmlImg.width;
            this.height = htmlImg.height;
          }
        }
        this.sourceImg = htmlImg;
      },

      'get': function(x, y, w, h) {
        if (!arguments.length) {
          return p.get(this);
        }
        if (arguments.length === 2) {
          return p.get(x, y, this);
        }
        if (arguments.length === 4) {
          return p.get(x, y, w, h, this);
        }
      },

      /**
      * @member PImage
      * Changes the color of any pixel or writes an image directly into the image. The x and y parameter
      * specify the pixel or the upper-left corner of the image. The color parameter specifies the color value.
      * Setting the color of a single pixel with set(x, y) is easy, but not as fast as putting the data
      * directly into pixels[]. The equivalent statement to "set(x, y, #000000)" using pixels[] is
      * "pixels[y*width+x] = #000000". Processing requires calling loadPixels() to load the display window
      * data into the pixels[] array before getting the values and calling updatePixels() to update the window.
      *
      * @param {int} x        x-coordinate of the pixel or upper-left corner of the image
      * @param {int} y        y-coordinate of the pixel or upper-left corner of the image
      * @param {color} color  any value of the color datatype
      *
      * @see get
      * @see pixels[]
      * @see copy
      */
      'set': function(x, y, c) {
        p.set(x, y, c, this);
        this.__isDirty = true;
      },

      /**
      * @member PImage
      * Blends a region of pixels into the image specified by the img parameter. These copies utilize full
      * alpha channel support and a choice of the following modes to blend the colors of source pixels (A)
      * with the ones of pixels in the destination image (B):
      * BLEND - linear interpolation of colours: C = A*factor + B
      * ADD - additive blending with white clip: C = min(A*factor + B, 255)
      * SUBTRACT - subtractive blending with black clip: C = max(B - A*factor, 0)
      * DARKEST - only the darkest colour succeeds: C = min(A*factor, B)
      * LIGHTEST - only the lightest colour succeeds: C = max(A*factor, B)
      * DIFFERENCE - subtract colors from underlying image.
      * EXCLUSION - similar to DIFFERENCE, but less extreme.
      * MULTIPLY - Multiply the colors, result will always be darker.
      * SCREEN - Opposite multiply, uses inverse values of the colors.
      * OVERLAY - A mix of MULTIPLY and SCREEN. Multiplies dark values, and screens light values.
      * HARD_LIGHT - SCREEN when greater than 50% gray, MULTIPLY when lower.
      * SOFT_LIGHT - Mix of DARKEST and LIGHTEST. Works like OVERLAY, but not as harsh.
      * DODGE - Lightens light tones and increases contrast, ignores darks. Called "Color Dodge" in Illustrator and Photoshop.
      * BURN - Darker areas are applied, increasing contrast, ignores lights. Called "Color Burn" in Illustrator and Photoshop.
      * All modes use the alpha information (highest byte) of source image pixels as the blending factor.
      * If the source and destination regions are different sizes, the image will be automatically resized to
      * match the destination size. If the srcImg parameter is not used, the display window is used as the source image.
      * This function ignores imageMode().
      *
      * @param {int} x              X coordinate of the source's upper left corner
      * @param {int} y              Y coordinate of the source's upper left corner
      * @param {int} width          source image width
      * @param {int} height         source image height
      * @param {int} dx             X coordinate of the destinations's upper left corner
      * @param {int} dy             Y coordinate of the destinations's upper left corner
      * @param {int} dwidth         destination image width
      * @param {int} dheight        destination image height
      * @param {PImage} srcImg      an image variable referring to the source image
      * @param {MODE} MODE          Either BLEND, ADD, SUBTRACT, LIGHTEST, DARKEST, DIFFERENCE, EXCLUSION,
      * MULTIPLY, SCREEN, OVERLAY, HARD_LIGHT, SOFT_LIGHT, DODGE, BURN
      *
      * @see alpha
      * @see copy
      */
      blend: function(srcImg, x, y, width, height, dx, dy, dwidth, dheight, MODE) {
        if (arguments.length === 9) {
          p.blend(this, srcImg, x, y, width, height, dx, dy, dwidth, dheight, this);
        } else if (arguments.length === 10) {
          p.blend(srcImg, x, y, width, height, dx, dy, dwidth, dheight, MODE, this);
        }
        delete this.sourceImg;
      },

      /**
      * @member PImage
      * Copies a region of pixels from one image into another. If the source and destination regions
      * aren't the same size, it will automatically resize source pixels to fit the specified target region.
      * No alpha information is used in the process, however if the source image has an alpha channel set,
      * it will be copied as well. This function ignores imageMode().
      *
      * @param {int} sx             X coordinate of the source's upper left corner
      * @param {int} sy             Y coordinate of the source's upper left corner
      * @param {int} swidth         source image width
      * @param {int} sheight        source image height
      * @param {int} dx             X coordinate of the destinations's upper left corner
      * @param {int} dy             Y coordinate of the destinations's upper left corner
      * @param {int} dwidth         destination image width
      * @param {int} dheight        destination image height
      * @param {PImage} srcImg      an image variable referring to the source image
      *
      * @see alpha
      * @see blend
      */
      copy: function(srcImg, sx, sy, swidth, sheight, dx, dy, dwidth, dheight) {
        if (arguments.length === 8) {
          p.blend(this, srcImg, sx, sy, swidth, sheight, dx, dy, dwidth, PConstants.REPLACE, this);
        } else if (arguments.length === 9) {
          p.blend(srcImg, sx, sy, swidth, sheight, dx, dy, dwidth, dheight, PConstants.REPLACE, this);
        }
        delete this.sourceImg;
      },

      /**
      * @member PImage
      * Filters an image as defined by one of the following modes:
      * THRESHOLD - converts the image to black and white pixels depending if they are above or below
      * the threshold defined by the level parameter. The level must be between 0.0 (black) and 1.0(white).
      * If no level is specified, 0.5 is used.
      * GRAY - converts any colors in the image to grayscale equivalents
      * INVERT - sets each pixel to its inverse value
      * POSTERIZE - limits each channel of the image to the number of colors specified as the level parameter
      * BLUR - executes a Guassian blur with the level parameter specifying the extent of the blurring.
      * If no level parameter is used, the blur is equivalent to Guassian blur of radius 1.
      * OPAQUE - sets the alpha channel to entirely opaque.
      * ERODE - reduces the light areas with the amount defined by the level parameter.
      * DILATE - increases the light areas with the amount defined by the level parameter
      *
      * @param {MODE} MODE        Either THRESHOLD, GRAY, INVERT, POSTERIZE, BLUR, OPAQUE, ERODE, or DILATE
      * @param {int|float} param  in the range from 0 to 1
      */
      filter: function(mode, param) {
        if (arguments.length === 2) {
          p.filter(mode, param, this);
        } else if (arguments.length === 1) {
          // no param specified, send null to show its invalid
          p.filter(mode, null, this);
        }
        delete this.sourceImg;
      },

      /**
      * @member PImage
      * Saves the image into a file. Images are saved in TIFF, TARGA, JPEG, and PNG format depending on
      * the extension within the filename  parameter. For example, "image.tif" will have a TIFF image and
      * "image.png" will save a PNG image. If no extension is included in the filename, the image will save
      * in TIFF format and .tif will be added to the name. These files are saved to the sketch's folder,
      * which may be opened by selecting "Show sketch folder" from the "Sketch" menu. It is not possible to
      * use save() while running the program in a web browser.
      * To save an image created within the code, rather than through loading, it's necessary to make the
      * image with the createImage() function so it is aware of the location of the program and can therefore
      * save the file to the right place. See the createImage() reference for more information.
      *
      * @param {String} filename        a sequence of letters and numbers
      */
      save: function(file){
        p.save(file,this);
      },

      /**
      * @member PImage
      * Resize the image to a new width and height. To make the image scale proportionally, use 0 as the
      * value for the wide or high parameter.
      *
      * @param {int} wide         the resized image width
      * @param {int} high         the resized image height
      *
      * @see get
      */
      resize: function(w, h) {
        if (this.isRemote) { // Remote images cannot access imageData
          throw "Image is loaded remotely. Cannot resize.";
        }
        if (this.width !== 0 || this.height !== 0) {
          // make aspect ratio if w or h is 0
          if (w === 0 && h !== 0) {
            w = Math.floor(this.width / this.height * h);
          } else if (h === 0 && w !== 0) {
            h = Math.floor(this.height / this.width * w);
          }
          // put 'this.imageData' into a new canvas
          var canvas = getCanvasData(this.imageData).canvas;
          // pull imageData object out of canvas into ImageData object
          var imageData = getCanvasData(canvas, w, h).context.getImageData(0, 0, w, h);
          // set this as new pimage
          this.fromImageData(imageData);
        }
      },

      /**
      * @member PImage
      * Masks part of an image from displaying by loading another image and using it as an alpha channel.
      * This mask image should only contain grayscale data, but only the blue color channel is used. The
      * mask image needs to be the same size as the image to which it is applied.
      * In addition to using a mask image, an integer array containing the alpha channel data can be
      * specified directly. This method is useful for creating dynamically generated alpha masks. This
      * array must be of the same length as the target image's pixels array and should contain only grayscale
      * data of values between 0-255.
      *
      * @param {PImage} maskImg         any PImage object used as the alpha channel for "img", needs to be same
      *                                 size as "img"
      * @param {int[]} maskArray        any array of Integer numbers used as the alpha channel, needs to be same
      *                                 length as the image's pixel array
      */
      mask: function(mask) {
        var obj = this.toImageData(),
            i,
            size;

        if (mask instanceof PImage || mask.__isPImage) {
          if (mask.width === this.width && mask.height === this.height) {
            mask = mask.toImageData();

            for (i = 2, size = this.width * this.height * 4; i < size; i += 4) {
              // using it as an alpha channel
              obj.data[i + 1] = mask.data[i];
              // but only the blue color channel
            }
          } else {
            throw "mask must have the same dimensions as PImage.";
          }
        } else if (mask instanceof Array) {
          if (this.width * this.height === mask.length) {
            for (i = 0, size = mask.length; i < size; ++i) {
              obj.data[i * 4 + 3] = mask[i];
            }
          } else {
            throw "mask array must be the same length as PImage pixels array.";
          }
        }

        this.fromImageData(obj);
      },

      // These are intentionally left blank for PImages, we work live with pixels and draw as necessary
      /**
      * @member PImage
      * Loads the pixel data for the image into its pixels[] array. This function must always be called
      * before reading from or writing to pixels[].
      * Certain renderers may or may not seem to require loadPixels() or updatePixels(). However, the
      * rule is that any time you want to manipulate the pixels[] array, you must first call loadPixels(),
      * and after changes have been made, call updatePixels(). Even if the renderer may not seem to use
      * this function in the current Processing release, this will always be subject to change.
      */
      loadPixels: noop,

      toImageData: function() {
        if (this.isRemote) {
          return this.sourceImg;
        }

        if (!this.__isDirty) {
          return this.imageData;
        }

        var canvasData = getCanvasData(this.sourceImg);
        return canvasData.context.getImageData(0, 0, this.width, this.height);
      },

      toDataURL: function() {
        if (this.isRemote) { // Remote images cannot access imageData
          throw "Image is loaded remotely. Cannot create dataURI.";
        }
        var canvasData = getCanvasData(this.imageData);
        return canvasData.canvas.toDataURL();
      },

      fromImageData: function(canvasImg) {
        var w = canvasImg.width,
          h = canvasImg.height,
          canvas = document.createElement('canvas'),
          ctx = canvas.getContext('2d');

        this.width = canvas.width = w;
        this.height = canvas.height = h;

        ctx.putImageData(canvasImg, 0, 0);

        // changed for 0.9
        this.format = PConstants.ARGB;

        this.imageData = canvasImg;
        this.sourceImg = canvas;
      }
    };

    p.PImage = PImage;

    /**
    * Creates a new PImage (the datatype for storing images). This provides a fresh buffer of pixels to play
    * with. Set the size of the buffer with the width and height parameters. The format parameter defines how
    * the pixels are stored. See the PImage reference for more information.
    * Be sure to include all three parameters, specifying only the width and height (but no format) will
    * produce a strange error.
    * Advanced users please note that createImage() should be used instead of the syntax new PImage().
    *
    * @param {int} width                image width
    * @param {int} height               image height
    * @param {MODE} format              Either RGB, ARGB, ALPHA (grayscale alpha channel)
    *
    * @returns {PImage}
    *
    * @see PImage
    * @see PGraphics
    */
    p.createImage = function(w, h, mode) {
      return new PImage(w,h,mode);
    };

    // Loads an image for display. Type is an extension. Callback is fired on load.
    /**
    * Loads an image into a variable of type PImage. Four types of images ( .gif, .jpg, .tga, .png) images may
    * be loaded. To load correctly, images must be located in the data directory of the current sketch. In most
    * cases, load all images in setup() to preload them at the start of the program. Loading images inside draw()
    * will reduce the speed of a program.
    * The filename parameter can also be a URL to a file found online. For security reasons, a Processing sketch
    * found online can only download files from the same server from which it came. Getting around this restriction
    * requires a signed applet.
    * The extension parameter is used to determine the image type in cases where the image filename does not end
    * with a proper extension. Specify the extension as the second parameter to loadImage(), as shown in the
    * third example on this page.
    * If an image is not loaded successfully, the null value is returned and an error message will be printed to
    * the console. The error message does not halt the program, however the null value may cause a NullPointerException
    * if your code does not check whether the value returned from loadImage() is null.
    * Depending on the type of error, a PImage object may still be returned, but the width and height of the image
    * will be set to -1. This happens if bad image data is returned or cannot be decoded properly. Sometimes this happens
    * with image URLs that produce a 403 error or that redirect to a password prompt, because loadImage() will attempt
    * to interpret the HTML as image data.
    *
    * @param {String} filename        name of file to load, can be .gif, .jpg, .tga, or a handful of other image
    *                                 types depending on your platform.
    * @param {String} extension       the type of image to load, for example "png", "gif", "jpg"
    *
    * @returns {PImage}
    *
    * @see PImage
    * @see image
    * @see imageMode
    * @see background
    */
    p.loadImage = function(file, type, callback) {
      // if type is specified, we just ignore it

      var pimg;
      // if image is in the preloader cache return a new PImage
      if (curSketch.imageCache.images[file]) {
        pimg = new PImage(curSketch.imageCache.images[file]);
        pimg.loaded = true;
        return pimg;
      }
      // else async load it
      pimg = new PImage();
      var img = document.createElement('img');

      pimg.sourceImg = img;

      img.onload = (function(aImage, aPImage, aCallback) {
        var image = aImage;
        var pimg = aPImage;
        var callback = aCallback;
        return function() {
          // change the <img> object into a PImage now that its loaded
          pimg.fromHTMLImageData(image);
          pimg.loaded = true;
          if (callback) {
            callback();
          }
        };
      }(img, pimg, callback));

      img.src = file; // needs to be called after the img.onload function is declared or it wont work in opera
      return pimg;
    };

    // async loading of large images, same functionality as loadImage above
    /**
    * This function load images on a separate thread so that your sketch does not freeze while images load during
    * setup(). While the image is loading, its width and height will be 0. If an error occurs while loading the image,
    * its width and height will be set to -1. You'll know when the image has loaded properly because its width and
    * height will be greater than 0. Asynchronous image loading (particularly when downloading from a server) can
    * dramatically improve performance.
    * The extension parameter is used to determine the image type in cases where the image filename does not end
    * with a proper extension. Specify the extension as the second parameter to requestImage().
    *
    * @param {String} filename        name of file to load, can be .gif, .jpg, .tga, or a handful of other image
    *                                 types depending on your platform.
    * @param {String} extension       the type of image to load, for example "png", "gif", "jpg"
    *
    * @returns {PImage}
    *
    * @see PImage
    * @see loadImage
    */
    p.requestImage = p.loadImage;

    function get$2(x,y) {
      var data;
      // return the color at x,y (int) of curContext
      if (x >= p.width || x < 0 || y < 0 || y >= p.height) {
        // x,y is outside image return transparent black
        return 0;
      }

      // loadPixels() has been called
      if (isContextReplaced) {
        var offset = ((0|x) + p.width * (0|y)) * 4;
        data = p.imageData.data;
        return (data[offset + 3] << 24) & PConstants.ALPHA_MASK |
               (data[offset] << 16) & PConstants.RED_MASK |
               (data[offset + 1] << 8) & PConstants.GREEN_MASK |
               data[offset + 2] & PConstants.BLUE_MASK;
      }

      // x,y is inside canvas space
      data = p.toImageData(0|x, 0|y, 1, 1).data;
      return (data[3] << 24) & PConstants.ALPHA_MASK |
             (data[0] << 16) & PConstants.RED_MASK |
             (data[1] << 8) & PConstants.GREEN_MASK |
             data[2] & PConstants.BLUE_MASK;
    }
    function get$3(x,y,img) {
      if (img.isRemote) { // Remote images cannot access imageData
        throw "Image is loaded remotely. Cannot get x,y.";
      }
      // PImage.get(x,y) was called, return the color (int) at x,y of img
      var offset = y * img.width * 4 + (x * 4),
          data = img.imageData.data;
      return (data[offset + 3] << 24) & PConstants.ALPHA_MASK |
             (data[offset] << 16) & PConstants.RED_MASK |
             (data[offset + 1] << 8) & PConstants.GREEN_MASK |
             data[offset + 2] & PConstants.BLUE_MASK;
    }
    function get$4(x, y, w, h) {
      // return a PImage of w and h from cood x,y of curContext
      var c = new PImage(w, h, PConstants.ARGB);
      c.fromImageData(p.toImageData(x, y, w, h));
      return c;
    }
    function get$5(x, y, w, h, img) {
      if (img.isRemote) { // Remote images cannot access imageData
        throw "Image is loaded remotely. Cannot get x,y,w,h.";
      }
      // PImage.get(x,y,w,h) was called, return x,y,w,h PImage of img
      // offset start point needs to be *4
      var c = new PImage(w, h, PConstants.ARGB), cData = c.imageData.data,
        imgWidth = img.width, imgHeight = img.height, imgData = img.imageData.data;
      // Don't need to copy pixels from the image outside ranges.
      var startRow = Math.max(0, -y), startColumn = Math.max(0, -x),
        stopRow = Math.min(h, imgHeight - y), stopColumn = Math.min(w, imgWidth - x);
      for (var i = startRow; i < stopRow; ++i) {
        var sourceOffset = ((y + i) * imgWidth + (x + startColumn)) * 4;
        var targetOffset = (i * w + startColumn) * 4;
        for (var j = startColumn; j < stopColumn; ++j) {
          cData[targetOffset++] = imgData[sourceOffset++];
          cData[targetOffset++] = imgData[sourceOffset++];
          cData[targetOffset++] = imgData[sourceOffset++];
          cData[targetOffset++] = imgData[sourceOffset++];
        }
      }
      c.__isDirty = true;
      return c;
    }

    // Gets a single pixel or block of pixels from the current Canvas Context or a PImage
    /**
    * Reads the color of any pixel or grabs a section of an image. If no parameters are specified, the entire
    * image is returned. Get the value of one pixel by specifying an x,y coordinate. Get a section of the display
    * window by specifying an additional width and height parameter. If the pixel requested is outside of the image
    * window, black is returned. The numbers returned are scaled according to the current color ranges, but only RGB
    * values are returned by this function. For example, even though you may have drawn a shape with colorMode(HSB),
    * the numbers returned will be in RGB.
    * Getting the color of a single pixel with get(x, y) is easy, but not as fast as grabbing the data directly
    * from pixels[]. The equivalent statement to "get(x, y)" using pixels[] is "pixels[y*width+x]". Processing
    * requires calling loadPixels() to load the display window data into the pixels[] array before getting the values.
    * This function ignores imageMode().
    *
    * @param {int} x            x-coordinate of the pixel
    * @param {int} y            y-coordinate of the pixel
    * @param {int} width        width of pixel rectangle to get
    * @param {int} height       height of pixel rectangle to get
    *
    * @returns {Color|PImage}
    *
    * @see set
    * @see pixels[]
    * @see imageMode
    */
    p.get = function(x, y, w, h, img) {
      // for 0 2 and 4 arguments use curContext, otherwise PImage.get was called
      if (img !== undefined) {
        return get$5(x, y, w, h, img);
      }
      if (h !== undefined) {
        return get$4(x, y, w, h);
      }
      if (w !== undefined) {
        return get$3(x, y, w);
      }
      if (y !== undefined) {
        return get$2(x, y);
      }
      if (x !== undefined) {
        // PImage.get() was called, return a new PImage
        return get$5(0, 0, x.width, x.height, x);
      }

      return get$4(0, 0, p.width, p.height);
    };

    /**
     * Creates and returns a new <b>PGraphics</b> object of the types P2D, P3D, and JAVA2D. Use this class if you need to draw
     * into an off-screen graphics buffer. It's not possible to use <b>createGraphics()</b> with OPENGL, because it doesn't
     * allow offscreen use. The DXF and PDF renderers require the filename parameter. <br /><br /> It's important to call
     * any drawing commands between beginDraw() and endDraw() statements. This is also true for any commands that affect
     * drawing, such as smooth() or colorMode().<br /><br /> Unlike the main drawing surface which is completely opaque,
     * surfaces created with createGraphics() can have transparency. This makes it possible to draw into a graphics and
     * maintain the alpha channel.
     *
     * @param {int} width       width in pixels
     * @param {int} height      height in pixels
     * @param {int} renderer    Either P2D, P3D, JAVA2D, PDF, DXF
     * @param {String} filename the name of the file (not supported yet)
     */
    p.createGraphics = function(w, h, render) {
      var pg = new Processing();
      pg.size(w, h, render);
      pg.background(0,0);
      return pg;
    };

    // pixels caching
    function resetContext() {
      if(isContextReplaced) {
        curContext = originalContext;
        isContextReplaced = false;

        p.updatePixels();
      }
    }
    function SetPixelContextWrapper() {
      function wrapFunction(newContext, name) {
        function wrapper() {
          resetContext();
          curContext[name].apply(curContext, arguments);
        }
        newContext[name] = wrapper;
      }
      function wrapProperty(newContext, name) {
        function getter() {
          resetContext();
          return curContext[name];
        }
        function setter(value) {
          resetContext();
          curContext[name] = value;
        }
        p.defineProperty(newContext, name, { get: getter, set: setter });
      }
      for(var n in curContext) {
        if(typeof curContext[n] === 'function') {
          wrapFunction(this, n);
        } else {
          wrapProperty(this, n);
        }
      }
    }
    function replaceContext() {
      if(isContextReplaced) {
        return;
      }
      p.loadPixels();
      if(proxyContext === null) {
        originalContext = curContext;
        proxyContext = new SetPixelContextWrapper();
      }
      isContextReplaced = true;
      curContext = proxyContext;
      setPixelsCached = 0;
    }

    function set$3(x, y, c) {
      if (x < p.width && x >= 0 && y >= 0 && y < p.height) {
        replaceContext();
        p.pixels.setPixel((0|x)+p.width*(0|y), c);
        if(++setPixelsCached > maxPixelsCached) {
          resetContext();
        }
      }
    }
    function set$4(x, y, obj, img) {
      if (img.isRemote) { // Remote images cannot access imageData
        throw "Image is loaded remotely. Cannot set x,y.";
      }
      var c = p.color.toArray(obj);
      var offset = y * img.width * 4 + (x*4);
      var data = img.imageData.data;
      data[offset] = c[0];
      data[offset+1] = c[1];
      data[offset+2] = c[2];
      data[offset+3] = c[3];
    }

    // Paints a pixel array into the canvas
    /**
    * Changes the color of any pixel or writes an image directly into the display window. The x and y parameters
    * specify the pixel to change and the color  parameter specifies the color value. The color parameter is affected
    * by the current color mode (the default is RGB values from 0 to 255). When setting an image, the x and y
    * parameters define the coordinates for the upper-left corner of the image.
    * Setting the color of a single pixel with set(x, y) is easy, but not as fast as putting the data directly
    * into pixels[]. The equivalent statement to "set(x, y, #000000)" using pixels[] is "pixels[y*width+x] = #000000".
    * You must call loadPixels() to load the display window data into the pixels[] array before setting the values
    * and calling updatePixels() to update the window with any changes. This function ignores imageMode().
    *
    * @param {int} x            x-coordinate of the pixel
    * @param {int} y            y-coordinate of the pixel
    * @param {Color} obj        any value of the color datatype
    * @param {PImage} img       any valid variable of type PImage
    *
    * @see get
    * @see pixels[]
    * @see imageMode
    */
    p.set = function(x, y, obj, img) {
      var color, oldFill;
      if (arguments.length === 3) {
        // called p.set(), was it with a color or a img ?
        if (typeof obj === "number") {
          set$3(x, y, obj);
        } else if (obj instanceof PImage || obj.__isPImage) {
          p.image(obj, x, y);
        }
      } else if (arguments.length === 4) {
        // PImage.set(x,y,c) was called, set coordinate x,y color to c of img
        set$4(x, y, obj, img);
      }
    };
    p.imageData = {};

    // handle the sketch code for pixels[]
    // parser code converts pixels[] to getPixels() or setPixels(),
    // .length becomes getLength()
    /**
    * Array containing the values for all the pixels in the display window. These values are of the color datatype.
    * This array is the size of the display window. For example, if the image is 100x100 pixels, there will be 10000
    * values and if the window is 200x300 pixels, there will be 60000 values. The index value defines the position
    * of a value within the array. For example, the statment color b = pixels[230] will set the variable b to be
    * equal to the value at that location in the array.
    * Before accessing this array, the data must loaded with the loadPixels() function. After the array data has
    * been modified, the updatePixels() function must be run to update the changes.
    *
    * @param {int} index      must not exceed the size of the array
    *
    * @see loadPixels
    * @see updatePixels
    * @see get
    * @see set
    * @see PImage
    */
    p.pixels = {
      getLength: function() { return p.imageData.data.length ? p.imageData.data.length/4 : 0; },
      getPixel: function(i) {
        var offset = i*4, data = p.imageData.data;
        return (data[offset+3] << 24) & 0xff000000 |
               (data[offset+0] << 16) & 0x00ff0000 |
               (data[offset+1] << 8) & 0x0000ff00 |
               data[offset+2] & 0x000000ff;
      },
      setPixel: function(i,c) {
        var offset = i*4, data = p.imageData.data;
        data[offset+0] = (c & 0x00ff0000) >>> 16; // RED_MASK
        data[offset+1] = (c & 0x0000ff00) >>> 8;  // GREEN_MASK
        data[offset+2] = (c & 0x000000ff);        // BLUE_MASK
        data[offset+3] = (c & 0xff000000) >>> 24; // ALPHA_MASK
      },
      toArray: function() {
        var arr = [], length = p.imageData.width * p.imageData.height, data = p.imageData.data;
        for (var i = 0, offset = 0; i < length; i++, offset += 4) {
          arr.push((data[offset+3] << 24) & 0xff000000 |
                   (data[offset+0] << 16) & 0x00ff0000 |
                   (data[offset+1] << 8) & 0x0000ff00 |
                   data[offset+2] & 0x000000ff);
        }
        return arr;
      },
      set: function(arr) {
        for (var i = 0, aL = arr.length; i < aL; i++) {
          this.setPixel(i, arr[i]);
        }
      }
    };

    // Gets a 1-Dimensional pixel array from Canvas
    /**
    * Loads the pixel data for the display window into the pixels[] array. This function must always be called
    * before reading from or writing to pixels[].
    * Certain renderers may or may not seem to require loadPixels() or updatePixels(). However, the rule is that
    * any time you want to manipulate the pixels[] array, you must first call loadPixels(), and after changes
    * have been made, call updatePixels(). Even if the renderer may not seem to use this function in the current
    * Processing release, this will always be subject to change.
    *
    * @see pixels[]
    * @see updatePixels
    */
    p.loadPixels = function() {
      p.imageData = drawing.$ensureContext().getImageData(0, 0, p.width, p.height);
    };

    // Draws a 1-Dimensional pixel array to Canvas
    /**
    * Updates the display window with the data in the pixels[] array. Use in conjunction with loadPixels(). If
    * you're only reading pixels from the array, there's no need to call updatePixels() unless there are changes.
    * Certain renderers may or may not seem to require loadPixels() or updatePixels(). However, the rule is that
    * any time you want to manipulate the pixels[] array, you must first call loadPixels(), and after changes
    * have been made, call updatePixels(). Even if the renderer may not seem to use this function in the current
    * Processing release, this will always be subject to change.
    * Currently, none of the renderers use the additional parameters to updatePixels(), however this may be
    * implemented in the future.
    *
    * @see loadPixels
    * @see pixels[]
    */
    p.updatePixels = function() {
      if (p.imageData) {
        drawing.$ensureContext().putImageData(p.imageData, 0, 0);
      }
    };

    /**
    * Set various hints and hacks for the renderer. This is used to handle obscure rendering features that cannot be
    * implemented in a consistent manner across renderers. Many options will often graduate to standard features
    * instead of hints over time.
    * hint(ENABLE_OPENGL_4X_SMOOTH) - Enable 4x anti-aliasing for OpenGL. This can help force anti-aliasing if
    * it has not been enabled by the user. On some graphics cards, this can also be set by the graphics driver's
    * control panel, however not all cards make this available. This hint must be called immediately after the
    * size() command because it resets the renderer, obliterating any settings and anything drawn (and like size(),
    * re-running the code that came before it again).
    * hint(DISABLE_OPENGL_2X_SMOOTH) - In Processing 1.0, Processing always enables 2x smoothing when the OpenGL
    * renderer is used. This hint disables the default 2x smoothing and returns the smoothing behavior found in
    * earlier releases, where smooth() and noSmooth() could be used to enable and disable smoothing, though the
    * quality was inferior.
    * hint(ENABLE_NATIVE_FONTS) - Use the native version fonts when they are installed, rather than the bitmapped
    * version from a .vlw file. This is useful with the JAVA2D renderer setting, as it will improve font rendering
    * speed. This is not enabled by default, because it can be misleading while testing because the type will look
    * great on your machine (because you have the font installed) but lousy on others' machines if the identical
    * font is unavailable. This option can only be set per-sketch, and must be called before any use of textFont().
    * hint(DISABLE_DEPTH_TEST) - Disable the zbuffer, allowing you to draw on top of everything at will. When depth
    * testing is disabled, items will be drawn to the screen sequentially, like a painting. This hint is most often
    * used to draw in 3D, then draw in 2D on top of it (for instance, to draw GUI controls in 2D on top of a 3D
    * interface). Starting in release 0149, this will also clear the depth buffer. Restore the default with
    * hint(ENABLE_DEPTH_TEST), but note that with the depth buffer cleared, any 3D drawing that happens later in
    * draw() will ignore existing shapes on the screen.
    * hint(ENABLE_DEPTH_SORT) - Enable primitive z-sorting of triangles and lines in P3D and OPENGL. This can slow
    * performance considerably, and the algorithm is not yet perfect. Restore the default with hint(DISABLE_DEPTH_SORT).
    * hint(DISABLE_OPENGL_ERROR_REPORT) - Speeds up the OPENGL renderer setting by not checking for errors while
    * running. Undo with hint(ENABLE_OPENGL_ERROR_REPORT).
    * As of release 0149, unhint() has been removed in favor of adding additional ENABLE/DISABLE constants to reset
    * the default behavior. This prevents the double negatives, and also reinforces which hints can be enabled or disabled.
    *
    * @param {MODE} item          constant: name of the hint to be enabled or disabled
    *
    * @see PGraphics
    * @see createGraphics
    * @see size
    */
    p.hint = function(which) {
      var curContext = drawing.$ensureContext();
      if (which === PConstants.DISABLE_DEPTH_TEST) {
         curContext.disable(curContext.DEPTH_TEST);
         curContext.depthMask(false);
         curContext.clear(curContext.DEPTH_BUFFER_BIT);
      }
      else if (which === PConstants.ENABLE_DEPTH_TEST) {
         curContext.enable(curContext.DEPTH_TEST);
         curContext.depthMask(true);
      }
      else if (which === PConstants.ENABLE_OPENGL_2X_SMOOTH ||
               which === PConstants.ENABLE_OPENGL_4X_SMOOTH){
        renderSmooth = true;
      }
      else if (which === PConstants.DISABLE_OPENGL_2X_SMOOTH){
        renderSmooth = false;
      }
    };

    /**
     * The background() function sets the color used for the background of the Processing window.
     * The default background is light gray. In the <b>draw()</b> function, the background color is used to clear the display window at the beginning of each frame.
     * An image can also be used as the background for a sketch, however its width and height must be the same size as the sketch window.
     * To resize an image 'b' to the size of the sketch window, use b.resize(width, height).
     * Images used as background will ignore the current <b>tint()</b> setting.
     * For the main drawing surface, the alpha value will be ignored. However,
     * alpha can be used on PGraphics objects from <b>createGraphics()</b>. This is
     * the only way to set all the pixels partially transparent, for instance.
     * If the 'gray' parameter is passed in the function sets the background to a grayscale value, based on the
     * current colorMode.
     * <p>
     * Note that background() should be called before any transformations occur,
     * because some implementations may require the current transformation matrix
     * to be identity before drawing.
     *
     * @param {int|float} gray    specifies a value between white and black
     * @param {int|float} value1  red or hue value (depending on the current color mode)
     * @param {int|float} value2  green or saturation value (depending on the current color mode)
     * @param {int|float} value3  blue or brightness value (depending on the current color mode)
     * @param {int|float} alpha   opacity of the background
     * @param {Color} color       any value of the color datatype
     * @param {int} hex           color value in hexadecimal notation (i.e. #FFCC00 or 0xFFFFCC00)
     * @param {PImage} image      an instance of a PImage to use as a background
     *
     * @see #stroke()
     * @see #fill()
     * @see #tint()
     * @see #colorMode()
     */
    var backgroundHelper = function(arg1, arg2, arg3, arg4) {
      var obj;

      if (arg1 instanceof PImage || arg1.__isPImage) {
        obj = arg1;

        if (!obj.loaded) {
          throw "Error using image in background(): PImage not loaded.";
        }
        if(obj.width !== p.width || obj.height !== p.height){
          throw "Background image must be the same dimensions as the canvas.";
        }
      } else {
        obj = p.color(arg1, arg2, arg3, arg4);
      }

      backgroundObj = obj;
    };

    Drawing2D.prototype.background = function(arg1, arg2, arg3, arg4) {
      if (arg1 !== undef) {
        backgroundHelper(arg1, arg2, arg3, arg4);
      }

      if (backgroundObj instanceof PImage || backgroundObj.__isPImage) {
        saveContext();
        curContext.setTransform(1, 0, 0, 1, 0, 0);
        p.image(backgroundObj, 0, 0);
        restoreContext();
      } else {
        saveContext();
        curContext.setTransform(1, 0, 0, 1, 0, 0);

        // If the background is transparent
        if (p.alpha(backgroundObj) !== colorModeA) {
          curContext.clearRect(0,0, p.width, p.height);
        }
        curContext.fillStyle = p.color.toString(backgroundObj);
        curContext.fillRect(0, 0, p.width, p.height);
        isFillDirty = true;
        restoreContext();
      }
    };

    Drawing3D.prototype.background = function(arg1, arg2, arg3, arg4) {
      if (arguments.length > 0) {
        backgroundHelper(arg1, arg2, arg3, arg4);
      }

      var c = p.color.toGLArray(backgroundObj);
      curContext.clearColor(c[0], c[1], c[2], c[3]);
      curContext.clear(curContext.COLOR_BUFFER_BIT | curContext.DEPTH_BUFFER_BIT);

      // An image as a background in 3D is not implemented yet
    };

    // Draws an image to the Canvas
    /**
    * Displays images to the screen. The images must be in the sketch's "data" directory to load correctly. Select "Add
    * file..." from the "Sketch" menu to add the image. Processing currently works with GIF, JPEG, and Targa images. The
    * color of an image may be modified with the tint() function and if a GIF has transparency, it will maintain its
    * transparency. The img parameter specifies the image to display and the x and y parameters define the location of
    * the image from its upper-left corner. The image is displayed at its original size unless the width and height
    * parameters specify a different size. The imageMode() function changes the way the parameters work. A call to
    * imageMode(CORNERS) will change the width and height parameters to define the x and y values of the opposite
    * corner of the image.
    *
    * @param {PImage} img            the image to display
    * @param {int|float} x           x-coordinate of the image
    * @param {int|float} y           y-coordinate of the image
    * @param {int|float} width       width to display the image
    * @param {int|float} height      height to display the image
    *
    * @see loadImage
    * @see PImage
    * @see imageMode
    * @see tint
    * @see background
    * @see alpha
    */
    Drawing2D.prototype.image = function(img, x, y, w, h) {
      // Fix fractional positions
      x = Math.round(x);
      y = Math.round(y);

      if (img.width > 0) {
        var wid = w || img.width;
        var hgt = h || img.height;

        var bounds = imageModeConvert(x || 0, y || 0, w || img.width, h || img.height, arguments.length < 4);
        var fastImage = !!img.sourceImg && curTint === null;
        if (fastImage) {
          var htmlElement = img.sourceImg;
          if (img.__isDirty) {
            img.updatePixels();
          }
          // Using HTML element's width and height in case if the image was resized.
          curContext.drawImage(htmlElement, 0, 0,
            htmlElement.width, htmlElement.height, bounds.x, bounds.y, bounds.w, bounds.h);
        } else {
          var obj = img.toImageData();

          // Tint the image
          if (curTint !== null) {
            curTint(obj);
            img.__isDirty = true;
          }

          curContext.drawImage(getCanvasData(obj).canvas, 0, 0,
            img.width, img.height, bounds.x, bounds.y, bounds.w, bounds.h);
        }
      }
    };

    Drawing3D.prototype.image = function(img, x, y, w, h) {
      if (img.width > 0) {
        // Fix fractional positions
        x = Math.round(x);
        y = Math.round(y);
        w = w || img.width;
        h = h || img.height;

        p.beginShape(p.QUADS);
        p.texture(img);
        p.vertex(x, y, 0, 0, 0);
        p.vertex(x, y+h, 0, 0, h);
        p.vertex(x+w, y+h, 0, w, h);
        p.vertex(x+w, y, 0, w, 0);
        p.endShape();
      }
    };

    /**
     * The tint() function sets the fill value for displaying images. Images can be tinted to
     * specified colors or made transparent by setting the alpha.
     * <br><br>To make an image transparent, but not change it's color,
     * use white as the tint color and specify an alpha value. For instance,
     * tint(255, 128) will make an image 50% transparent (unless
     * <b>colorMode()</b> has been used).
     *
     * <br><br>When using hexadecimal notation to specify a color, use "#" or
     * "0x" before the values (e.g. #CCFFAA, 0xFFCCFFAA). The # syntax uses six
     * digits to specify a color (the way colors are specified in HTML and CSS).
     * When using the hexadecimal notation starting with "0x", the hexadecimal
     * value must be specified with eight characters; the first two characters
     * define the alpha component and the remainder the red, green, and blue
     * components.
     * <br><br>The value for the parameter "gray" must be less than or equal
     * to the current maximum value as specified by <b>colorMode()</b>.
     * The default maximum value is 255.
     * <br><br>The tint() method is also used to control the coloring of
     * textures in 3D.
     *
     * @param {int|float} gray    any valid number
     * @param {int|float} alpha    opacity of the image
     * @param {int|float} value1  red or hue value
     * @param {int|float} value2  green or saturation value
     * @param {int|float} value3  blue or brightness value
     * @param {int|float} color    any value of the color datatype
     * @param {int} hex            color value in hexadecimal notation (i.e. #FFCC00 or 0xFFFFCC00)
     *
     * @see #noTint()
     * @see #image()
     */
    p.tint = function(a1, a2, a3, a4) {
      var tintColor = p.color(a1, a2, a3, a4);
      var r = p.red(tintColor) / colorModeX;
      var g = p.green(tintColor) / colorModeY;
      var b = p.blue(tintColor) / colorModeZ;
      var a = p.alpha(tintColor) / colorModeA;
      curTint = function(obj) {
        var data = obj.data,
            length = 4 * obj.width * obj.height;
        for (var i = 0; i < length;) {
          data[i++] *= r;
          data[i++] *= g;
          data[i++] *= b;
          data[i++] *= a;
        }
      };
      // for overriding the color buffer when 3d rendering
      curTint3d = function(data){
        for (var i = 0; i < data.length;) {
          data[i++] = r;
          data[i++] = g;
          data[i++] = b;
          data[i++] = a;
        }
      };
    };

    /**
     * The noTint() function removes the current fill value for displaying images and reverts to displaying images with their original hues.
     *
     * @see #tint()
     * @see #image()
     */
    p.noTint = function() {
      curTint = null;
      curTint3d = null;
    };

    /**
    * Copies a region of pixels from the display window to another area of the display window and copies a region of pixels from an
    * image used as the srcImg  parameter into the display window. If the source and destination regions aren't the same size, it will
    * automatically resize the source pixels to fit the specified target region. No alpha information is used in the process, however
    * if the source image has an alpha channel set, it will be copied as well. This function ignores imageMode().
    *
    * @param {int} x            X coordinate of the source's upper left corner
    * @param {int} y            Y coordinate of the source's upper left corner
    * @param {int} width        source image width
    * @param {int} height       source image height
    * @param {int} dx           X coordinate of the destination's upper left corner
    * @param {int} dy           Y coordinate of the destination's upper left corner
    * @param {int} dwidth       destination image width
    * @param {int} dheight      destination image height
    * @param {PImage} srcImg    image variable referring to the source image
    *
    * @see blend
    * @see get
    */
    p.copy = function(src, sx, sy, sw, sh, dx, dy, dw, dh) {
      if (dh === undef) {
        // shift everything, and introduce p
        dh = dw;
        dw = dy;
        dy = dx;
        dx = sh;
        sh = sw;
        sw = sy;
        sy = sx;
        sx = src;
        src = p;
      }
      p.blend(src, sx, sy, sw, sh, dx, dy, dw, dh, PConstants.REPLACE);
    };

    /**
    * Blends a region of pixels from one image into another (or in itself again) with full alpha channel support. There
    * is a choice of the following modes to blend the source pixels (A) with the ones of pixels in the destination image (B):
    * BLEND - linear interpolation of colours: C = A*factor + B
    * ADD - additive blending with white clip: C = min(A*factor + B, 255)
    * SUBTRACT - subtractive blending with black clip: C = max(B - A*factor, 0)
    * DARKEST - only the darkest colour succeeds: C = min(A*factor, B)
    * LIGHTEST - only the lightest colour succeeds: C = max(A*factor, B)
    * DIFFERENCE - subtract colors from underlying image.
    * EXCLUSION - similar to DIFFERENCE, but less extreme.
    * MULTIPLY - Multiply the colors, result will always be darker.
    * SCREEN - Opposite multiply, uses inverse values of the colors.
    * OVERLAY - A mix of MULTIPLY and SCREEN. Multiplies dark values, and screens light values.
    * HARD_LIGHT - SCREEN when greater than 50% gray, MULTIPLY when lower.
    * SOFT_LIGHT - Mix of DARKEST and LIGHTEST. Works like OVERLAY, but not as harsh.
    * DODGE - Lightens light tones and increases contrast, ignores darks. Called "Color Dodge" in Illustrator and Photoshop.
    * BURN - Darker areas are applied, increasing contrast, ignores lights. Called "Color Burn" in Illustrator and Photoshop.
    * All modes use the alpha information (highest byte) of source image pixels as the blending factor. If the source and
    * destination regions are different sizes, the image will be automatically resized to match the destination size. If the
    * srcImg parameter is not used, the display window is used as the source image.  This function ignores imageMode().
    *
    * @param {int} x            X coordinate of the source's upper left corner
    * @param {int} y            Y coordinate of the source's upper left corner
    * @param {int} width        source image width
    * @param {int} height       source image height
    * @param {int} dx           X coordinate of the destination's upper left corner
    * @param {int} dy           Y coordinate of the destination's upper left corner
    * @param {int} dwidth       destination image width
    * @param {int} dheight      destination image height
    * @param {PImage} srcImg    image variable referring to the source image
    * @param {PImage} MODE      Either BLEND, ADD, SUBTRACT, LIGHTEST, DARKEST, DIFFERENCE, EXCLUSION, MULTIPLY, SCREEN,
    *                           OVERLAY, HARD_LIGHT, SOFT_LIGHT, DODGE, BURN
    * @see filter
    */
    p.blend = function(src, sx, sy, sw, sh, dx, dy, dw, dh, mode, pimgdest) {
      if (src.isRemote) {
        throw "Image is loaded remotely. Cannot blend image.";
      }

      if (mode === undef) {
        // shift everything, and introduce p
        mode = dh;
        dh = dw;
        dw = dy;
        dy = dx;
        dx = sh;
        sh = sw;
        sw = sy;
        sy = sx;
        sx = src;
        src = p;
      }

      var sx2 = sx + sw,
        sy2 = sy + sh,
        dx2 = dx + dw,
        dy2 = dy + dh,
        dest = pimgdest || p;

      // check if pimgdest is there and pixels, if so this was a call from pimg.blend
      if (pimgdest === undef || mode === undef) {
        p.loadPixels();
      }

      src.loadPixels();

      if (src === p && p.intersect(sx, sy, sx2, sy2, dx, dy, dx2, dy2)) {
        p.blit_resize(p.get(sx, sy, sx2 - sx, sy2 - sy), 0, 0, sx2 - sx - 1, sy2 - sy - 1,
                      dest.imageData.data, dest.width, dest.height, dx, dy, dx2, dy2, mode);
      } else {
        p.blit_resize(src, sx, sy, sx2, sy2, dest.imageData.data, dest.width, dest.height, dx, dy, dx2, dy2, mode);
      }

      if (pimgdest === undef) {
        p.updatePixels();
      }
    };

    // helper function for filter()
    var buildBlurKernel = function(r) {
      var radius = p.floor(r * 3.5), i;
      radius = (radius < 1) ? 1 : ((radius < 248) ? radius : 248);
      if (p.shared.blurRadius !== radius) {
        p.shared.blurRadius = radius;
        p.shared.blurKernelSize = 1 + (p.shared.blurRadius<<1);
        p.shared.blurKernel = new Float32Array(p.shared.blurKernelSize);
        var sharedBlurKernal = p.shared.blurKernel;
        var sharedBlurKernelSize = p.shared.blurKernelSize;
        var sharedBlurRadius = p.shared.blurRadius;
        // init blurKernel
        for (i = 0; i < sharedBlurKernelSize; i++) {
          sharedBlurKernal[i] = 0;
        }
        var radiusiSquared = (radius - 1) * (radius - 1);
        for (i = 1; i < radius; i++) {
          sharedBlurKernal[radius + i] = sharedBlurKernal[radius-i] = radiusiSquared;
        }
        sharedBlurKernal[radius] = radius * radius;
      }
    };

    var blurARGB = function(r, aImg) {
      var sum, cr, cg, cb, ca, c, m;
      var read, ri, ym, ymi, bk0;
      var wh = aImg.pixels.getLength();
      var r2 = new Float32Array(wh);
      var g2 = new Float32Array(wh);
      var b2 = new Float32Array(wh);
      var a2 = new Float32Array(wh);
      var yi = 0;
      var x, y, i, offset;

      buildBlurKernel(r);

      var aImgHeight = aImg.height;
      var aImgWidth = aImg.width;
      var sharedBlurKernelSize = p.shared.blurKernelSize;
      var sharedBlurRadius = p.shared.blurRadius;
      var sharedBlurKernal = p.shared.blurKernel;
      var pix = aImg.imageData.data;

      for (y = 0; y < aImgHeight; y++) {
        for (x = 0; x < aImgWidth; x++) {
          cb = cg = cr = ca = sum = 0;
          read = x - sharedBlurRadius;
          if (read<0) {
            bk0 = -read;
            read = 0;
          } else {
            if (read >= aImgWidth) {
              break;
            }
            bk0=0;
          }
          for (i = bk0; i < sharedBlurKernelSize; i++) {
            if (read >= aImgWidth) {
              break;
            }
            offset = (read + yi) *4;
            m = sharedBlurKernal[i];
            ca += m * pix[offset + 3];
            cr += m * pix[offset];
            cg += m * pix[offset + 1];
            cb += m * pix[offset + 2];
            sum += m;
            read++;
          }
          ri = yi + x;
          a2[ri] = ca / sum;
          r2[ri] = cr / sum;
          g2[ri] = cg / sum;
          b2[ri] = cb / sum;
        }
        yi += aImgWidth;
      }

      yi = 0;
      ym = -sharedBlurRadius;
      ymi = ym*aImgWidth;

      for (y = 0; y < aImgHeight; y++) {
        for (x = 0; x < aImgWidth; x++) {
          cb = cg = cr = ca = sum = 0;
          if (ym<0) {
            bk0 = ri = -ym;
            read = x;
          } else {
            if (ym >= aImgHeight) {
              break;
            }
            bk0 = 0;
            ri = ym;
            read = x + ymi;
          }
          for (i = bk0; i < sharedBlurKernelSize; i++) {
            if (ri >= aImgHeight) {
              break;
            }
            m = sharedBlurKernal[i];
            ca += m * a2[read];
            cr += m * r2[read];
            cg += m * g2[read];
            cb += m * b2[read];
            sum += m;
            ri++;
            read += aImgWidth;
          }
          offset = (x + yi) *4;
          pix[offset] = cr / sum;
          pix[offset + 1] = cg / sum;
          pix[offset + 2] = cb / sum;
          pix[offset + 3] = ca / sum;
        }
        yi += aImgWidth;
        ymi += aImgWidth;
        ym++;
      }
    };

    // helper funtion for ERODE and DILATE modes of filter()
    var dilate = function(isInverted, aImg) {
      var currIdx = 0;
      var maxIdx = aImg.pixels.getLength();
      var out = new Int32Array(maxIdx);
      var currRowIdx, maxRowIdx, colOrig, colOut, currLum;
      var idxRight, idxLeft, idxUp, idxDown,
          colRight, colLeft, colUp, colDown,
          lumRight, lumLeft, lumUp, lumDown;

      if (!isInverted) {
        // erosion (grow light areas)
        while (currIdx<maxIdx) {
          currRowIdx = currIdx;
          maxRowIdx = currIdx + aImg.width;
          while (currIdx < maxRowIdx) {
            colOrig = colOut = aImg.pixels.getPixel(currIdx);
            idxLeft = currIdx - 1;
            idxRight = currIdx + 1;
            idxUp = currIdx - aImg.width;
            idxDown = currIdx + aImg.width;
            if (idxLeft < currRowIdx) {
              idxLeft = currIdx;
            }
            if (idxRight >= maxRowIdx) {
              idxRight = currIdx;
            }
            if (idxUp < 0) {
              idxUp = 0;
            }
            if (idxDown >= maxIdx) {
              idxDown = currIdx;
            }
            colUp = aImg.pixels.getPixel(idxUp);
            colLeft = aImg.pixels.getPixel(idxLeft);
            colDown = aImg.pixels.getPixel(idxDown);
            colRight = aImg.pixels.getPixel(idxRight);

            // compute luminance
            currLum = 77*(colOrig>>16&0xff) + 151*(colOrig>>8&0xff) + 28*(colOrig&0xff);
            lumLeft = 77*(colLeft>>16&0xff) + 151*(colLeft>>8&0xff) + 28*(colLeft&0xff);
            lumRight = 77*(colRight>>16&0xff) + 151*(colRight>>8&0xff) + 28*(colRight&0xff);
            lumUp = 77*(colUp>>16&0xff) + 151*(colUp>>8&0xff) + 28*(colUp&0xff);
            lumDown = 77*(colDown>>16&0xff) + 151*(colDown>>8&0xff) + 28*(colDown&0xff);

            if (lumLeft > currLum) {
              colOut = colLeft;
              currLum = lumLeft;
            }
            if (lumRight > currLum) {
              colOut = colRight;
              currLum = lumRight;
            }
            if (lumUp > currLum) {
              colOut = colUp;
              currLum = lumUp;
            }
            if (lumDown > currLum) {
              colOut = colDown;
              currLum = lumDown;
            }
            out[currIdx++] = colOut;
          }
        }
      } else {
        // dilate (grow dark areas)
        while (currIdx < maxIdx) {
          currRowIdx = currIdx;
          maxRowIdx = currIdx + aImg.width;
          while (currIdx < maxRowIdx) {
            colOrig = colOut = aImg.pixels.getPixel(currIdx);
            idxLeft = currIdx - 1;
            idxRight = currIdx + 1;
            idxUp = currIdx - aImg.width;
            idxDown = currIdx + aImg.width;
            if (idxLeft < currRowIdx) {
              idxLeft = currIdx;
            }
            if (idxRight >= maxRowIdx) {
              idxRight = currIdx;
            }
            if (idxUp < 0) {
              idxUp = 0;
            }
            if (idxDown >= maxIdx) {
              idxDown = currIdx;
            }
            colUp = aImg.pixels.getPixel(idxUp);
            colLeft = aImg.pixels.getPixel(idxLeft);
            colDown = aImg.pixels.getPixel(idxDown);
            colRight = aImg.pixels.getPixel(idxRight);

            // compute luminance
            currLum = 77*(colOrig>>16&0xff) + 151*(colOrig>>8&0xff) + 28*(colOrig&0xff);
            lumLeft = 77*(colLeft>>16&0xff) + 151*(colLeft>>8&0xff) + 28*(colLeft&0xff);
            lumRight = 77*(colRight>>16&0xff) + 151*(colRight>>8&0xff) + 28*(colRight&0xff);
            lumUp = 77*(colUp>>16&0xff) + 151*(colUp>>8&0xff) + 28*(colUp&0xff);
            lumDown = 77*(colDown>>16&0xff) + 151*(colDown>>8&0xff) + 28*(colDown&0xff);

            if (lumLeft < currLum) {
              colOut = colLeft;
              currLum = lumLeft;
            }
            if (lumRight < currLum) {
              colOut = colRight;
              currLum = lumRight;
            }
            if (lumUp < currLum) {
              colOut = colUp;
              currLum = lumUp;
            }
            if (lumDown < currLum) {
              colOut = colDown;
              currLum = lumDown;
            }
            out[currIdx++]=colOut;
          }
        }
      }
      aImg.pixels.set(out);
      //p.arraycopy(out,0,pixels,0,maxIdx);
    };

    /**
    * Filters the display window as defined by one of the following modes:
    * THRESHOLD - converts the image to black and white pixels depending if they are above or below the threshold
    * defined by the level parameter. The level must be between 0.0 (black) and 1.0(white). If no level is specified, 0.5 is used.
    * GRAY - converts any colors in the image to grayscale equivalents
    * INVERT - sets each pixel to its inverse value
    * POSTERIZE - limits each channel of the image to the number of colors specified as the level parameter
    * BLUR - executes a Guassian blur with the level parameter specifying the extent of the blurring. If no level parameter is
    * used, the blur is equivalent to Guassian blur of radius 1.
    * OPAQUE - sets the alpha channel to entirely opaque.
    * ERODE - reduces the light areas with the amount defined by the level parameter.
    * DILATE - increases the light areas with the amount defined by the level parameter.
    *
    * @param {MODE} MODE          Either THRESHOLD, GRAY, INVERT, POSTERIZE, BLUR, OPAQUE, ERODE, or DILATE
    * @param {int|float} level    defines the quality of the filter
    *
    * @see blend
    */
    p.filter = function(kind, param, aImg){
      var img, col, lum, i;

      if (arguments.length === 3) {
        aImg.loadPixels();
        img = aImg;
      } else {
        p.loadPixels();
        img = p;
      }

      if (param === undef) {
        param = null;
      }
      if (img.isRemote) { // Remote images cannot access imageData
        throw "Image is loaded remotely. Cannot filter image.";
      }
      // begin filter process
      var imglen = img.pixels.getLength();
      switch (kind) {
        case PConstants.BLUR:
          var radius = param || 1; // if no param specified, use 1 (default for p5)
          blurARGB(radius, img);
          break;

        case PConstants.GRAY:
          if (img.format === PConstants.ALPHA) { //trouble
            // for an alpha image, convert it to an opaque grayscale
            for (i = 0; i < imglen; i++) {
              col = 255 - img.pixels.getPixel(i);
              img.pixels.setPixel(i,(0xff000000 | (col << 16) | (col << 8) | col));
            }
            img.format = PConstants.RGB; //trouble
          } else {
            for (i = 0; i < imglen; i++) {
              col = img.pixels.getPixel(i);
              lum = (77*(col>>16&0xff) + 151*(col>>8&0xff) + 28*(col&0xff))>>8;
              img.pixels.setPixel(i,((col & PConstants.ALPHA_MASK) | lum<<16 | lum<<8 | lum));
            }
          }
          break;

        case PConstants.INVERT:
          for (i = 0; i < imglen; i++) {
            img.pixels.setPixel(i, (img.pixels.getPixel(i) ^ 0xffffff));
          }
          break;

        case PConstants.POSTERIZE:
          if (param === null) {
            throw "Use filter(POSTERIZE, int levels) instead of filter(POSTERIZE)";
          }
          var levels = p.floor(param);
          if ((levels < 2) || (levels > 255)) {
            throw "Levels must be between 2 and 255 for filter(POSTERIZE, levels)";
          }
          var levels1 = levels - 1;
          for (i = 0; i < imglen; i++) {
            var rlevel = (img.pixels.getPixel(i) >> 16) & 0xff;
            var glevel = (img.pixels.getPixel(i) >> 8) & 0xff;
            var blevel = img.pixels.getPixel(i) & 0xff;
            rlevel = (((rlevel * levels) >> 8) * 255) / levels1;
            glevel = (((glevel * levels) >> 8) * 255) / levels1;
            blevel = (((blevel * levels) >> 8) * 255) / levels1;
            img.pixels.setPixel(i, ((0xff000000 & img.pixels.getPixel(i)) | (rlevel << 16) | (glevel << 8) | blevel));
          }
          break;

        case PConstants.OPAQUE:
          for (i = 0; i < imglen; i++) {
            img.pixels.setPixel(i, (img.pixels.getPixel(i) | 0xff000000));
          }
          img.format = PConstants.RGB; //trouble
          break;

        case PConstants.THRESHOLD:
          if (param === null) {
            param = 0.5;
          }
          if ((param < 0) || (param > 1)) {
            throw "Level must be between 0 and 1 for filter(THRESHOLD, level)";
          }
          var thresh = p.floor(param * 255);
          for (i = 0; i < imglen; i++) {
            var max = p.max((img.pixels.getPixel(i) & PConstants.RED_MASK) >> 16, p.max((img.pixels.getPixel(i) & PConstants.GREEN_MASK) >> 8, (img.pixels.getPixel(i) & PConstants.BLUE_MASK)));
            img.pixels.setPixel(i, ((img.pixels.getPixel(i) & PConstants.ALPHA_MASK) | ((max < thresh) ? 0x000000 : 0xffffff)));
          }
          break;

        case PConstants.ERODE:
          dilate(true, img);
          break;

        case PConstants.DILATE:
          dilate(false, img);
          break;
      }
      img.updatePixels();
    };


    // shared variables for blit_resize(), filter_new_scanline(), filter_bilinear(), filter()
    // change this in the future to not be exposed to p
    p.shared = {
      fracU: 0,
      ifU: 0,
      fracV: 0,
      ifV: 0,
      u1: 0,
      u2: 0,
      v1: 0,
      v2: 0,
      sX: 0,
      sY: 0,
      iw: 0,
      iw1: 0,
      ih1: 0,
      ul: 0,
      ll: 0,
      ur: 0,
      lr: 0,
      cUL: 0,
      cLL: 0,
      cUR: 0,
      cLR: 0,
      srcXOffset: 0,
      srcYOffset: 0,
      r: 0,
      g: 0,
      b: 0,
      a: 0,
      srcBuffer: null,
      blurRadius: 0,
      blurKernelSize: 0,
      blurKernel: null
    };

    p.intersect = function(sx1, sy1, sx2, sy2, dx1, dy1, dx2, dy2) {
      var sw = sx2 - sx1 + 1;
      var sh = sy2 - sy1 + 1;
      var dw = dx2 - dx1 + 1;
      var dh = dy2 - dy1 + 1;
      if (dx1 < sx1) {
        dw += dx1 - sx1;
        if (dw > sw) {
          dw = sw;
        }
      } else {
        var w = sw + sx1 - dx1;
        if (dw > w) {
          dw = w;
        }
      }
      if (dy1 < sy1) {
        dh += dy1 - sy1;
        if (dh > sh) {
          dh = sh;
        }
      } else {
        var h = sh + sy1 - dy1;
        if (dh > h) {
          dh = h;
        }
      }
      return ! (dw <= 0 || dh <= 0);
    };

    var blendFuncs = {};
    blendFuncs[PConstants.BLEND] = p.modes.blend;
    blendFuncs[PConstants.ADD] = p.modes.add;
    blendFuncs[PConstants.SUBTRACT] = p.modes.subtract;
    blendFuncs[PConstants.LIGHTEST] = p.modes.lightest;
    blendFuncs[PConstants.DARKEST] = p.modes.darkest;
    blendFuncs[PConstants.REPLACE] = p.modes.replace;
    blendFuncs[PConstants.DIFFERENCE] = p.modes.difference;
    blendFuncs[PConstants.EXCLUSION] = p.modes.exclusion;
    blendFuncs[PConstants.MULTIPLY] = p.modes.multiply;
    blendFuncs[PConstants.SCREEN] = p.modes.screen;
    blendFuncs[PConstants.OVERLAY] = p.modes.overlay;
    blendFuncs[PConstants.HARD_LIGHT] = p.modes.hard_light;
    blendFuncs[PConstants.SOFT_LIGHT] = p.modes.soft_light;
    blendFuncs[PConstants.DODGE] = p.modes.dodge;
    blendFuncs[PConstants.BURN] = p.modes.burn;

    p.blit_resize = function(img, srcX1, srcY1, srcX2, srcY2, destPixels,
                             screenW, screenH, destX1, destY1, destX2, destY2, mode) {
      var x, y;
      if (srcX1 < 0) {
        srcX1 = 0;
      }
      if (srcY1 < 0) {
        srcY1 = 0;
      }
      if (srcX2 >= img.width) {
        srcX2 = img.width - 1;
      }
      if (srcY2 >= img.height) {
        srcY2 = img.height - 1;
      }
      var srcW = srcX2 - srcX1;
      var srcH = srcY2 - srcY1;
      var destW = destX2 - destX1;
      var destH = destY2 - destY1;

      if (destW <= 0 || destH <= 0 || srcW <= 0 || srcH <= 0 || destX1 >= screenW ||
          destY1 >= screenH || srcX1 >= img.width || srcY1 >= img.height) {
        return;
      }

      var dx = Math.floor(srcW / destW * PConstants.PRECISIONF);
      var dy = Math.floor(srcH / destH * PConstants.PRECISIONF);

      var pshared = p.shared;

      pshared.srcXOffset = Math.floor(destX1 < 0 ? -destX1 * dx : srcX1 * PConstants.PRECISIONF);
      pshared.srcYOffset = Math.floor(destY1 < 0 ? -destY1 * dy : srcY1 * PConstants.PRECISIONF);
      if (destX1 < 0) {
        destW += destX1;
        destX1 = 0;
      }
      if (destY1 < 0) {
        destH += destY1;
        destY1 = 0;
      }
      destW = Math.min(destW, screenW - destX1);
      destH = Math.min(destH, screenH - destY1);

      var destOffset = destY1 * screenW + destX1;
      var destColor;

      pshared.srcBuffer = img.imageData.data;
      pshared.iw = img.width;
      pshared.iw1 = img.width - 1;
      pshared.ih1 = img.height - 1;

      // cache for speed
      var filterBilinear = p.filter_bilinear,
        filterNewScanline = p.filter_new_scanline,
        blendFunc = blendFuncs[mode],
        blendedColor,
        idx,
        cULoffset,
        cURoffset,
        cLLoffset,
        cLRoffset,
        ALPHA_MASK = PConstants.ALPHA_MASK,
        RED_MASK = PConstants.RED_MASK,
        GREEN_MASK = PConstants.GREEN_MASK,
        BLUE_MASK = PConstants.BLUE_MASK,
        PREC_MAXVAL = PConstants.PREC_MAXVAL,
        PRECISIONB = PConstants.PRECISIONB,
        PREC_RED_SHIFT = PConstants.PREC_RED_SHIFT,
        PREC_ALPHA_SHIFT = PConstants.PREC_ALPHA_SHIFT,
        srcBuffer = pshared.srcBuffer,
        min = Math.min;

      for (y = 0; y < destH; y++) {

        pshared.sX = pshared.srcXOffset;
        pshared.fracV = pshared.srcYOffset & PREC_MAXVAL;
        pshared.ifV = PREC_MAXVAL - pshared.fracV;
        pshared.v1 = (pshared.srcYOffset >> PRECISIONB) * pshared.iw;
        pshared.v2 = min((pshared.srcYOffset >> PRECISIONB) + 1, pshared.ih1) * pshared.iw;

        for (x = 0; x < destW; x++) {
          idx = (destOffset + x) * 4;

          destColor = (destPixels[idx + 3] << 24) &
                      ALPHA_MASK | (destPixels[idx] << 16) &
                      RED_MASK   | (destPixels[idx + 1] << 8) &
                      GREEN_MASK |  destPixels[idx + 2] & BLUE_MASK;

          pshared.fracU = pshared.sX & PREC_MAXVAL;
          pshared.ifU = PREC_MAXVAL - pshared.fracU;
          pshared.ul = (pshared.ifU * pshared.ifV) >> PRECISIONB;
          pshared.ll = (pshared.ifU * pshared.fracV) >> PRECISIONB;
          pshared.ur = (pshared.fracU * pshared.ifV) >> PRECISIONB;
          pshared.lr = (pshared.fracU * pshared.fracV) >> PRECISIONB;
          pshared.u1 = (pshared.sX >> PRECISIONB);
          pshared.u2 = min(pshared.u1 + 1, pshared.iw1);

          cULoffset = (pshared.v1 + pshared.u1) * 4;
          cURoffset = (pshared.v1 + pshared.u2) * 4;
          cLLoffset = (pshared.v2 + pshared.u1) * 4;
          cLRoffset = (pshared.v2 + pshared.u2) * 4;

          pshared.cUL = (srcBuffer[cULoffset + 3] << 24) &
                        ALPHA_MASK | (srcBuffer[cULoffset] << 16) &
                        RED_MASK   | (srcBuffer[cULoffset + 1] << 8) &
                        GREEN_MASK |  srcBuffer[cULoffset + 2] & BLUE_MASK;

          pshared.cUR = (srcBuffer[cURoffset + 3] << 24) &
                        ALPHA_MASK | (srcBuffer[cURoffset] << 16) &
                        RED_MASK   | (srcBuffer[cURoffset + 1] << 8) &
                        GREEN_MASK |  srcBuffer[cURoffset + 2] & BLUE_MASK;

          pshared.cLL = (srcBuffer[cLLoffset + 3] << 24) &
                        ALPHA_MASK | (srcBuffer[cLLoffset] << 16) &
                        RED_MASK   | (srcBuffer[cLLoffset + 1] << 8) &
                        GREEN_MASK |  srcBuffer[cLLoffset + 2] & BLUE_MASK;

          pshared.cLR = (srcBuffer[cLRoffset + 3] << 24) &
                        ALPHA_MASK | (srcBuffer[cLRoffset] << 16) &
                        RED_MASK   | (srcBuffer[cLRoffset + 1] << 8) &
                        GREEN_MASK |  srcBuffer[cLRoffset + 2] & BLUE_MASK;

          pshared.r = ((pshared.ul * ((pshared.cUL & RED_MASK) >> 16) +
                       pshared.ll * ((pshared.cLL & RED_MASK) >> 16) +
                       pshared.ur * ((pshared.cUR & RED_MASK) >> 16) +
                       pshared.lr * ((pshared.cLR & RED_MASK) >> 16)) << PREC_RED_SHIFT) & RED_MASK;
          pshared.g = ((pshared.ul * (pshared.cUL & GREEN_MASK) +
                       pshared.ll * (pshared.cLL & GREEN_MASK) +
                       pshared.ur * (pshared.cUR & GREEN_MASK) +
                       pshared.lr * (pshared.cLR & GREEN_MASK)) >>> PRECISIONB) & GREEN_MASK;
          pshared.b = (pshared.ul * (pshared.cUL & BLUE_MASK) +
                       pshared.ll * (pshared.cLL & BLUE_MASK) +
                       pshared.ur * (pshared.cUR & BLUE_MASK) +
                       pshared.lr * (pshared.cLR & BLUE_MASK)) >>> PRECISIONB;
          pshared.a = ((pshared.ul * ((pshared.cUL & ALPHA_MASK) >>> 24) +
                       pshared.ll * ((pshared.cLL & ALPHA_MASK) >>> 24) +
                       pshared.ur * ((pshared.cUR & ALPHA_MASK) >>> 24) +
                       pshared.lr * ((pshared.cLR & ALPHA_MASK) >>> 24)) << PREC_ALPHA_SHIFT) & ALPHA_MASK;

          blendedColor = blendFunc(destColor, (pshared.a | pshared.r | pshared.g | pshared.b));

          destPixels[idx]     = (blendedColor & RED_MASK) >>> 16;
          destPixels[idx + 1] = (blendedColor & GREEN_MASK) >>> 8;
          destPixels[idx + 2] = (blendedColor & BLUE_MASK);
          destPixels[idx + 3] = (blendedColor & ALPHA_MASK) >>> 24;

          pshared.sX += dx;
        }
        destOffset += screenW;
        pshared.srcYOffset += dy;
      }
    };

    ////////////////////////////////////////////////////////////////////////////
    // Font handling
    ////////////////////////////////////////////////////////////////////////////

    /**
     * loadFont() Loads a font into a variable of type PFont.
     *
     * @param {String} name filename of the font to load
     * @param {int|float} size option font size (used internally)
     *
     * @returns {PFont} new PFont object
     *
     * @see #PFont
     * @see #textFont
     * @see #text
     * @see #createFont
     */
    p.loadFont = function(name, size) {
      if (name === undef) {
        throw("font name required in loadFont.");
      }
      if (name.indexOf(".svg") === -1) {
        if (size === undef) {
          size = curTextFont.size;
        }
        return PFont.get(name, size);
      }
      // If the font is a glyph, calculate by SVG table
      var font = p.loadGlyphs(name);

      return {
        name: name,
        css: '12px sans-serif',
        glyph: true,
        units_per_em: font.units_per_em,
        horiz_adv_x: 1 / font.units_per_em * font.horiz_adv_x,
        ascent: font.ascent,
        descent: font.descent,
        width: function(str) {
          var width = 0;
          var len = str.length;
          for (var i = 0; i < len; i++) {
            try {
              width += parseFloat(p.glyphLook(p.glyphTable[name], str[i]).horiz_adv_x);
            }
            catch(e) {
              Processing.debug(e);
            }
          }
          return width / p.glyphTable[name].units_per_em;
        }
      };
    };

    /**
     * createFont() Loads a font into a variable of type PFont.
     * Smooth and charset are ignored in Processing.js.
     *
     * @param {String}    name    filename of the font to load
     * @param {int|float} size    font size in pixels
     * @param {boolean}   smooth  not used in Processing.js
     * @param {char[]}    charset not used in Processing.js
     *
     * @returns {PFont} new PFont object
     *
     * @see #PFont
     * @see #textFont
     * @see #text
     * @see #loadFont
     */
    p.createFont = function(name, size) {
      // because Processing.js only deals with real fonts,
      // createFont is simply a wrapper for loadFont/2
      return p.loadFont(name, size);
    };

    /**
     * textFont() Sets the current font.
     *
     * @param {PFont}     pfont the PFont to load as current text font
     * @param {int|float} size optional font size in pixels
     *
     * @see #createFont
     * @see #loadFont
     * @see #PFont
     * @see #text
     */
    p.textFont = function(pfont, size) {
      if (size !== undef) {
        // If we're using an SVG glyph font, don't load from cache
        if (!pfont.glyph) {
          pfont = PFont.get(pfont.name, size);
        }
        curTextSize = size;
      }
      curTextFont = pfont;
      curFontName = curTextFont.name;
      curTextAscent = curTextFont.ascent;
      curTextDescent = curTextFont.descent;
      curTextLeading = curTextFont.leading;
      var curContext = drawing.$ensureContext();
      curContext.font = curTextFont.css;
    };

    /**
     * textSize() Sets the current font size in pixels.
     *
     * @param {int|float} size font size in pixels
     *
     * @see #textFont
     * @see #loadFont
     * @see #PFont
     * @see #text
     */
    p.textSize = function(size) {
      curTextFont = PFont.get(curFontName, size);
      curTextSize = size;
      // recache metrics
      curTextAscent = curTextFont.ascent;
      curTextDescent = curTextFont.descent;
      curTextLeading = curTextFont.leading;
      var curContext = drawing.$ensureContext();
      curContext.font = curTextFont.css;
    };

    /**
     * textAscent() returns the maximum height a character extends above the baseline of the
     * current font at its current size, in pixels.
     *
     * @returns {float} height of the current font above the baseline, at its current size, in pixels
     *
     * @see #textDescent
     */
    p.textAscent = function() {
      return curTextAscent;
    };

    /**
     * textDescent() returns the maximum depth a character will protrude below the baseline of
     * the current font at its current size, in pixels.
     *
     * @returns {float} depth of the current font below the baseline, at its current size, in pixels
     *
     * @see #textAscent
     */
    p.textDescent = function() {
      return curTextDescent;
    };

    /**
     * textLeading() Sets the current font's leading, which is the distance
     * from baseline to baseline over consecutive lines, with additional vertical
     * spacing taking into account. Usually this value is 1.2 or 1.25 times the
     * textsize, but this value can be changed to effect vertically compressed
     * or stretched text.
     *
     * @param {int|float} the desired baseline-to-baseline size in pixels
     */
    p.textLeading = function(leading) {
      curTextLeading = leading;
    };

    /**
     * textAlign() Sets the current alignment for drawing text.
     *
     * @param {int} ALIGN  Horizontal alignment, either LEFT, CENTER, or RIGHT
     * @param {int} YALIGN optional vertical alignment, either TOP, BOTTOM, CENTER, or BASELINE
     *
     * @see #loadFont
     * @see #PFont
     * @see #text
     */
    p.textAlign = function(xalign, yalign) {
      horizontalTextAlignment = xalign;
      verticalTextAlignment = yalign || PConstants.BASELINE;
    };

    /**
     * toP5String converts things with arbitrary data type into
     * string values, for text rendering.
     *
     * @param {any} any object that can be converted into a string
     *
     * @return {String} the string representation of the input
     */
    function toP5String(obj) {
      if(obj instanceof String) {
        return obj;
      }
      if(typeof obj === 'number') {
        // check if an int
        if(obj === (0 | obj)) {
          return obj.toString();
        }
        return p.nf(obj, 0, 3);
      }
      if(obj === null || obj === undef) {
        return "";
      }
      return obj.toString();
    }

    /**
     * textWidth() Calculates and returns the width of any character or text string in pixels.
     *
     * @param {char|String} str char or String to be measured
     *
     * @return {float} width of char or String in pixels
     *
     * @see #loadFont
     * @see #PFont
     * @see #text
     * @see #textFont
     */
    Drawing2D.prototype.textWidth = function(str) {
      var lines = toP5String(str).split(/\r?\n/g), width = 0;
      var i, linesCount = lines.length;

      curContext.font = curTextFont.css;
      for (i = 0; i < linesCount; ++i) {
        width = Math.max(width, curTextFont.measureTextWidth(lines[i]));
      }
      return width | 0;
    };

    Drawing3D.prototype.textWidth = function(str) {
      var lines = toP5String(str).split(/\r?\n/g), width = 0;
      var i, linesCount = lines.length;
      if (textcanvas === undef) {
        textcanvas = document.createElement("canvas");
      }

      var textContext = textcanvas.getContext("2d");
      textContext.font = curTextFont.css;

      for (i = 0; i < linesCount; ++i) {
        width = Math.max(width, textContext.measureText(lines[i]).width);
      }
      return width | 0;
    };

    // A lookup table for characters that can not be referenced by Object
    p.glyphLook = function(font, chr) {
      try {
        switch (chr) {
        case "1":
          return font.one;
        case "2":
          return font.two;
        case "3":
          return font.three;
        case "4":
          return font.four;
        case "5":
          return font.five;
        case "6":
          return font.six;
        case "7":
          return font.seven;
        case "8":
          return font.eight;
        case "9":
          return font.nine;
        case "0":
          return font.zero;
        case " ":
          return font.space;
        case "$":
          return font.dollar;
        case "!":
          return font.exclam;
        case '"':
          return font.quotedbl;
        case "#":
          return font.numbersign;
        case "%":
          return font.percent;
        case "&":
          return font.ampersand;
        case "'":
          return font.quotesingle;
        case "(":
          return font.parenleft;
        case ")":
          return font.parenright;
        case "*":
          return font.asterisk;
        case "+":
          return font.plus;
        case ",":
          return font.comma;
        case "-":
          return font.hyphen;
        case ".":
          return font.period;
        case "/":
          return font.slash;
        case "_":
          return font.underscore;
        case ":":
          return font.colon;
        case ";":
          return font.semicolon;
        case "<":
          return font.less;
        case "=":
          return font.equal;
        case ">":
          return font.greater;
        case "?":
          return font.question;
        case "@":
          return font.at;
        case "[":
          return font.bracketleft;
        case "\\":
          return font.backslash;
        case "]":
          return font.bracketright;
        case "^":
          return font.asciicircum;
        case "`":
          return font.grave;
        case "{":
          return font.braceleft;
        case "|":
          return font.bar;
        case "}":
          return font.braceright;
        case "~":
          return font.asciitilde;
          // If the character is not 'special', access it by object reference
        default:
          return font[chr];
        }
      } catch(e) {
        Processing.debug(e);
      }
    };

    // Print some text to the Canvas
    Drawing2D.prototype.text$line = function(str, x, y, z, align) {
      var textWidth = 0, xOffset = 0;
      // If the font is a standard Canvas font...
      if (!curTextFont.glyph) {
        if (str && ("fillText" in curContext)) {
          if (isFillDirty) {
            curContext.fillStyle = p.color.toString(currentFillColor);
            isFillDirty = false;
          }

          // horizontal offset/alignment
          if(align === PConstants.RIGHT || align === PConstants.CENTER) {
            textWidth = curTextFont.measureTextWidth(str);

            if(align === PConstants.RIGHT) {
              xOffset = -textWidth;
            } else { // if(align === PConstants.CENTER)
              xOffset = -textWidth/2;
            }
          }

          curContext.fillText(str, x+xOffset, y);
        }
      } else {
        // If the font is a Batik SVG font...
        var font = p.glyphTable[curFontName];
        saveContext();
        curContext.translate(x, y + curTextSize);

        // horizontal offset/alignment
        if(align === PConstants.RIGHT || align === PConstants.CENTER) {
          textWidth = font.width(str);

          if(align === PConstants.RIGHT) {
            xOffset = -textWidth;
          } else { // if(align === PConstants.CENTER)
            xOffset = -textWidth/2;
          }
        }

        var upem   = font.units_per_em,
          newScale = 1 / upem * curTextSize;

        curContext.scale(newScale, newScale);

        for (var i=0, len=str.length; i < len; i++) {
          // Test character against glyph table
          try {
            p.glyphLook(font, str[i]).draw();
          } catch(e) {
            Processing.debug(e);
          }
        }
        restoreContext();
      }
    };

    Drawing3D.prototype.text$line = function(str, x, y, z, align) {
      // handle case for 3d text
      if (textcanvas === undef) {
        textcanvas = document.createElement("canvas");
      }
      var oldContext = curContext;
      curContext = textcanvas.getContext("2d");
      curContext.font = curTextFont.css;
      var textWidth = curTextFont.measureTextWidth(str);
      textcanvas.width = textWidth;
      textcanvas.height = curTextSize;
      curContext = textcanvas.getContext("2d"); // refreshes curContext
      curContext.font = curTextFont.css;
      curContext.textBaseline="top";

      // paint on 2D canvas
      Drawing2D.prototype.text$line(str,0,0,0,PConstants.LEFT);

      // use it as a texture
      var aspect = textcanvas.width/textcanvas.height;
      curContext = oldContext;

      curContext.bindTexture(curContext.TEXTURE_2D, textTex);
      curContext.texImage2D(curContext.TEXTURE_2D, 0, curContext.RGBA, curContext.RGBA, curContext.UNSIGNED_BYTE, textcanvas);
      curContext.texParameteri(curContext.TEXTURE_2D, curContext.TEXTURE_MAG_FILTER, curContext.LINEAR);
      curContext.texParameteri(curContext.TEXTURE_2D, curContext.TEXTURE_MIN_FILTER, curContext.LINEAR);
      curContext.texParameteri(curContext.TEXTURE_2D, curContext.TEXTURE_WRAP_T, curContext.CLAMP_TO_EDGE);
      curContext.texParameteri(curContext.TEXTURE_2D, curContext.TEXTURE_WRAP_S, curContext.CLAMP_TO_EDGE);
      // If we don't have a power of two texture, we can't mipmap it.
      // curContext.generateMipmap(curContext.TEXTURE_2D);

      // horizontal offset/alignment
      var xOffset = 0;
      if (align === PConstants.RIGHT) {
        xOffset = -textWidth;
      } else if(align === PConstants.CENTER) {
        xOffset = -textWidth/2;
      }
      var model = new PMatrix3D();
      var scalefactor = curTextSize * 0.5;
      model.translate(x+xOffset-scalefactor/2, y-scalefactor, z);
      model.scale(-aspect*scalefactor, -scalefactor, scalefactor);
      model.translate(-1, -1, -1);
      model.transpose();

      var view = new PMatrix3D();
      view.scale(1, -1, 1);
      view.apply(modelView.array());
      view.transpose();

      curContext.useProgram(programObject2D);
      vertexAttribPointer("aVertex2d", programObject2D, "aVertex", 3, textBuffer);
      vertexAttribPointer("aTextureCoord2d", programObject2D, "aTextureCoord", 2, textureBuffer);
      uniformi("uSampler2d", programObject2D, "uSampler", [0]);

      uniformi("uIsDrawingText2d", programObject2D, "uIsDrawingText", true);

      uniformMatrix("uModel2d", programObject2D, "uModel", false,  model.array());
      uniformMatrix("uView2d", programObject2D, "uView", false, view.array());
      uniformf("uColor2d", programObject2D, "uColor", fillStyle);
      curContext.bindBuffer(curContext.ELEMENT_ARRAY_BUFFER, indexBuffer);
      curContext.drawElements(curContext.TRIANGLES, 6, curContext.UNSIGNED_SHORT, 0);
    };


    /**
    * unbounded text function (z is an optional argument)
    */
    function text$4(str, x, y, z) {
      var lines, linesCount;
      if(str.indexOf('\n') < 0) {
        lines = [str];
        linesCount = 1;
      } else {
        lines = str.split(/\r?\n/g);
        linesCount = lines.length;
      }
      // handle text line-by-line

      var yOffset = 0;
      if(verticalTextAlignment === PConstants.TOP) {
        yOffset = curTextAscent + curTextDescent;
      } else if(verticalTextAlignment === PConstants.CENTER) {
        yOffset = curTextAscent/2 - (linesCount-1)*curTextLeading/2;
      } else if(verticalTextAlignment === PConstants.BOTTOM) {
        yOffset = -(curTextDescent + (linesCount-1)*curTextLeading);
      }

      for(var i=0;i<linesCount;++i) {
        var line = lines[i];
        drawing.text$line(line, x, y + yOffset, z, horizontalTextAlignment);
        yOffset += curTextLeading;
      }
    }


    /**
    * box-bounded text function (z is an optional argument)
    */
    function text$6(str, x, y, width, height, z) {
      // 'fail' on 0-valued dimensions
      if (str.length === 0 || width === 0 || height === 0) {
        return;
      }
      // also 'fail' if the text height is larger than the bounding height
      if(curTextSize > height) {
        return;
      }

      var spaceMark = -1;
      var start = 0;
      var lineWidth = 0;
      var drawCommands = [];

      // run through text, character-by-character
      for (var charPos=0, len=str.length; charPos < len; charPos++)
      {
        var currentChar = str[charPos];
        var spaceChar = (currentChar === " ");
        var letterWidth = curTextFont.measureTextWidth(currentChar);

        // if we aren't looking at a newline, and the text still fits, keep processing
        if (currentChar !== "\n" && (lineWidth + letterWidth <= width)) {
          if (spaceChar) { spaceMark = charPos; }
          lineWidth += letterWidth;
        }

        // if we're looking at a newline, or the text no longer fits, push the section that fit into the drawcommand list
        else
        {
          if (spaceMark + 1 === start) {
            if(charPos>0) {
              // Whole line without spaces so far.
              spaceMark = charPos;
            } else {
              // 'fail', because the line can't even fit the first character
              return;
            }
          }

          if (currentChar === "\n") {
            drawCommands.push({text:str.substring(start, charPos), width: lineWidth});
            start = charPos + 1;
          } else {
            // current is not a newline, which means the line doesn't fit in box. push text.
            // In Processing 1.5.1, the space is also pushed, so we push up to spaceMark+1,
            // rather than up to spaceMark, as was the case for Processing 1.5 and earlier.
            drawCommands.push({text:str.substring(start, spaceMark+1), width: lineWidth});
            start = spaceMark + 1;
          }

          // newline + return
          lineWidth = 0;
          charPos = start - 1;
        }
      }

      // push the remaining text
      if (start < len) {
        drawCommands.push({text:str.substring(start), width: lineWidth});
      }

      // resolve horizontal alignment
      var xOffset = 1,
          yOffset = curTextAscent;
      if (horizontalTextAlignment === PConstants.CENTER) {
        xOffset = width/2;
      } else if (horizontalTextAlignment === PConstants.RIGHT) {
        xOffset = width;
      }

      // resolve vertical alignment
      var linesCount = drawCommands.length,
          visibleLines = Math.min(linesCount, Math.floor(height/curTextLeading));
      if(verticalTextAlignment === PConstants.TOP) {
        yOffset = curTextAscent + curTextDescent;
      } else if(verticalTextAlignment === PConstants.CENTER) {
        yOffset = (height/2) - curTextLeading * (visibleLines/2 - 1);
      } else if(verticalTextAlignment === PConstants.BOTTOM) {
        yOffset = curTextDescent + curTextLeading;
      }

      var command,
          drawCommand,
          leading;
      for (command = 0; command < linesCount; command++) {
        leading = command * curTextLeading;
        // stop if not enough space for one more line draw
        if (yOffset + leading > height - curTextDescent) {
          break;
        }
        drawCommand = drawCommands[command];
        drawing.text$line(drawCommand.text, x + xOffset, y + yOffset + leading, z, horizontalTextAlignment);
      }
    }

    /**
     * text() Draws text to the screen.
     *
     * @param {String|char|int|float} data       the alphanumeric symbols to be displayed
     * @param {int|float}             x          x-coordinate of text
     * @param {int|float}             y          y-coordinate of text
     * @param {int|float}             z          optional z-coordinate of text
     * @param {String}                stringdata optional letters to be displayed
     * @param {int|float}             width      optional width of text box
     * @param {int|float}             height     optional height of text box
     *
     * @see #textAlign
     * @see #textMode
     * @see #loadFont
     * @see #PFont
     * @see #textFont
     */
    p.text = function() {
      if (textMode === PConstants.SHAPE) {
        // TODO: requires beginRaw function
        return;
      }
      if (arguments.length === 3) { // for text( str, x, y)
        text$4(toP5String(arguments[0]), arguments[1], arguments[2], 0);
      } else if (arguments.length === 4) { // for text( str, x, y, z)
        text$4(toP5String(arguments[0]), arguments[1], arguments[2], arguments[3]);
      } else if (arguments.length === 5) { // for text( str, x, y , width, height)
        text$6(toP5String(arguments[0]), arguments[1], arguments[2], arguments[3], arguments[4], 0);
      } else if (arguments.length === 6) { // for text( stringdata, x, y , width, height, z)
        text$6(toP5String(arguments[0]), arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
      }
    };

    /**
     * Sets the way text draws to the screen. In the default configuration (the MODEL mode), it's possible to rotate,
     * scale, and place letters in two and three dimensional space. <br /><br /> Changing to SCREEN mode draws letters
     * directly to the front of the window and greatly increases rendering quality and speed when used with the P2D and
     * P3D renderers. textMode(SCREEN) with OPENGL and JAVA2D (the default) renderers will generally be slower, though
     * pixel accurate with P2D and P3D. With textMode(SCREEN), the letters draw at the actual size of the font (in pixels)
     * and therefore calls to <b>textSize()</b> will not affect the size of the letters. To create a font at the size you
     * desire, use the "Create font..." option in the Tools menu, or use the createFont() function. When using textMode(SCREEN),
     * any z-coordinate passed to a text() command will be ignored, because your computer screen is...flat!
     *
     * @param {int} MODE Either MODEL, SCREEN or SHAPE (not yet supported)
     *
     * @see loadFont
     * @see PFont
     * @see text
     * @see textFont
     * @see createFont
     */
    p.textMode = function(mode){
      textMode = mode;
    };

    // Load Batik SVG Fonts and parse to pre-def objects for quick rendering
    p.loadGlyphs = function(url) {
      var x, y, cx, cy, nx, ny, d, a, lastCom, lenC, horiz_adv_x, getXY = '[0-9\\-]+', path;

      // Return arrays of SVG commands and coords
      // get this to use p.matchAll() - will need to work around the lack of null return
      var regex = function(needle, hay) {
        var i = 0,
          results = [],
          latest, regexp = new RegExp(needle, "g");
        latest = results[i] = regexp.exec(hay);
        while (latest) {
          i++;
          latest = results[i] = regexp.exec(hay);
        }
        return results;
      };

      var buildPath = function(d) {
        var c = regex("[A-Za-z][0-9\\- ]+|Z", d);
        var beforePathDraw = function() {
          saveContext();
          return drawing.$ensureContext();
        };
        var afterPathDraw = function() {
          executeContextFill();
          executeContextStroke();
          restoreContext();
        };

        // Begin storing path object
        path = "return {draw:function(){var curContext=beforePathDraw();curContext.beginPath();";

        x = 0;
        y = 0;
        cx = 0;
        cy = 0;
        nx = 0;
        ny = 0;
        d = 0;
        a = 0;
        lastCom = "";
        lenC = c.length - 1;

        // Loop through SVG commands translating to canvas eqivs functions in path object
        for (var j = 0; j < lenC; j++) {
          var com = c[j][0], xy = regex(getXY, com);

          switch (com[0]) {
            case "M":
              //curContext.moveTo(x,-y);
              x = parseFloat(xy[0][0]);
              y = parseFloat(xy[1][0]);
              path += "curContext.moveTo(" + x + "," + (-y) + ");";
              break;

            case "L":
              //curContext.lineTo(x,-y);
              x = parseFloat(xy[0][0]);
              y = parseFloat(xy[1][0]);
              path += "curContext.lineTo(" + x + "," + (-y) + ");";
              break;

            case "H":
              //curContext.lineTo(x,-y)
              x = parseFloat(xy[0][0]);
              path += "curContext.lineTo(" + x + "," + (-y) + ");";
              break;

            case "V":
              //curContext.lineTo(x,-y);
              y = parseFloat(xy[0][0]);
              path += "curContext.lineTo(" + x + "," + (-y) + ");";
              break;

            case "T":
              //curContext.quadraticCurveTo(cx,-cy,nx,-ny);
              nx = parseFloat(xy[0][0]);
              ny = parseFloat(xy[1][0]);

              if (lastCom === "Q" || lastCom === "T") {
                d = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(cy - y, 2));
                a = Math.PI + Math.atan2(cx - x, cy - y);
                cx = x + (Math.sin(a) * (d));
                cy = y + (Math.cos(a) * (d));
              } else {
                cx = x;
                cy = y;
              }

              path += "curContext.quadraticCurveTo(" + cx + "," + (-cy) + "," + nx + "," + (-ny) + ");";
              x = nx;
              y = ny;
              break;

            case "Q":
              //curContext.quadraticCurveTo(cx,-cy,nx,-ny);
              cx = parseFloat(xy[0][0]);
              cy = parseFloat(xy[1][0]);
              nx = parseFloat(xy[2][0]);
              ny = parseFloat(xy[3][0]);
              path += "curContext.quadraticCurveTo(" + cx + "," + (-cy) + "," + nx + "," + (-ny) + ");";
              x = nx;
              y = ny;
              break;

            case "Z":
              //curContext.closePath();
              path += "curContext.closePath();";
              break;
          }
          lastCom = com[0];
        }

        path += "afterPathDraw();";
        path += "curContext.translate(" + horiz_adv_x + ",0);";
        path += "}}";

        return ((new Function("beforePathDraw", "afterPathDraw", path))(beforePathDraw, afterPathDraw));
      };

      // Parse SVG font-file into block of Canvas commands
      var parseSVGFont = function(svg) {
        // Store font attributes
        var font = svg.getElementsByTagName("font");
        p.glyphTable[url].horiz_adv_x = font[0].getAttribute("horiz-adv-x");

        var font_face = svg.getElementsByTagName("font-face")[0];
        p.glyphTable[url].units_per_em = parseFloat(font_face.getAttribute("units-per-em"));
        p.glyphTable[url].ascent = parseFloat(font_face.getAttribute("ascent"));
        p.glyphTable[url].descent = parseFloat(font_face.getAttribute("descent"));

        var glyph = svg.getElementsByTagName("glyph"),
          len = glyph.length;

        // Loop through each glyph in the SVG
        for (var i = 0; i < len; i++) {
          // Store attributes for this glyph
          var unicode = glyph[i].getAttribute("unicode");
          var name = glyph[i].getAttribute("glyph-name");
          horiz_adv_x = glyph[i].getAttribute("horiz-adv-x");
          if (horiz_adv_x === null) {
            horiz_adv_x = p.glyphTable[url].horiz_adv_x;
          }
          d = glyph[i].getAttribute("d");
          // Split path commands in glpyh
          if (d !== undef) {
            path = buildPath(d);
            // Store glyph data to table object
            p.glyphTable[url][name] = {
              name: name,
              unicode: unicode,
              horiz_adv_x: horiz_adv_x,
              draw: path.draw
            };
          }
        } // finished adding glyphs to table
      };

      // Load and parse Batik SVG font as XML into a Processing Glyph object
      var loadXML = function() {
        var xmlDoc;

        try {
          xmlDoc = document.implementation.createDocument("", "", null);
        }
        catch(e_fx_op) {
          Processing.debug(e_fx_op.message);
          return;
        }

        try {
          xmlDoc.async = false;
          xmlDoc.load(url);
          parseSVGFont(xmlDoc.getElementsByTagName("svg")[0]);
        }
        catch(e_sf_ch) {
          // Google Chrome, Safari etc.
          Processing.debug(e_sf_ch);
          try {
            var xmlhttp = new window.XMLHttpRequest();
            xmlhttp.open("GET", url, false);
            xmlhttp.send(null);
            parseSVGFont(xmlhttp.responseXML.documentElement);
          }
          catch(e) {
            Processing.debug(e_sf_ch);
          }
        }
      };

      // Create a new object in glyphTable to store this font
      p.glyphTable[url] = {};

      // Begin loading the Batik SVG font...
      loadXML(url);

      // Return the loaded font for attribute grabbing
      return p.glyphTable[url];
    };

    /**
     * Gets the sketch parameter value. The parameter can be defined as the canvas attribute with
     * the "data-processing-" prefix or provided in the pjs directive (e.g. param-test="52").
     * The function tries the canvas attributes, then the pjs directive content.
     *
     * @param   {String}    name          The name of the param to read.
     *
     * @returns {String}    The parameter value, or null if parameter is not defined.
     */
    p.param = function(name) {
      // trying attribute that was specified in CANVAS
      var attributeName = "data-processing-" + name;
      if (curElement.hasAttribute(attributeName)) {
        return curElement.getAttribute(attributeName);
      }
      // trying child PARAM elements of the CANVAS
      for (var i = 0, len = curElement.childNodes.length; i < len; ++i) {
        var item = curElement.childNodes.item(i);
        if (item.nodeType !== 1 || item.tagName.toLowerCase() !== "param") {
          continue;
        }
        if (item.getAttribute("name") === name) {
          return item.getAttribute("value");
        }
      }
      // fallback to default params
      if (curSketch.params.hasOwnProperty(name)) {
        return curSketch.params[name];
      }
      return null;
    };

    ////////////////////////////////////////////////////////////////////////////
    // 2D/3D methods wiring utils
    ////////////////////////////////////////////////////////////////////////////
    function wireDimensionalFunctions(mode) {
      // Drawing2D/Drawing3D
      if (mode === '3D') {
        drawing = new Drawing3D();
      } else if (mode === '2D') {
        drawing = new Drawing2D();
      } else {
        drawing = new DrawingPre();
      }

      // Wire up functions (Use DrawingPre properties names)
      for (var i in DrawingPre.prototype) {
        if (DrawingPre.prototype.hasOwnProperty(i) && i.indexOf("$") < 0) {
          p[i] = drawing[i];
        }
      }

      // Run initialization
      drawing.$init();
    }

    function createDrawingPreFunction(name) {
      return function() {
        wireDimensionalFunctions("2D");
        return drawing[name].apply(this, arguments);
      };
    }
    DrawingPre.prototype.translate = createDrawingPreFunction("translate");
    DrawingPre.prototype.transform = createDrawingPreFunction("transform");
    DrawingPre.prototype.scale = createDrawingPreFunction("scale");
    DrawingPre.prototype.pushMatrix = createDrawingPreFunction("pushMatrix");
    DrawingPre.prototype.popMatrix = createDrawingPreFunction("popMatrix");
    DrawingPre.prototype.resetMatrix = createDrawingPreFunction("resetMatrix");
    DrawingPre.prototype.applyMatrix = createDrawingPreFunction("applyMatrix");
    DrawingPre.prototype.rotate = createDrawingPreFunction("rotate");
    DrawingPre.prototype.rotateZ = createDrawingPreFunction("rotateZ");
    DrawingPre.prototype.shearX = createDrawingPreFunction("shearX");
    DrawingPre.prototype.shearY = createDrawingPreFunction("shearY");
    DrawingPre.prototype.redraw = createDrawingPreFunction("redraw");
    DrawingPre.prototype.toImageData = createDrawingPreFunction("toImageData");
    DrawingPre.prototype.ambientLight = createDrawingPreFunction("ambientLight");
    DrawingPre.prototype.directionalLight = createDrawingPreFunction("directionalLight");
    DrawingPre.prototype.lightFalloff = createDrawingPreFunction("lightFalloff");
    DrawingPre.prototype.lightSpecular = createDrawingPreFunction("lightSpecular");
    DrawingPre.prototype.pointLight = createDrawingPreFunction("pointLight");
    DrawingPre.prototype.noLights = createDrawingPreFunction("noLights");
    DrawingPre.prototype.spotLight = createDrawingPreFunction("spotLight");
    DrawingPre.prototype.beginCamera = createDrawingPreFunction("beginCamera");
    DrawingPre.prototype.endCamera = createDrawingPreFunction("endCamera");
    DrawingPre.prototype.frustum = createDrawingPreFunction("frustum");
    DrawingPre.prototype.box = createDrawingPreFunction("box");
    DrawingPre.prototype.sphere = createDrawingPreFunction("sphere");
    DrawingPre.prototype.ambient = createDrawingPreFunction("ambient");
    DrawingPre.prototype.emissive = createDrawingPreFunction("emissive");
    DrawingPre.prototype.shininess = createDrawingPreFunction("shininess");
    DrawingPre.prototype.specular = createDrawingPreFunction("specular");
    DrawingPre.prototype.fill = createDrawingPreFunction("fill");
    DrawingPre.prototype.stroke = createDrawingPreFunction("stroke");
    DrawingPre.prototype.strokeWeight = createDrawingPreFunction("strokeWeight");
    DrawingPre.prototype.smooth = createDrawingPreFunction("smooth");
    DrawingPre.prototype.noSmooth = createDrawingPreFunction("noSmooth");
    DrawingPre.prototype.point = createDrawingPreFunction("point");
    DrawingPre.prototype.vertex = createDrawingPreFunction("vertex");
    DrawingPre.prototype.endShape = createDrawingPreFunction("endShape");
    DrawingPre.prototype.bezierVertex = createDrawingPreFunction("bezierVertex");
    DrawingPre.prototype.curveVertex = createDrawingPreFunction("curveVertex");
    DrawingPre.prototype.curve = createDrawingPreFunction("curve");
    DrawingPre.prototype.line = createDrawingPreFunction("line");
    DrawingPre.prototype.bezier = createDrawingPreFunction("bezier");
    DrawingPre.prototype.rect = createDrawingPreFunction("rect");
    DrawingPre.prototype.ellipse = createDrawingPreFunction("ellipse");
    DrawingPre.prototype.background = createDrawingPreFunction("background");
    DrawingPre.prototype.image = createDrawingPreFunction("image");
    DrawingPre.prototype.textWidth = createDrawingPreFunction("textWidth");
    DrawingPre.prototype.text$line = createDrawingPreFunction("text$line");
    DrawingPre.prototype.$ensureContext = createDrawingPreFunction("$ensureContext");
    DrawingPre.prototype.$newPMatrix = createDrawingPreFunction("$newPMatrix");

    DrawingPre.prototype.size = function(aWidth, aHeight, aMode) {
      wireDimensionalFunctions(aMode === PConstants.WEBGL ? "3D" : "2D");
      p.size(aWidth, aHeight, aMode);
    };

    DrawingPre.prototype.$init = noop;

    Drawing2D.prototype.$init = function() {
      // Setup default 2d canvas context.
      // Moving this here removes the number of times we need to check the 3D variable
      p.size(p.width, p.height);

      curContext.lineCap = 'round';

      // Set default stroke and fill color
      p.noSmooth();
      p.disableContextMenu();
    };
    Drawing3D.prototype.$init = function() {
      // For ref/perf test compatibility until those are fixed
      p.use3DContext = true;
      p.disableContextMenu();
    };

    DrawingShared.prototype.$ensureContext = function() {
      return curContext;
    };

    //////////////////////////////////////////////////////////////////////////
    // Keyboard Events
    //////////////////////////////////////////////////////////////////////////

    // In order to catch key events in a canvas, it needs to be "specially focusable",
    // by assigning it a tabindex. If no tabindex is specified on-page, set this to 0.
    if (!curElement.getAttribute("tabindex")) {
      curElement.setAttribute("tabindex", 0);
    }

    function getKeyCode(e) {
      var code = e.which || e.keyCode;
      switch (code) {
        case 13: // ENTER
          return 10;
        case 91: // META L (Saf/Mac)
        case 93: // META R (Saf/Mac)
        case 224: // META (FF/Mac)
          return 157;
        case 57392: // CONTROL (Op/Mac)
          return 17;
        case 46: // DELETE
          return 127;
        case 45: // INSERT
          return 155;
      }
      return code;
    }

    function getKeyChar(e) {
      var c = e.which || e.keyCode;
      var anyShiftPressed = e.shiftKey || e.ctrlKey || e.altKey || e.metaKey;
      switch (c) {
        case 13:
          c = anyShiftPressed ? 13 : 10; // RETURN vs ENTER (Mac)
          break;
        case 8:
          c = anyShiftPressed ? 127 : 8; // DELETE vs BACKSPACE (Mac)
          break;
      }
      return new Char(c);
    }

    function suppressKeyEvent(e) {
      if (typeof e.preventDefault === "function") {
        e.preventDefault();
      } else if (typeof e.stopPropagation === "function") {
        e.stopPropagation();
      }
      return false;
    }

    function updateKeyPressed() {
      var ch;
      for (ch in pressedKeysMap) {
        if (pressedKeysMap.hasOwnProperty(ch)) {
          p.__keyPressed = true;
          return;
        }
      }
      p.__keyPressed = false;
    }

    function resetKeyPressed() {
      p.__keyPressed = false;
      pressedKeysMap = [];
      lastPressedKeyCode = null;
    }

    function simulateKeyTyped(code, c) {
      pressedKeysMap[code] = c;
      lastPressedKeyCode = null;
      p.key = c;
      p.keyCode = code;
      p.keyPressed();
      p.keyCode = 0;
      p.keyTyped();
      updateKeyPressed();
    }

    function handleKeydown(e) {
      var code = getKeyCode(e);
      if (code === PConstants.DELETE) {
        simulateKeyTyped(code, new Char(127));
        return;
      }
      if (codedKeys.indexOf(code) < 0) {
        lastPressedKeyCode = code;
        return;
      }
      var c = new Char(PConstants.CODED);
      p.key = c;
      p.keyCode = code;
      pressedKeysMap[code] = c;
      p.keyPressed();
      lastPressedKeyCode = null;
      updateKeyPressed();
      return suppressKeyEvent(e);
    }

    function handleKeypress(e) {
      if (lastPressedKeyCode === null) {
        return; // processed in handleKeydown
      }
      var code = lastPressedKeyCode, c = getKeyChar(e);
      simulateKeyTyped(code, c);
      return suppressKeyEvent(e);
    }

    function handleKeyup(e) {
      var code = getKeyCode(e), c = pressedKeysMap[code];
      if (c === undef) {
        return; // no keyPressed event was generated.
      }
      p.key = c;
      p.keyCode = code;
      p.keyReleased();
      delete pressedKeysMap[code];
      updateKeyPressed();
    }

    // Send aCode Processing syntax to be converted to JavaScript
    if (!pgraphicsMode) {
      if (aCode instanceof Processing.Sketch) {
        // Use sketch as is
        curSketch = aCode;
      } else if (typeof aCode === "function") {
        // Wrap function with default sketch parameters
        curSketch = new Processing.Sketch(aCode);
      } else if (!aCode) {
        // Empty sketch
        curSketch = new Processing.Sketch(function (){});
      } else {
  //#if PARSER
        // Compile the code
        curSketch = Processing.compile(aCode);
  //#else
  //      throw "PJS compile is not supported";
  //#endif
      }

      // Expose internal field for diagnostics and testing
      p.externals.sketch = curSketch;

      wireDimensionalFunctions();

      // the onfocus and onblur events are handled in two parts.
      // 1) the p.focused property is handled per sketch
      curElement.onfocus = function() {
        p.focused = true;
      };

      curElement.onblur = function() {
        p.focused = false;
        if (!curSketch.options.globalKeyEvents) {
          resetKeyPressed();
        }
      };

      // 2) looping status is handled per page, based on the pauseOnBlur @pjs directive
      if (curSketch.options.pauseOnBlur) {
        attachEventHandler(window, 'focus', function() {
          if (doLoop) {
            p.loop();
          }
        });

        attachEventHandler(window, 'blur', function() {
          if (doLoop && loopStarted) {
            p.noLoop();
            doLoop = true; // make sure to keep this true after the noLoop call
          }
          resetKeyPressed();
        });
      }

      // if keyboard events should be handled globally, the listeners should
      // be bound to the document window, rather than to the current canvas
      var keyTrigger = curSketch.options.globalKeyEvents ? window : curElement;
      attachEventHandler(keyTrigger, "keydown", handleKeydown);
      attachEventHandler(keyTrigger, "keypress", handleKeypress);
      attachEventHandler(keyTrigger, "keyup", handleKeyup);

      // Step through the libraries that were attached at doc load...
      for (var i in Processing.lib) {
        if (Processing.lib.hasOwnProperty(i)) {
          if(Processing.lib[i].hasOwnProperty("attach")) {
            // use attach function if present
            Processing.lib[i].attach(p);
          } else if(Processing.lib[i] instanceof Function)  {
            // Init the libraries in the context of this p_instance (legacy)
            Processing.lib[i].call(this);
          }
        }
      }

      // sketch execute test interval, used to reschedule
      // an execute when preloads have not yet finished.
      var retryInterval = 100;

      var executeSketch = function(processing) {
        // Don't start until all specified images and fonts in the cache are preloaded
        if (!(curSketch.imageCache.pending || PFont.preloading.pending(retryInterval))) {
          // the opera preload cache can only be cleared once we start
          if (window.opera) {
            var link,
                element,
                operaCache=curSketch.imageCache.operaCache;
            for (link in operaCache) {
              if(operaCache.hasOwnProperty(link)) {
                element = operaCache[link];
                if (element !== null) {
                  document.body.removeChild(element);
                }
                delete(operaCache[link]);
              }
            }
          }

          curSketch.attach(processing, defaultScope);

          // pass a reference to the p instance for this sketch.
          curSketch.onLoad(processing);

          // Run void setup()
          if (processing.setup) {
            processing.setup();
            // if any transforms were performed in setup reset to identity matrix
            // so draw loop is unpolluted
            processing.resetMatrix();
            curSketch.onSetup();
          }

          // some pixels can be cached, flushing
          resetContext();

          if (processing.draw) {
            if (!doLoop) {
              processing.redraw();
            } else {
              processing.loop();
            }
          }
        } else {
          window.setTimeout(function() { executeSketch(processing); }, retryInterval);
        }
      };

      // Only store an instance of non-createGraphics instances.
      addInstance(this);

      // The parser adds custom methods to the processing context
      // this renames p to processing so these methods will run
      executeSketch(p);
    } else {
      // No executable sketch was specified
      // or called via createGraphics
      curSketch = new Processing.Sketch();

      wireDimensionalFunctions();

      // Hack to make PGraphics work again after splitting size()
      p.size = function(w, h, render) {
        if (render && render === PConstants.WEBGL) {
          wireDimensionalFunctions('3D');
        } else {
          wireDimensionalFunctions('2D');
        }

        p.size(w, h, render);
      };
    }
  };

  // Place-holder for overridable debugging function
  Processing.debug = (function() {
    if ("console" in window) {
      return function(msg) {
        window.console.log('Processing.js: ' + msg);
      };
    }
    return noop;
  }());

  // bind prototype
  Processing.prototype = defaultScope;

  /**
   * instance store and lookup
   */
  Processing.instances = processingInstances;
  Processing.getInstanceById = function(name) {
    return processingInstances[processingInstanceIds[name]];
  };

  // Unsupported Processing File and I/O operations.
  (function(Processing) {
    var unsupportedP5 = ("open() createOutput() createInput() BufferedReader selectFolder() " +
                         "dataPath() createWriter() selectOutput() beginRecord() " +
                         "saveStream() endRecord() selectInput() saveBytes() createReader() " +
                         "beginRaw() endRaw() PrintWriter delay()").split(" "),
        count = unsupportedP5.length,
        prettyName,
        p5Name;

    function createUnsupportedFunc(n) {
      return function() {
        throw "Processing.js does not support " + n + ".";
      };
    }

    while (count--) {
      prettyName = unsupportedP5[count];
      p5Name = prettyName.replace("()", "");
      Processing[p5Name] = createUnsupportedFunc(prettyName);
    }
  }(defaultScope));

  // we're done. Return our object.
  return Processing;
};
