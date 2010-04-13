/*

    P R O C E S S I N G . J S - 0 . 8
    a port of the Processing visualization language
    
    License       : MIT 
    Developer     : John Resig: http://ejohn.org
    Web Site      : http://processingjs.org  
    Java Version  : http://processing.org
    Github Repo.  : http://github.com/jeresig/processing-js
    Bug Tracking  : http://processing-js.lighthouseapp.com
    Mozilla POW!  : http://wiki.Mozilla.org/Education/Projects/ProcessingForTheWeb
    Maintained by : Seneca: http://zenit.senecac.on.ca/wiki/index.php/Processing.js
                    Hyper-Metrix: http://hyper-metrix.com/#Processing
                    BuildingSky: http://weare.buildingsky.net/pages/processing-js
  
 */

(function() {

  this.Processing = function Processing(aElement, aCode) {
    // Get the DOM element if string was passed
    if (typeof aElement === "string") {
      aElement = document.getElementById(aElement);
    }

    // The problem: if the HTML canvas dimensions differ from the
    // dimensions specified in the size() call in the sketch, for
    // 3D sketches, browsers will either not render or render the
    // scene incorrectly. To fix this, we need to adjust the attributes
    // of the canvas width and height.
    // this regex needs to be cleaned up a bit
    var r = "" + aCode.match(/size\s*\((?:.+),(?:.+),\s*(OPENGL|P3D)\s*\)\s*;/);
    var dimensions = r.match(/[0-9]+/g);

    if (dimensions) {
      var sketchWidth = parseInt(dimensions[0], 10);
      var sketchHeight = parseInt(dimensions[1], 10);

      // only adjust the attributes if they differ
      if (aElement.width !== sketchWidth || aElement.height !== sketchHeight) {
        aElement.setAttribute("width", sketchWidth);
        aElement.setAttribute("height", sketchHeight);
      }
    }

    // Build an Processing functions and env. vars into 'p'  
    var p = Processing.build(aElement);

    // Send aCode Processing syntax to be converted to JavaScript
    if (aCode) {
      p.init(aCode);
    }

    return p;
  };

  // Share lib space
  Processing.lib = {};

  // IE Unfriendly AJAX Method
  var ajax = function(url) {
    var AJAX = new window.XMLHttpRequest();
    if (AJAX) {
      AJAX.open("GET", url + "?t=" + new Date().getTime(), false);
      AJAX.send(null);
      return AJAX.responseText;
    } else {
      return false;
    }
  };

  // Automatic Initialization Method
  var init = function() {
    var canvas = document.getElementsByTagName('canvas');

    for (var i = 0, l = canvas.length; i < l; i++) {
      // Get data-src instead of datasrc
      var datasrc = canvas[i].getAttribute('data-src');
      if (datasrc === null) {
        // Temporary fallback for datasrc
        datasrc = canvas[i].getAttribute('datasrc');
      }
      if (datasrc) {
        // The problem: if the HTML canvas dimensions differ from the
        // dimensions specified in the size() call in the sketch, for
        // 3D sketches, browsers will either not render or render the
        // scene incorrectly. To fix this, we need to adjust the attributes
        // of the canvas width and height.
        // Get the source, we'll need to find what the user has used in size()
        var sketchSource = ajax(datasrc);
        // get the dimensions
        // this regex needs to be cleaned up a bit
        var r = "" + sketchSource.match(/size\s*\((?:.+),(?:.+),\s*(OPENGL|P3D)\s*\)\s*;/);
        var dimensions = r.match(/[0-9]+/g);

        if (dimensions) {
          var sketchWidth = parseInt(dimensions[0], 10);
          var sketchHeight = parseInt(dimensions[1], 10);

          // only adjust the attributes if they differ
          if (canvas[i].width !== sketchWidth || canvas[i].height !== sketchHeight) {
            canvas[i].setAttribute("width", sketchWidth);
            canvas[i].setAttribute("height", sketchHeight);
          }
        }
        Processing(canvas[i], sketchSource);
      }
    }
  };

  // Wrapper to easily deal with array names changes.
  var newWebGLArray = function(data) {
    return new WebGLFloatArray(data);
  };

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

  var programObject3D;
  var programObject2D;

  // Vertices are specified in a counter-clockwise order
  // triangles are in this order: back, front, right, bottom, left, top
  var boxVerts = [0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5,
                     -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5,
                     -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5,
                      0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5,
                      0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5,
                     -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5,
                     -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5,
                     -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5,
                     -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5];

  var boxNorms = [0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
                      0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
                      1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
                      0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
                      -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
                      0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0];

  var boxOutlineVerts = [0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5,
                            -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5,
                             0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5,
                            -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5,
                             0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5,
                            -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5];

  var boxBuffer;
  var boxNormBuffer;
  var boxOutlineBuffer;

  var sphereBuffer;

  var lineBuffer;

  var pointBuffer;

  // Vertex shader for points and lines
  var vertexShaderSource2D = "attribute vec3 Vertex;" + "uniform vec4 color;" +

  "uniform mat4 model;" + "uniform mat4 view;" + "uniform mat4 projection;" +

  "void main(void) {" + "  gl_FrontColor = color;" + "  gl_Position = projection * view * model * vec4(Vertex, 1.0);" + "}";

  var fragmentShaderSource2D = "void main(void){" + "  gl_FragColor = gl_Color;" + "}";

  // Vertex shader for boxes and spheres
  var vertexShaderSource3D = "attribute vec3 Vertex;" + "attribute vec3 Normal;" +

  "uniform vec4 color;" +

  "uniform bool usingMat;" + "uniform vec3 specular;" + "uniform vec3 mat_emissive;" + "uniform vec3 mat_ambient;" + "uniform vec3 mat_specular;" + "uniform float shininess;" +

  "uniform mat4 model;" + "uniform mat4 view;" + "uniform mat4 projection;" + "uniform mat4 normalTransform;" +

  "uniform int lightCount;" + "uniform vec3 falloff;" +

  "struct Light {" + "  bool dummy;" + "   int type;" + "   vec3 color;" + "   vec3 position;" + "  vec3 direction;" + "  float angle;" + "  vec3 halfVector;" + "  float concentration;" + "};" + "uniform Light lights[8];" +

  "void AmbientLight( inout vec3 totalAmbient, in vec3 ecPos, in Light light ) {" +
  // Get the vector from the light to the vertex
  // Get the distance from the current vector to the light position
  "  float d = length( light.position - ecPos );" + "  float attenuation = 1.0 / ( falloff[0] + ( falloff[1] * d ) + ( falloff[2] * d * d ));" + "  totalAmbient += light.color * attenuation;" + "}" +

  "void DirectionalLight( inout vec3 col, in vec3 ecPos, inout vec3 spec, in vec3 vertNormal, in Light light ) {" + "  float powerfactor = 0.0;" + "  float nDotVP = max(0.0, dot( vertNormal, light.position ));" + "  float nDotVH = max(0.0, dot( vertNormal, normalize( light.position-ecPos )));" +

  "  if( nDotVP != 0.0 ){" + "    powerfactor = pow( nDotVH, shininess );" + "  }" +

  "  col += light.color * nDotVP;" + "  spec += specular * powerfactor;" + "}" +

  "void PointLight( inout vec3 col, inout vec3 spec, in vec3 vertNormal, in vec3 ecPos, in vec3 eye, in Light light ) {" + "  float powerfactor;" +

  // Get the vector from the light to the vertex
  "   vec3 VP = light.position - ecPos;" +

  // Get the distance from the current vector to the light position
  "  float d = length( VP ); " +

  // Normalize the light ray so it can be used in the dot product operation.
  "  VP = normalize( VP );" +

  "  float attenuation = 1.0 / ( falloff[0] + ( falloff[1] * d ) + ( falloff[2] * d * d ));" +

  "  float nDotVP = max( 0.0, dot( vertNormal, VP ));" + "  vec3 halfVector = normalize( VP + eye );" + "  float nDotHV = max( 0.0, dot( vertNormal, halfVector ));" +

  "  if( nDotVP == 0.0) {" + "    powerfactor = 0.0;" + "  }" + "  else{" + "    powerfactor = pow( nDotHV, shininess );" + "  }" +

  "  spec += specular * powerfactor * attenuation;" + "  col += light.color * nDotVP * attenuation;" + "}" +

  /*
  */
  "void SpotLight( inout vec3 col, inout vec3 spec, in vec3 vertNormal, in vec3 ecPos, in vec3 eye, in Light light ) {" + "  float spotAttenuation;" + "  float powerfactor;" +

  // calculate the vector from the current vertex to the light.
  "  vec3 VP = light.position - ecPos; " + "  vec3 ldir = normalize( light.direction );" +

  // get the distance from the spotlight and the vertex
  "  float d = length( VP );" + "  VP = normalize( VP );" +

  "  float attenuation = 1.0 / ( falloff[0] + ( falloff[1] * d ) + ( falloff[2] * d * d ) );" +

  // dot product of the vector from vertex to light and light direction.
  "  float spotDot = dot( VP, ldir );" +

  // if the vertex falls inside the cone
  "  if( spotDot < cos( light.angle ) ) {" + "    spotAttenuation = pow( spotDot, light.concentration );" + "  }" + "  else{" + "    spotAttenuation = 1.0;" + "  }" + "  attenuation *= spotAttenuation;" +

  "  float nDotVP = max( 0.0, dot( vertNormal, VP ));" + "  vec3 halfVector = normalize( VP + eye );" + "  float nDotHV = max( 0.0, dot( vertNormal, halfVector ));" +

  "  if( nDotVP == 0.0 ) {" + "    powerfactor = 0.0;" + "  }" + "  else {" + "    powerfactor = pow( nDotHV, shininess );" + "  }" +

  "  spec += specular * powerfactor * attenuation;" + "  col += light.color * nDotVP * attenuation;" + "}" +

  "void main(void) {" + "  vec3 finalAmbient = vec3( 0.0, 0.0, 0.0 );" + "  vec3 finalDiffuse = vec3( 0.0, 0.0, 0.0 );" + "  vec3 finalSpecular = vec3( 0.0, 0.0, 0.0 );" +

  "  vec3 norm = vec3( normalTransform * vec4( Normal, 0.0 ) );" +

  "  vec4 ecPos4 = view * model * vec4(Vertex,1.0);" + "  vec3 ecPos = (vec3(ecPos4))/ecPos4.w;" + "  vec3 eye = vec3( 0.0, 0.0, 1.0 );" +

  // If there were no lights this draw call, just use the 
  // assigned fill color of the shape and the specular value
  "  if( lightCount == 0 ) {" + "    gl_FrontColor = color + vec4(mat_specular,1.0);" + "  }" + "  else {" + "    for( int i = 0; i < lightCount; i++ ) {" + "      if( lights[i].type == 0 ) {" + "        AmbientLight( finalAmbient, ecPos, lights[i] );" + "      }" + "      else if( lights[i].type == 1 ) {" + "        DirectionalLight( finalDiffuse,ecPos, finalSpecular, norm, lights[i] );" + "      }" + "      else if( lights[i].type == 2 ) {" + "        PointLight( finalDiffuse, finalSpecular, norm, ecPos, eye, lights[i] );" + "      }" + "      else if( lights[i].type == 3 ) {" + "        SpotLight( finalDiffuse, finalSpecular, norm, ecPos, eye, lights[i] );" + "      }" + "    }" +

  "   if( usingMat == false ) {" + "    gl_FrontColor = vec4(  " + "      vec3(color) * finalAmbient +" + "      vec3(color) * finalDiffuse +" + "      vec3(color) * finalSpecular," + "      color[3] );" + "   }" + "   else{" + "     gl_FrontColor = vec4( " + "       mat_emissive + " + "       (vec3(color) * mat_ambient * finalAmbient) + " + "       (vec3(color) * finalDiffuse) + " + "       (mat_specular * finalSpecular), " + "       color[3] );" + "    }" + "  }" + "  gl_Position = projection * view * model * vec4( Vertex, 1.0 );" + "}";

  var fragmentShaderSource3D = "void main(void){" + "  gl_FragColor = gl_Color;" + "}";

  document.addEventListener('DOMContentLoaded', function() {
    init();
  },
  false);

  // Place-holder for debugging function
  Processing.debug = function(e) {};

  // Parse Processing (Java-like) syntax to JavaScript syntax with Regex
  Processing.parse = function parse(aCode, p) {

    // Force characters-as-bytes to work.
    //aCode = aCode.replace(/('(.){1}')/g, "$1.charCodeAt(0)");
    aCode = aCode.replace(/'.{1}'/g, function(all) {
      return "(new Char(" + all + "))";
    });

    // Parse out @pjs directive, if any.
    p.pjs = {
      imageCache: {
        pending: 0
      }
    }; // by default we have an empty imageCache, no more.
    var dm = /\/\*\s*@pjs\s+((?:[^\*]|\*+[^\*\/])*)\*\//g.exec(aCode);
    if (dm && dm.length === 2) {
      var directives = dm.splice(1, 2)[0].replace('\n', '').replace('\r', '').split(';');

      // We'll L/RTrim, and also remove any surrounding double quotes (e.g., just take string contents)
      var clean = function(s) {
        return s.replace(/^\s*\"?/, '').replace(/\"?\s*$/, '');
      };

      for (var i = 0, dl = directives.length; i < dl; i++) {
        var pair = directives[i].split('=');
        if (pair && pair.length === 2) {
          var key = clean(pair[0]);
          var value = clean(pair[1]);

          // A few directives require work beyond storying key/value pairings
          if (key === "preload") {
            var list = value.split(',');
            // All pre-loaded images will get put in imageCache, keyed on filename
            for (var j = 0, ll = list.length; j < ll; j++) {
              var imageName = clean(list[j]);
              var img = new Image();
              img.onload = (function() {
                return function() {
                  p.pjs.imageCache.pending--;
                };
              }());
              p.pjs.imageCache.pending++;
              p.pjs.imageCache[imageName] = img;
              img.src = imageName;
            }
          } else if (key === "opaque") {
            p.canvas.mozOpaque = value === "true";
          } else {
            p.pjs[key] = value;
          }
        }
      }
      aCode = aCode.replace(dm[0], '');
    }

    // Saves all strings into an array
    // masks all strings into <STRING n>
    // to be replaced with the array strings after parsing is finished
    var strings = [];
    aCode = aCode.replace(/(["'])(\\\1|.)*?(\1)/g, function(all) {
      strings.push(all);
      return "<STRING " + (strings.length - 1) + ">";
    });

    // Windows newlines cause problems: 
    aCode = aCode.replace(/\r\n?/g, "\n");

    // Remove end-of-line comments
    aCode = aCode.replace(/\/\/.*\n/g, "\n");

    // Weird parsing errors with %
    aCode = aCode.replace(/([^\s])%([^\s])/g, "$1 % $2");

    // Since frameRate() and frameRate are different things,
    // we need to differentiate them somehow. So when we parse
    // the Processing.js source, replace frameRate so it isn't
    // confused with frameRate().
    aCode = aCode.replace(/(\s*=\s*|\(*\s*)frameRate(\s*\)+?|\s*;)/, "$1p.FRAME_RATE$2");

    // Simple convert a function-like thing to function
    aCode = aCode.replace(/(?:static )?(\w+(?:\[\])* )(\w+)\s*(\([^\)]*\)\s*\{)/g, function(all, type, name, args) {
      if (name === "if" || name === "for" || name === "while") {
        return all;
      } else {
        return "processing." + name + " = function " + name + args;
      }
    });

    // Attach import() to p{} bypassing JS command, allowing for extrernal library loading
    //aCode = aCode.replace(/import \(|import\(/g, "p.Import(");
    // Delete import statements, ie. import processing.video.*;
    // https://processing-js.lighthouseapp.com/projects/41284/tickets/235-fix-parsing-of-java-import-statement
    aCode = aCode.replace(/import\s+(.+);/g, "");

    //replace  catch (IOException e) to catch (e)
    aCode = aCode.replace(/catch\s*\(\W*\w*\s+(\w*)\W*\)/g, "catch ($1)");

    //delete  the multiple catch block
    var catchBlock = /(catch[^\}]*\})\W*catch[^\}]*\}/;

    while (catchBlock.test(aCode)) {
      aCode = aCode.replace(new RegExp(catchBlock), "$1");
    }

    Error.prototype.printStackTrace = function() {
      this.toString();
    };

    // Force .length() to be .length
    aCode = aCode.replace(/\.length\(\)/g, ".length");

    // foo( int foo, float bar )
    aCode = aCode.replace(/([\(,]\s*)(\w+)((?:\[\])+| )\s*(\w+\s*[\),])/g, "$1$4");
    aCode = aCode.replace(/([\(,]\s*)(\w+)((?:\[\])+| )\s*(\w+\s*[\),])/g, "$1$4");

    // float[] foo = new float[5];
    aCode = aCode.replace(/new\s+(\w+)\s*((?:\[(?:[^\]]*)\])+)\s*(\{[^;]*\}\s*;)*/g, function(all, name, args, initVars) {
      if (initVars) {
        return initVars;
      } else {
        return "new ArrayList(" + args.replace(/\[\]/g, "[0]").slice(1, -1).split("][").join(", ") + ");";
      }
    });

    // What does this do? This does the same thing as "Fix Array[] foo = {...} to [...]" below
    aCode = aCode.replace(/(?:static )?\w+\[\]\s*(\w+)\[?\]?\s*=\s*\{.*?\};/g, function(all) {
      return all.replace(/\{/g, "[").replace(/\}/g, "]");
    });

    // int|float foo;
    var intFloat = /(\s*(?:int|float)\s+(?!\[\])*(?:\s*|[^\(;]*?,\s*))([a-zA-Z]\w*)\s*(,|;)/i;
    while (intFloat.test(aCode)) {
      aCode = (function() {
        return aCode.replace(new RegExp(intFloat), function(all, type, name, sep) {
          return type + " " + name + " = 0" + sep;
        });
      }());
    }

    // float foo = 5;
    aCode = aCode.replace(/(?:static\s+)?(?:final\s+)?(\w+)((?:\[\s*\])+|\s)\s*(\w+)\[?\]?(\s*[=,;])/g, function(all, type, arr, name, sep) {
      if (type === "return" || type === "else") {
        return all;
      } else {
        return "var " + name + sep;
      }
    });

    // Fix Array[] foo = {...} to [...]
    aCode = aCode.replace(/\=\s*\{((.|\s)*?\};)/g, function(all, data) {
      return "= [" + data.replace(/\{/g, "[").replace(/\}/g, "]");
    });

    // super() is a reserved word
    aCode = aCode.replace(/super\(/g, "superMethod(");

    // implements Int1, Int2 
    aCode = aCode.replace(/implements\s+(\w+\s*(,\s*\w+\s*)*) \{/g, function(all, interfaces) {
      var names = interfaces.replace(/\s+/g, "").split(",");
      return "{ var __psj_interfaces = new ArrayList([\"" + names.join("\", \"") + "\"]);";
    });

    var classes = ["int", "float", "boolean", "String", "byte", "double", "long", "ArrayList"];

    var classReplace = function(all, name, extend, vars, last) {
      classes.push(name);

      var staticVar = "";

      vars = vars.replace(/final\s+var\s+(\w+\s*=\s*.*?;)/g, function(all, setting) {
        staticVar += " " + name + "." + setting;
        return "";
      });


      // Move arguments up from constructor and wrap contents with
      // a with(this), and unwrap constructor
      return "function " + name + "() {with(this){\n " + (extend ? "var __self=this;function superMethod(){extendClass(__self,arguments," + extend + ");}\n" : "") +
      // Replace var foo = 0; with this.foo = 0;
      // and force var foo; to become this.foo = null;
      vars.replace(/\s*,\s*/g, ";\n  this.").replace(/\b(var |final |public )+\s*/g, "this.").replace(/\b(var |final |public )+\s*/g, "this.").replace(/this\.(\w+);/g, "this.$1 = null;") + (extend ? "extendClass(this, " + extend + ");\n" : "") + "<CLASS " + name + " " + staticVar + ">" + (typeof last === "string" ? last : name + "(");
    };

    var nextBrace = function(right) {
      var rest = right,
        position = 0,
        leftCount = 1,
        rightCount = 0;

      while (leftCount !== rightCount) {
        var nextLeft = rest.indexOf("{"),
          nextRight = rest.indexOf("}");

        if (nextLeft < nextRight && nextLeft !== -1) {
          leftCount++;
          rest = rest.slice(nextLeft + 1);
          position += nextLeft + 1;
        } else {
          rightCount++;
          rest = rest.slice(nextRight + 1);
          position += nextRight + 1;
        }
      }

      return right.slice(0, position - 1);
    };

    var matchClasses = /(?:public |abstract |static )*class (\w+)\s*(?:extends\s*(\w+)\s*)?\{\s*((?:.|\n)*?)\b\1\s*\(/g;
    var matchNoCon = /(?:public |abstract |static )*class (\w+)\s*(?:extends\s*(\w+)\s*)?\{\s*((?:.|\n)*?)(processing)/g;

    aCode = aCode.replace(matchClasses, classReplace);
    aCode = aCode.replace(matchNoCon, classReplace);

    var matchClass = /<CLASS (\w+) (.*?)>/,
      m;

    while ((m = aCode.match(matchClass))) {
      var left = RegExp.leftContext,
        allRest = RegExp.rightContext,
        rest = nextBrace(allRest),
        className = m[1],
        staticVars = m[2] || "";

      allRest = allRest.slice(rest.length + 1);

      rest = (function() {
        return rest.replace(new RegExp("\\b" + className + "\\(([^\\)]*?)\\)\\s*{", "g"), function(all, args) {
          args = args.split(/,\s*?/);

          if (args[0].match(/^\s*$/)) {
            args.shift();
          }

          var fn = "if ( arguments.length === " + args.length + " ) {\n";

          for (var i = 0; i < args.length; i++) {
            fn += " var " + args[i] + " = arguments[" + i + "];\n";
          }

          return fn;
        });
      }());

      // Fix class method names
      // this.collide = function() { ... }
      // and add closing } for with(this) ...
      rest = (function() {
        return rest.replace(/(?:public )?processing.\w+ = function (\w+)\((.*?)\)/g, function(all, name, args) {
          return "ADDMETHOD(this, '" + name + "', function(" + args + ")";
        });
      }());

      var matchMethod = /ADDMETHOD([\s\S]*?\{)/,
        mc, methods = "";

      while ((mc = rest.match(matchMethod))) {
        var prev = RegExp.leftContext,
          allNext = RegExp.rightContext,
          next = nextBrace(allNext);

        methods += "addMethod" + mc[1] + next + "});";

        rest = prev + allNext.slice(next.length + 1);
      }

      rest = methods + rest;

      aCode = left + rest + "\n}}" + staticVars + allRest;
    }

    // Do some tidying up, where necessary
    aCode = aCode.replace(/processing.\w+ = function addMethod/g, "addMethod");


    // Check if 3D context is invoked -- this is not the best way to do this.
    if (aCode.match(/size\((?:.+),(?:.+),\s*(OPENGL|P3D)\s*\);/)) {
      p.use3DContext = true;
    }

    // Handle (int) Casting
    aCode = aCode.replace(/\(int\)/g, "0|");

    // Remove Casting
    aCode = aCode.replace(new RegExp("\\((" + classes.join("|") + ")(\\[\\])*\\)", "g"), "");

    // Force numbers to exist //
    //aCode = aCode.replace(/([^.])(\w+)\s*\+=/g, "$1$2 = ($2||0) +");
    var toNumbers = function(str) {
      var ret = [];

      str.replace(/(..)/g, function(str) {
        ret.push(parseInt(str, 16));
      });

      return ret;
    };

    // Convert #aaaaaa into color
    aCode = aCode.replace(/#([a-f0-9]{6})/ig, function(m, hex) {
      var num = toNumbers(hex);
      return "defaultColor(" + num[0] + "," + num[1] + "," + num[2] + ")";
    });

    // Convert 3.0f to just 3.0
    aCode = aCode.replace(/(\d+)f/g, "$1");

    // replaces all masked strings from <STRING n> to the appropriate string contained in the strings array
    for (var n = 0; n < strings.length; n++) {
      aCode = (function() {
        return aCode.replace(new RegExp("(.*)(<STRING " + n + ">)(.*)", "g"), function(all, quoteStart, match, quoteEnd) {
          var returnString = all,
            notString = true,
            quoteType = "",
            escape = false;

          for (var x = 0; x < quoteStart.length; x++) {
            if (notString) {
              if (quoteStart.charAt(x) === "\"" || quoteStart.charAt(x) === "'") {
                quoteType = quoteStart.charAt(x);
                notString = false;
              }
            } else {
              if (!escape) {
                if (quoteStart.charAt(x) === "\\") {
                  escape = true;
                } else if (quoteStart.charAt(x) === quoteType) {
                  notString = true;
                  quoteType = "";
                }
              } else {
                escape = false;
              }
            }
          }

          if (notString) { // Match is not inside a string
            returnString = quoteStart + strings[n] + quoteEnd;
          }

          return returnString;
        });
      }());
    }

    return aCode;
  };

  function imageModeCorner(x, y, w, h, whAreSizes) {
    return {
      x: x,
      y: y,
      w: w,
      h: h
    };
  }

  function imageModeCorners(x, y, w, h, whAreSizes) {
    return {
      x: x,
      y: y,
      w: whAreSizes ? w : w - x,
      h: whAreSizes ? h : h - y
    };
  }

  function imageModeCenter(x, y, w, h, whAreSizes) {
    return {
      x: x - w / 2,
      y: y - h / 2,
      w: w,
      h: h
    };
  }

  // Attach Processing functions to 'p'
  Processing.build = function buildProcessing(curElement) {
    // Create the 'p' object
    var p = {};
    var curContext;
    p.use3DContext = false; // default '2d' canvas context
    p.canvas = curElement;

    // Set Processing defaults / environment variables
    p.name = 'Processing.js Instance';
    p.PI = Math.PI;
    p.TWO_PI = 2 * p.PI;
    p.HALF_PI = p.PI / 2;
    p.SINCOS_LENGTH = parseInt(360 / 0.5, 10);
    p.MAX_FLOAT = 3.4028235e+38;
    p.MIN_FLOAT = -3.4028235e+38;
    p.MAX_INT = 2147483647;
    p.MIN_INT = -2147483648;
    p.CORNER = 0;
    p.RADIUS = 1;
    p.CENTER_RADIUS = 1;
    p.CENTER = 2;
    p.POLYGON = 2;
    p.QUADS = 5;
    p.TRIANGLES = 6;
    p.POINTS = 7;
    p.LINES = 8;
    p.TRIANGLE_STRIP = 9;
    p.TRIANGLE_FAN = 4;
    p.QUAD_STRIP = 3;
    p.CORNERS = 10;
    p.CLOSE = true;
    p.RGB = 1;
    p.ARGB = 2;
    p.HSB = 3;
    p.ALPHA = 4;
    p.CMYK = 5;
    p.OPENGL = 'OPENGL';
    p.P3D = 'P3D';
    p.FRAME_RATE = 0;
    p.focused = true;
    p.ARROW = 'default';
    p.CROSS = 'crosshair';
    p.HAND = 'pointer';
    p.MOVE = 'move';
    p.TEXT = 'text';
    p.WAIT = 'wait';
    p.NOCURSOR = "url('data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='), auto";
    p.ALPHA_MASK = 0xff000000;
    p.RED_MASK = 0x00ff0000;
    p.GREEN_MASK = 0x0000ff00;
    p.BLUE_MASK = 0x000000ff;
    p.REPLACE = 0;
    p.BLEND = 1 << 0;
    p.ADD = 1 << 1;
    p.SUBTRACT = 1 << 2;
    p.LIGHTEST = 1 << 3;
    p.DARKEST = 1 << 4;
    p.DIFFERENCE = 1 << 5;
    p.EXCLUSION = 1 << 6;
    p.MULTIPLY = 1 << 7;
    p.SCREEN = 1 << 8;
    p.OVERLAY = 1 << 9;
    p.HARD_LIGHT = 1 << 10;
    p.SOFT_LIGHT = 1 << 11;
    p.DODGE = 1 << 12;
    p.BURN = 1 << 13;
    p.PRECISIONB = 15; // fixed point precision is limited to 15 bits!! 
    p.PRECISIONF = 1 << p.PRECISIONB;
    p.PREC_MAXVAL = p.PRECISIONF - 1;
    p.PREC_ALPHA_SHIFT = 24 - p.PRECISIONB;
    p.PREC_RED_SHIFT = 16 - p.PRECISIONB;
    p.ROUND = 'round'; // Used by both cap and join.
    p.SQUARE = 'butt'; // Used by cap.
    p.PROJECT = 'square'; // Used by cap.
    p.MITER = 'miter'; // Used by join.
    p.BEVEL = 'bevel'; // Used by join.
    p.CENTER = 88888880;
    p.NORMAL_MODE_AUTO = 0;
    p.NORMAL_MODE_SHAPE = 1;
    p.NORMAL_MODE_VERTEX = 2;
    p.MAX_LIGHTS = 8;

    // Key Constants
    // both key and keyCode will be equal to these values
    p.BACKSPACE = 8;
    p.TAB = 9;
    p.ENTER = 10;
    p.RETURN = 13;
    p.ESC = 27;
    p.DELETE = 127;

    p.CODED = 0xffff;
    // key will be CODED and keyCode will be this value
    p.SHIFT = 16;
    p.CONTROL = 17;
    p.ALT = 18;
    p.UP = 38;
    p.RIGHT = 39;
    p.DOWN = 40;
    p.LEFT = 37;

    var codedKeys = [p.SHIFT, p.CONTROL, p.ALT, p.UP, p.RIGHT, p.DOWN, p.LEFT];

    // "Private" variables used to maintain state
    var online = true,
      doFill = true,
      fillStyle = "rgba( 255, 255, 255, 1 )",
      doStroke = true,
      strokeStyle = "rgba( 204, 204, 204, 1 )",
      lineWidth = 1,
      loopStarted = false,
      hasBackground = false,
      doLoop = true,
      looping = 0,
      curRectMode = p.CORNER,
      curEllipseMode = p.CENTER,
      imageModeConvert = imageModeCorner,
      normalX = 0,
      normalY = 0,
      normalZ = 0,
      normalMode = p.NORMAL_MODE_AUTO,
      inSetup = false,
      inDraw = false,
      curBackground = "rgba( 204, 204, 204, 1 )",
      curFrameRate = 60,
      curCursor = p.ARROW,
      oldCursor = curElement.style.cursor,
      curMsPerFrame = 1,
      curShape = p.POLYGON,
      curShapeCount = 0,
      curvePoints = [],
      curTightness = 0,
      curveDetail = 20,
      curveInited = false,
      opacityRange = 255,
      redRange = 255,
      greenRange = 255,
      blueRange = 255,
      pathOpen = false,
      mousePressed = false,
      mouseDragging = false,
      keyPressed = false,
      curColorMode = p.RGB,
      curTint = function() {},
      curTextSize = 12,
      curTextFont = "Arial",
      getLoaded = false,
      start = new Date().getTime(),
      timeSinceLastFPS = start,
      framesSinceLastFPS = 0,
      lastTextPos = [0, 0, 0],
      curveBasisMatrix, curveToBezierMatrix, curveDrawMatrix, bezierBasisInverse, bezierBasisMatrix;

    // User can only have MAX_LIGHTS lights
    var lightCount = 0;

    //sphere stuff
    var sphereDetailV = 0,
      sphereDetailU = 0,
      sphereX = [],
      sphereY = [],
      sphereZ = [],
      sinLUT = new Array(p.SINCOS_LENGTH),
      cosLUT = new Array(p.SINCOS_LENGTH),
      sphereVerts, sphereNorms;

    // Camera defaults and settings
    var cam, cameraInv, forwardTransform, reverseTransform, modelView, modelViewInv, userMatrixStack, inverseCopy, projection, manipulatingCamera = false,
      frustumMode = false,
      cameraFOV = 60 * (Math.PI / 180),
      cameraX = curElement.width / 2,
      cameraY = curElement.height / 2,
      cameraZ = cameraY / Math.tan(cameraFOV / 2),
      cameraNear = cameraZ / 10,
      cameraFar = cameraZ * 10,
      cameraAspect = curElement.width / curElement.height;

    var firstX, firstY, secondX, secondY, prevX, prevY;

    // Stores states for pushStyle() and popStyle().
    var styleArray = new Array(0);

    // Glyph path storage for textFonts
    p.glyphTable = {};

    // Global vars for tracking mouse position
    p.pmouseX = 0;
    p.pmouseY = 0;
    p.mouseX = 0;
    p.mouseY = 0;
    p.mouseButton = 0;
    p.mouseDown = false;
    p.mouseScroll = 0;

    // Undefined event handlers to be replaced by user when needed
    p.mouseClicked = undefined;
    p.mouseDragged = undefined;
    p.mouseMoved = undefined;
    p.mousePressed = undefined;
    p.mouseReleased = undefined;
    p.mouseScrolled = undefined;
    p.keyPressed = undefined;
    p.keyReleased = undefined;
    p.draw = undefined;
    p.setup = undefined;

    // The height/width of the canvas
    p.width = curElement.width - 0;
    p.height = curElement.height - 0;

    // The current animation frame
    p.frameCount = 0;

    ////////////////////////////////////////////////////////////////////////////
    // Char handling
    ////////////////////////////////////////////////////////////////////////////    
    var charMap = {};

    var Char = function Char(chr) {
      if (typeof chr === 'string' && chr.length === 1) {
        this.code = chr.charCodeAt(0);
      } else {
        this.code = NaN;
      }

      return (typeof charMap[this.code] === 'undefined') ? charMap[this.code] = this : charMap[this.code];
    };

    Char.prototype.toString = function() {
      return String.fromCharCode(this.code);
    };

    Char.prototype.valueOf = function() {
      return this.code;
    };

    ////////////////////////////////////////////////////////////////////////////
    // PVector
    ////////////////////////////////////////////////////////////////////////////
    var PVector = function(x, y, z) {
      this.x = x || 0;
      this.y = y || 0;
      this.z = z || 0;
    },
      createPVectorMethod = function(method) {
      return function(v1, v2) {
        var v = v1.get();
        v[method](v2);
        return v;
      };
    },
      createSimplePVectorMethod = function(method) {
      return function(v1, v2) {
        return v1[method](v2);
      };
    },
      simplePVMethods = "dist dot cross".split(" "),
      method = simplePVMethods.length;

    PVector.angleBetween = function(v1, v2) {
      return Math.acos(v1.dot(v2) / (v1.mag() * v2.mag()));
    };

    // Common vector operations for PVector
    PVector.prototype = {
      set: function(v, y, z) {
        if (arguments.length === 1) {
          this.set(v.x || v[0], v.y || v[1], v.z || v[2]);
        } else {
          this.x = v;
          this.y = y;
          this.z = z;
        }
      },
      get: function() {
        return new PVector(this.x, this.y, this.z);
      },
      mag: function() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
      },
      add: function(v, y, z) {
        if (arguments.length === 3) {
          this.x += v;
          this.y += y;
          this.z += z;
        } else if (arguments.length === 1) {
          this.x += v.x;
          this.y += v.y;
          this.z += v.z;
        }
      },
      sub: function(v, y, z) {
        if (arguments.length === 3) {
          this.x -= v;
          this.y -= y;
          this.z -= z;
        } else if (arguments.length === 1) {
          this.x -= v.x;
          this.y -= v.y;
          this.z -= v.z;
        }
      },
      mult: function(v) {
        if (typeof v === 'number') {
          this.x *= v;
          this.y *= v;
          this.z *= v;
        } else if (typeof v === 'object') {
          this.x *= v.x;
          this.y *= v.y;
          this.z *= v.z;
        }
      },
      div: function(v) {
        if (typeof v === 'number') {
          this.x /= v;
          this.y /= v;
          this.z /= v;
        } else if (typeof v === 'object') {
          this.x /= v.x;
          this.y /= v.y;
          this.z /= v.z;
        }
      },
      dist: function(v) {
        var dx = this.x - v.x,
          dy = this.y - v.y,
          dz = this.z - v.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
      },
      dot: function(v, y, z) {
        var num;
        if (arguments.length === 3) {
          num = this.x * v + this.y * y + this.z * z;
        } else if (arguments.length === 1) {
          num = this.x * v.x + this.y * v.y + this.z * v.z;
        }
        return num;
      },
      cross: function(v) {
        var
        crossX = this.y * v.z - v.y * this.z,
          crossY = this.z * v.x - v.z * this.x,
          crossZ = this.x * v.y - v.x * this.y;
        return new PVector(crossX, crossY, crossZ);
      },
      normalize: function() {
        var m = this.mag();
        if (m > 0) {
          this.div(m);
        }
      },
      limit: function(high) {
        if (this.mag() > high) {
          this.normalize();
          this.mult(high);
        }
      },
      heading2D: function() {
        var angle = Math.atan2(-this.y, this.x);
        return -angle;
      },
      toString: function() {
        return "[" + this.x + ", " + this.y + ", " + this.z + "]";
      },
      array: function() {
        return [this.x, this.y, this.z];
      }
    };

    while (method--) {
      PVector[simplePVMethods[method]] = createSimplePVectorMethod(simplePVMethods[method]);
    }

    for (method in PVector.prototype) {
      if (PVector.prototype.hasOwnProperty(method) && !PVector.hasOwnProperty(method)) {
        PVector[method] = createPVectorMethod(method);
      }
    }

    p.PVector = PVector;

    ////////////////////////////////////////////////////////////////////////////
    // 2D Matrix
    ////////////////////////////////////////////////////////////////////////////
    /*
      Helper function for printMatrix(). Finds the largest scalar
      in the matrix, then number of digits left of the decimal.
      Call from PMatrix2D and PMatrix3D's print() function.
    */
    var printMatrixHelper = function printMatrixHelper(elements) {
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

    var PMatrix2D = function() {
      if (arguments.length === 0) {
        this.reset();
      } else if (arguments.length === 1 && arguments[0] instanceof PMatrix2D) {
        this.set(arguments[0].array());
      } else if (arguments.length === 6) {
        this.set(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
      }
    };

    PMatrix2D.prototype = {
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
      get: function() {
        var outgoing = new PMatrix2D();
        outgoing.set(this.elements);
        return outgoing;
      },
      reset: function() {
        this.set([1, 0, 0, 0, 1, 0]);
      },
      // Returns a copy of the element values.
      array: function array() {
        return this.elements.slice();
      },
      translate: function(tx, ty) {
        this.elements[2] = tx * this.elements[0] + ty * this.elements[1] + this.elements[2];
        this.elements[5] = tx * this.elements[3] + ty * this.elements[4] + this.elements[5];
      },
      // Does nothing in Processing.
      transpose: function() {},
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
      multX: function(x, y) {
        return x * this.elements[0] + y * this.elements[1] + this.elements[2];
      },
      multY: function(x, y) {
        return x * this.elements[3] + y * this.elements[4] + this.elements[5];
      },
      skewX: function(angle) {
        this.apply(1, 0, 1, angle, 0, 0);
      },
      skewY: function(angle) {
        this.apply(1, 0, 1, 0, angle, 0);
      },
      apply: function() {
        if (arguments.length === 1 && arguments[0] instanceof PMatrix2D) {
          this.apply(arguments[0].array());
        } else if (arguments.length === 6) {
          var a = arguments;
          this.apply([a[0], a[1], a[2],
                                  a[3], a[4], a[5]]);
        } else if (arguments.length === 1 && arguments[0] instanceof Array) {
          var source = arguments[0];

          var result = [0, 0, this.elements[2],
                                    0, 0, this.elements[5]];
          var e = 0;
          for (var row = 0; row < 2; row++) {
            for (var col = 0; col < 3; col++, e++) {
              result[e] += this.elements[row * 3 + 0] * source[col + 0] + this.elements[row * 3 + 1] * source[col + 3];
            }
          }
          this.elements = result.slice();
        }
      },
      print: function() {
        var digits = printMatrixHelper(this.elements);

        var output = "";
        output += p.nfs(this.elements[0], digits, 4) + " " + p.nfs(this.elements[1], digits, 4) + " " + p.nfs(this.elements[2], digits, 4) + "\n";
        output += p.nfs(this.elements[3], digits, 4) + " " + p.nfs(this.elements[4], digits, 4) + " " + p.nfs(this.elements[5], digits, 4) + "\n\n";

        p.println(output);
      }
    };

    ////////////////////////////////////////////////////////////////////////////
    // PMatrix3D
    ////////////////////////////////////////////////////////////////////////////    
    var PMatrix3D = function PMatrix3D() {
      //When a matrix is created, it is set to an identity matrix
      this.reset();
    };

    PMatrix3D.prototype = {
      set: function() {
        if (arguments.length === 16) {
          var a = arguments;
          this.set([a[0], a[1], a[2], a[3],
                                a[4], a[5], a[6], a[7],
                                a[8], a[9], a[10], a[11],
                                a[12], a[13], a[14], a[15]]);
        } else if (arguments.length === 1 && arguments[0] instanceof PMatrix3D) {
          this.elements = arguments[0].array();
        } else if (arguments.length === 1 && arguments[0] instanceof Array) {
          this.elements = arguments[0].slice();
        }
      },
      get: function() {
        var outgoing = new PMatrix3D();
        outgoing.set(this.elements);
        return outgoing;
      },
      reset: function() {
        this.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
      },
      // Returns a copy of the element values.
      array: function array() {
        return this.elements.slice();
      },
      translate: function(tx, ty, tz) {
        if (typeof tz === 'undefined') {
          tx = 0;
        }

        this.elements[3] += tx * this.elements[0] + ty * this.elements[1] + tz * this.elements[2];
        this.elements[7] += tx * this.elements[4] + ty * this.elements[5] + tz * this.elements[6];
        this.elements[11] += tx * this.elements[8] + ty * this.elements[9] + tz * this.elements[10];
        this.elements[15] += tx * this.elements[12] + ty * this.elements[13] + tz * this.elements[14];
      },
      transpose: function() {
        var temp = this.elements.slice();
        this.elements[0] = temp[0];
        this.elements[1] = temp[4];
        this.elements[2] = temp[8];
        this.elements[3] = temp[12];
        this.elements[4] = temp[1];
        this.elements[5] = temp[5];
        this.elements[6] = temp[9];
        this.elements[7] = temp[13];
        this.elements[8] = temp[2];
        this.elements[9] = temp[6];
        this.elements[10] = temp[10];
        this.elements[11] = temp[14];
        this.elements[12] = temp[3];
        this.elements[13] = temp[7];
        this.elements[14] = temp[11];
        this.elements[15] = temp[15];
      },
      /*
        You must either pass in two PVectors or two arrays,
        don't mix between types. You may also omit a second
        argument and simply read the result from the return.
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

          if (!target || target.length !== 3 && target.length !== 4) {
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
      preApply: function() {
        if (arguments.length === 1 && arguments[0] instanceof PMatrix3D) {
          this.preApply(arguments[0].array());
        } else if (arguments.length === 16) {
          var a = arguments;
          this.preApply([a[0], a[1], a[2], a[3],
                                     a[4], a[5], a[6], a[7],
                                     a[8], a[9], a[10], a[11],
                                     a[12], a[13], a[14], a[15]]);
        } else if (arguments.length === 1 && arguments[0] instanceof Array) {
          var source = arguments[0];

          var result = [0, 0, 0, 0,
                                    0, 0, 0, 0,
                                    0, 0, 0, 0,
                                    0, 0, 0, 0];
          var e = 0;
          for (var row = 0; row < 4; row++) {
            for (var col = 0; col < 4; col++, e++) {
              result[e] += this.elements[col + 0] * source[row * 4 + 0] + this.elements[col + 4] * source[row * 4 + 1] + this.elements[col + 8] * source[row * 4 + 2] + this.elements[col + 12] * source[row * 4 + 3];
            }
          }
          this.elements = result.slice();
        }
      },
      apply: function() {
        if (arguments.length === 1 && arguments[0] instanceof PMatrix3D) {
          this.apply(arguments[0].array());
        } else if (arguments.length === 16) {
          var a = arguments;
          this.apply([a[0], a[1], a[2], a[3],
                                  a[4], a[5], a[6], a[7],
                                  a[8], a[9], a[10], a[11],
                                  a[12], a[13], a[14], a[15]]);
        } else if (arguments.length === 1 && arguments[0] instanceof Array) {
          var source = arguments[0];

          var result = [0, 0, 0, 0,
                                    0, 0, 0, 0,
                                    0, 0, 0, 0,
                                    0, 0, 0, 0];
          var e = 0;
          for (var row = 0; row < 4; row++) {
            for (var col = 0; col < 4; col++, e++) {
              result[e] += this.elements[row * 4 + 0] * source[col + 0] + this.elements[row * 4 + 1] * source[col + 4] + this.elements[row * 4 + 2] * source[col + 8] + this.elements[row * 4 + 3] * source[col + 12];
            }
          }
          this.elements = result.slice();
        }
      },
      rotate: function(angle, v0, v1, v2) {
        if (!v1) {
          this.rotateZ(angle);
        } else {
          // TODO should make sure this vector is normalized
          var c = p.cos(angle);
          var s = p.sin(angle);
          var t = 1.0 - c;

          this.apply((t * v0 * v0) + c, (t * v0 * v1) - (s * v2), (t * v0 * v2) + (s * v1), 0, (t * v0 * v1) + (s * v2), (t * v1 * v1) + c, (t * v1 * v2) - (s * v0), 0, (t * v0 * v2) - (s * v1), (t * v1 * v2) + (s * v0), (t * v2 * v2) + c, 0, 0, 0, 0, 1);
        }
      },
      invApply: function() {
        if (typeof inverseCopy === "undefined") {
          inverseCopy = new PMatrix3D();
        }
        var a = arguments;
        inverseCopy.set(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9], a[10], a[11], a[12], a[13], a[14], a[15]);

        if (!inverseCopy.invert()) {
          return false;
        }
        this.preApply(inverseCopy);
        return true;
      },
      rotateX: function(angle) {
        var c = p.cos(angle);
        var s = p.sin(angle);
        this.apply([1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1]);
      },

      rotateY: function(angle) {
        var c = p.cos(angle);
        var s = p.sin(angle);
        this.apply([c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1]);
      },
      rotateZ: function(angle) {
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        this.apply([c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
      },
      // Uniform scaling if only one value passed in
      scale: function(sx, sy, sz) {
        if (sx && !sy && !sz) {
          sy = sz = sx;
        } else if (sx && sy && !sz) {
          sz = 1;
        }

        if (sx && sy && sz) {
          this.elements[0] *= sx;
          this.elements[1] *= sy;
          this.elements[2] *= sz;
          this.elements[4] *= sx;
          this.elements[5] *= sy;
          this.elements[6] *= sz;
          this.elements[8] *= sx;
          this.elements[9] *= sy;
          this.elements[10] *= sz;
          this.elements[12] *= sx;
          this.elements[13] *= sy;
          this.elements[14] *= sz;
        }
      },
      skewX: function(angle) {
        var t = p.tan(angle);
        this.apply(1, t, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
      },
      skewY: function(angle) {
        var t = Math.tan(angle);
        this.apply(1, 0, 0, 0, t, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
      },
      multX: function(x, y, z, w) {
        if (!z) {
          return this.elements[0] * x + this.elements[1] * y + this.elements[3];
        } else if (!w) {
          return this.elements[0] * x + this.elements[1] * y + this.elements[2] * z + this.elements[3];
        } else {
          return this.elements[0] * x + this.elements[1] * y + this.elements[2] * z + this.elements[3] * w;
        }
      },
      multY: function(x, y, z, w) {
        if (!z) {
          return this.elements[4] * x + this.elements[5] * y + this.elements[7];
        } else if (!w) {
          return this.elements[4] * x + this.elements[5] * y + this.elements[6] * z + this.elements[7];
        } else {
          return this.elements[4] * x + this.elements[5] * y + this.elements[6] * z + this.elements[7] * w;
        }
      },
      multZ: function(x, y, z, w) {
        if (!w) {
          return this.elements[8] * x + this.elements[9] * y + this.elements[10] * z + this.elements[11];
        } else {
          return this.elements[8] * x + this.elements[9] * y + this.elements[10] * z + this.elements[11] * w;
        }
      },
      multW: function(x, y, z, w) {
        if (!w) {
          return this.elements[12] * x + this.elements[13] * y + this.elements[14] * z + this.elements[15];
        } else {
          return this.elements[12] * x + this.elements[13] * y + this.elements[14] * z + this.elements[15] * w;
        }
      },
      invert: function() {
        var kInv = [];
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

        kInv[0] = +this.elements[5] * fB5 - this.elements[6] * fB4 + this.elements[7] * fB3;
        kInv[4] = -this.elements[4] * fB5 + this.elements[6] * fB2 - this.elements[7] * fB1;
        kInv[8] = +this.elements[4] * fB4 - this.elements[5] * fB2 + this.elements[7] * fB0;
        kInv[12] = -this.elements[4] * fB3 + this.elements[5] * fB1 - this.elements[6] * fB0;
        kInv[1] = -this.elements[1] * fB5 + this.elements[2] * fB4 - this.elements[3] * fB3;
        kInv[5] = +this.elements[0] * fB5 - this.elements[2] * fB2 + this.elements[3] * fB1;
        kInv[9] = -this.elements[0] * fB4 + this.elements[1] * fB2 - this.elements[3] * fB0;
        kInv[13] = +this.elements[0] * fB3 - this.elements[1] * fB1 + this.elements[2] * fB0;
        kInv[2] = +this.elements[13] * fA5 - this.elements[14] * fA4 + this.elements[15] * fA3;
        kInv[6] = -this.elements[12] * fA5 + this.elements[14] * fA2 - this.elements[15] * fA1;
        kInv[10] = +this.elements[12] * fA4 - this.elements[13] * fA2 + this.elements[15] * fA0;
        kInv[14] = -this.elements[12] * fA3 + this.elements[13] * fA1 - this.elements[14] * fA0;
        kInv[3] = -this.elements[9] * fA5 + this.elements[10] * fA4 - this.elements[11] * fA3;
        kInv[7] = +this.elements[8] * fA5 - this.elements[10] * fA2 + this.elements[11] * fA1;
        kInv[11] = -this.elements[8] * fA4 + this.elements[9] * fA2 - this.elements[11] * fA0;
        kInv[15] = +this.elements[8] * fA3 - this.elements[9] * fA1 + this.elements[10] * fA0;

        // Inverse using Determinant
        var fInvDet = 1.0 / fDet;
        kInv[0] *= fInvDet;
        kInv[1] *= fInvDet;
        kInv[2] *= fInvDet;
        kInv[3] *= fInvDet;
        kInv[4] *= fInvDet;
        kInv[5] *= fInvDet;
        kInv[6] *= fInvDet;
        kInv[7] *= fInvDet;
        kInv[8] *= fInvDet;
        kInv[9] *= fInvDet;
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
      print: function() {
        var digits = printMatrixHelper(this.elements);

        var output = "";
        output += p.nfs(this.elements[0], digits, 4) + " " + p.nfs(this.elements[1], digits, 4) + " " + p.nfs(this.elements[2], digits, 4) + " " + p.nfs(this.elements[3], digits, 4) + "\n";
        output += p.nfs(this.elements[4], digits, 4) + " " + p.nfs(this.elements[5], digits, 4) + " " + p.nfs(this.elements[6], digits, 4) + " " + p.nfs(this.elements[7], digits, 4) + "\n";
        output += p.nfs(this.elements[8], digits, 4) + " " + p.nfs(this.elements[9], digits, 4) + " " + p.nfs(this.elements[10], digits, 4) + " " + p.nfs(this.elements[11], digits, 4) + "\n";
        output += p.nfs(this.elements[12], digits, 4) + " " + p.nfs(this.elements[13], digits, 4) + " " + p.nfs(this.elements[14], digits, 4) + " " + p.nfs(this.elements[15], digits, 4) + "\n\n";

        p.println(output);
      },
      invTranslate: function(tx, ty, tz) {
        this.preApply(1, 0, 0, -tx, 0, 1, 0, -ty, 0, 0, 1, -tz, 0, 0, 0, 1);
      },
      invRotateX: function(angle) {
        var c = p.cos(-angle);
        var s = p.sin(-angle);
        this.preApply([1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1]);
      },
      invRotateY: function(angle) {
        var c = p.cos(-angle);
        var s = p.sin(-angle);
        this.preApply([c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1]);
      },
      invRotateZ: function(angle) {
        var c = p.cos(-angle);
        var s = p.sin(-angle);
        this.preApply([c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
      },
      invScale: function(x, y, z) {
        this.preApply([1 / x, 0, 0, 0, 0, 1 / y, 0, 0, 0, 0, 1 / z, 0, 0, 0, 0, 1]);
      }
    };

    ////////////////////////////////////////////////////////////////////////////
    // Matrix Stack
    ////////////////////////////////////////////////////////////////////////////
    var PMatrixStack = function PMatrixStack() {
      this.matrixStack = [];
    };

    PMatrixStack.prototype.load = function load() {
      var tmpMatrix;
      if (p.use3DContext) {
        tmpMatrix = new PMatrix3D();
      } else {
        tmpMatrix = new PMatrix2D();
      }

      if (arguments.length === 1) {
        tmpMatrix.set(arguments[0]);
      } else {
        tmpMatrix.set(arguments);
      }
      this.matrixStack.push(tmpMatrix);
    };

    PMatrixStack.prototype.push = function push() {
      this.matrixStack.push(this.peek());
    };

    PMatrixStack.prototype.pop = function pop() {
      return this.matrixStack.pop();
    };

    PMatrixStack.prototype.peek = function peek() {
      var tmpMatrix;
      if (p.use3DContext) {
        tmpMatrix = new PMatrix3D();
      } else {
        tmpMatrix = new PMatrix2D();
      }

      tmpMatrix.set(this.matrixStack[this.matrixStack.length - 1]);
      return tmpMatrix;
    };

    PMatrixStack.prototype.mult = function mult(matrix) {
      this.matrixStack[this.matrixStack.length - 1].apply(matrix);
    };

    ////////////////////////////////////////////////////////////////////////////
    // Array handling
    ////////////////////////////////////////////////////////////////////////////    
    p.split = function(str, delim) {
      return str.split(delim);
    };

    p.splitTokens = function(str, tokens) {
      if (arguments.length === 1) {
        tokens = "\n\t\r\f ";
      }

      tokens = "[" + tokens + "]";

      var ary = new Array(0);
      var index = 0;
      var pos = str.search(tokens);

      while (pos >= 0) {
        if (pos === 0) {
          str = str.substring(1);
        } else {
          ary[index] = str.substring(0, pos);
          index++;
          str = str.substring(pos);
        }
        pos = str.search(tokens);
      }

      if (str.length > 0) {
        ary[index] = str;
      }

      if (ary.length === 0) {
        ary = undefined;
      }

      return ary;
    };

    p.append = function(array, element) {
      array[array.length] = element;
      return array;
    };

    p.concat = function(array1, array2) {
      return array1.concat(array2);
    };

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

    p.splice = function(array, value, index) {
      if (array.length === 0 && value.length === 0) {
        return array;
      }

      if (value instanceof Array) {
        for (var i = 0, j = index; i < value.length; j++, i++) {
          array.splice(j, 0, value[i]);
        }
      } else {
        array.splice(index, 0, value);
      }

      return array;
    };

    p.subset = function(array, offset, length) {
      if (arguments.length === 2) {
        return p.subset(array, offset, array.length - offset);
      } else if (arguments.length === 3) {
        return array.slice(offset, offset + length);
      }
    };

    p.join = function(array, seperator) {
      return array.join(seperator);
    };

    p.shorten = function(ary) {
      var newary = new Array(0);

      // copy array into new array
      var len = ary.length;
      for (var i = 0; i < len; i++) {
        newary[i] = ary[i];
      }
      newary.pop();

      return newary;
    };

    p.expand = function(ary, newSize) {
      var newary = new Array(0);

      var len = ary.length;
      for (var i = 0; i < len; i++) {
        newary[i] = ary[i];
      }

      if (arguments.length === 1) {
        // double size of array
        newary.length *= 2;
      } else if (arguments.length === 2) {
        // size is newSize
        newary.length = newSize;
      }

      return newary;
    };

    p.arrayCopy = function(src, srcPos, dest, destPos, length) {
      if (arguments.length === 2) {
        // recall itself and copy src to dest from start index 0 to 0 of src.length
        p.arrayCopy(src, 0, srcPos, 0, src.length);
      } else if (arguments.length === 3) {
        // recall itself and copy src to dest from start index 0 to 0 of length
        p.arrayCopy(src, 0, srcPos, 0, dest);
      } else if (arguments.length === 5) {
        // copy src to dest from index srcPos to index destPos of length recursivly on objects
        for (var i = srcPos, j = destPos; i < length + srcPos; i++, j++) {
          if (src[i] && typeof src[i] === "object") {
            // src[i] is not null and is another object or array. go recursive
            p.arrayCopy(src[i], 0, dest[j], 0, src[i].length);
          } else {
            // standard type, just copy
            dest[j] = src[i];
          }
        }
      }
    };

    p.ArrayList = function(size, size2, size3) {
      var array = new Array(0 | size);

      if (size2) {
        for (var i = 0; i < size; i++) {
          array[i] = [];

          for (var j = 0; j < size2; j++) {
            var a = array[i][j] = size3 ? new Array(size3) : 0;
            for (var k = 0; k < size3; k++) {
              a[k] = 0;
            }
          }
        }
      } else {
        for (var l = 0; l < size; l++) {
          array[l] = 0;
        }
      }

      array.get = function(i) {
        return this[i];
      };
      array.contains = function(item) {
        return this.indexOf(item) !== -1;
      };
      array.add = function(item) {
        return this.push(item);
      };
      array.size = function() {
        return this.length;
      };
      array.clear = function() {
        this.length = 0;
      };
      array.remove = function(i) {
        return this.splice(i, 1)[0];
      };
      array.isEmpty = function() {
        return !this.length;
      };
      array.clone = function() {
        var a = new p.ArrayList(size);
        for (var i = 0; i < size; i++) {
          a[i] = this[i];
        }
        return a;
      };

      return array;
    };

    p.reverse = function(array) {
      return array.reverse();
    };


    ////////////////////////////////////////////////////////////////////////////
    // HashMap
    ////////////////////////////////////////////////////////////////////////////
    var virtHashCode = function virtHashCode(obj) {
      if (obj.constructor === String) {
        var hash = 0;
        for (var i = 0; i < obj.length; ++i) {
          hash = (hash * 31 + obj.charCodeAt(i)) & 0xFFFFFFFF;
        }
        return hash;
      } else if (typeof(obj) !== "object") {
        return obj & 0xFFFFFFFF;
      } else if ("hashCode" in obj) {
        return obj.hashCode.call(obj);
      } else {
        if (obj.$id === undefined) {
          obj.$id = ((Math.floor(Math.random() * 0x10000) - 0x8000) << 16) | Math.floor(Math.random() * 0x10000);
        }
        return obj.$id;
      }
    };

    var virtEquals = function virtEquals(obj, other) {
      if (obj === null || other === null) {
        return (obj === null) && (other === null);
      } else if (obj.constructor === String) {
        return obj === other;
      } else if (typeof(obj) !== "object") {
        return obj === other;
      } else if ("equals" in obj) {
        return obj.equals.call(obj, other);
      } else {
        return obj === other;
      }
    };

    p.HashMap = function HashMap() {
      if (arguments.length === 1 && arguments[0].constructor === HashMap) {
        return arguments[0].clone();
      }

      var initialCapacity = arguments.length > 0 ? arguments[0] : 16;
      var loadFactor = arguments.length > 1 ? arguments[1] : 0.75;

      var buckets = new Array(initialCapacity);
      var count = 0;
      var hashMap = this;

      function ensureLoad() {
        if (count <= loadFactor * buckets.length) {
          return;
        }
        var allEntries = [];
        for (var i = 0; i < buckets.length; ++i) {
          if (buckets[i] !== undefined) {
            allEntries = allEntries.concat(buckets[i]);
          }
        }
        buckets = new Array(buckets.length * 2);
        for (var j = 0; j < allEntries.length; ++j) {
          var index = virtHashCode(allEntries[j].key) % buckets.length;
          var bucket = buckets[index];
          if (bucket === undefined) {
            buckets[index] = bucket = [];
          }
          bucket.push(allEntries[j]);
        }
      }

      function Iterator(conversion, removeItem) {
        var bucketIndex = 0;
        var itemIndex = -1;
        var endOfBuckets = false;

        function findNext() {
          while (!endOfBuckets) {
            ++itemIndex;
            if (bucketIndex >= buckets.length) {
              endOfBuckets = true;
            } else if (typeof(buckets[bucketIndex]) === 'undefined' || itemIndex >= buckets[bucketIndex].length) {
              itemIndex = -1;
              ++bucketIndex;
            } else {
              return;
            }
          }
        }

        this.hasNext = function() {
          return !endOfBuckets;
        };
        this.next = function() {
          var result = conversion(buckets[bucketIndex][itemIndex]);
          findNext();
          return result;
        };
        this.remove = function() {
          removeItem(this.next());
          --itemIndex;
        };

        findNext();
      }

      function Set(conversion, isIn, removeItem) {
        this.clear = function() {
          hashMap.clear();
        };
        this.contains = function(o) {
          return isIn(o);
        };
        this.containsAll = function(o) {
          var it = o.iterator();
          while (it.hasNext()) {
            if (!this.contains(it.next())) {
              return false;
            }
          }
          return true;
        };
        this.isEmpty = function() {
          return hashMap.isEmpty();
        };
        this.iterator = function() {
          return new Iterator(conversion, removeItem);
        };
        this.remove = function(o) {
          if (this.contains(o)) {
            removeItem(o);
            return true;
          }
          return false;
        };
        this.removeAll = function(c) {
          var it = c.iterator();
          var changed = false;
          while (it.hasNext()) {
            var item = it.next();
            if (this.contains(item)) {
              removeItem(item);
              changed = true;
            }
          }
          return true;
        };
        this.retainAll = function(c) {
          var it = this.iterator();
          var toRemove = [];
          while (it.hasNext()) {
            var entry = it.next();
            if (!c.contains(entry)) {
              toRemove.push(entry);
            }
          }
          for (var i = 0; i < toRemove.length; ++i) {
            removeItem(toRemove[i]);
          }
          return toRemove.length > 0;
        };
        this.size = function() {
          return hashMap.size();
        };
        this.toArray = function() {
          var result = new p.ArrayList(0);
          var it = this.iterator();
          while (it.hasNext()) {
            result.push(it.next());
          }
          return result;
        };
      }

      function Entry(pair) {
        this._isIn = function(map) {
          return map === hashMap && (typeof(pair.removed) === 'undefined');
        };
        this.equals = function(o) {
          return virtEquals(pair.key, o.getKey());
        };
        this.getKey = function() {
          return pair.key;
        };
        this.getValue = function() {
          return pair.value;
        };
        this.hashCode = function(o) {
          return virtHashCode(pair.key);
        };
        this.setValue = function(value) {
          var old = pair.value;
          pair.value = value;
          return old;
        };
      }

      this.clear = function() {
        count = 0;
        buckets = new Array(initialCapacity);
      };
      this.clone = function() {
        var map = new p.HashMap();
        map.putAll(this);
        return map;
      };
      this.containsKey = function(key) {
        var index = virtHashCode(key) % buckets.length;
        var bucket = buckets[index];
        if (bucket === undefined) {
          return false;
        }
        for (var i = 0; i < bucket.length; ++i) {
          if (virtEquals(bucket[i].key, key)) {
            return true;
          }
        }
        return false;
      };
      this.containsValue = function(value) {
        for (var i = 0; i < buckets.length; ++i) {
          var bucket = buckets[i];
          if (bucket === undefined) {
            continue;
          }
          for (var j = 0; j < bucket.length; ++j) {
            if (virtEquals(bucket[j].value, value)) {
              return true;
            }
          }
        }
        return false;
      };
      this.entrySet = function() {
        return new Set(

        function(pair) {
          return new Entry(pair);
        },

        function(pair) {
          return pair.constructor === Entry && pair._isIn(hashMap);
        },

        function(pair) {
          return hashMap.remove(pair.getKey());
        });
      };
      this.get = function(key) {
        var index = virtHashCode(key) % buckets.length;
        var bucket = buckets[index];
        if (bucket === undefined) {
          return null;
        }
        for (var i = 0; i < bucket.length; ++i) {
          if (virtEquals(bucket[i].key, key)) {
            return bucket[i].value;
          }
        }
        return null;
      };
      this.isEmpty = function() {
        return count === 0;
      };
      this.keySet = function() {
        return new Set(

        function(pair) {
          return pair.key;
        },

        function(key) {
          return hashMap.containsKey(key);
        },

        function(key) {
          return hashMap.remove(key);
        });
      };
      this.put = function(key, value) {
        var index = virtHashCode(key) % buckets.length;
        var bucket = buckets[index];
        if (bucket === undefined) {
          ++count;
          buckets[index] = [{
            key: key,
            value: value
          }];
          ensureLoad();
          return null;
        }
        for (var i = 0; i < bucket.length; ++i) {
          if (virtEquals(bucket[i].key, key)) {
            var previous = bucket[i].value;
            bucket[i].value = value;
            return previous;
          }
        }++count;
        bucket.push({
          key: key,
          value: value
        });
        ensureLoad();
        return null;
      };
      this.putAll = function(m) {
        var it = m.entrySet().iterator();
        while (it.hasNext()) {
          var entry = it.next();
          this.put(entry.getKey(), entry.getValue());
        }
      };
      this.remove = function(key) {
        var index = virtHashCode(key) % buckets.length;
        var bucket = buckets[index];
        if (bucket === undefined) {
          return null;
        }
        for (var i = 0; i < bucket.length; ++i) {
          if (virtEquals(bucket[i].key, key)) {
            --count;
            var previous = bucket[i].value;
            bucket[i].removed = true;
            if (bucket.length > 1) {
              bucket.splice(i, 1);
            } else {
              buckets[index] = undefined;
            }
            return previous;
          }
        }
        return null;
      };
      this.size = function() {
        return count;
      };
      this.values = function() {
        var result = new p.ArrayList(0);
        var it = this.entrySet().iterator();
        while (it.hasNext()) {
          var entry = it.next();
          result.push(entry.getValue());
        }
        return result;
      };
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
    p.modes = {
      replace: function(c1, c2) {
        return c2;
      },
      blend: function(c1, c2) {
        var f = (c2 & p.ALPHA_MASK) >>> 24;
        return (Math.min(((c1 & p.ALPHA_MASK) >>> 24) + f, 0xff) << 24 | p.mix(c1 & p.RED_MASK, c2 & p.RED_MASK, f) & p.RED_MASK | p.mix(c1 & p.GREEN_MASK, c2 & p.GREEN_MASK, f) & p.GREEN_MASK | p.mix(c1 & p.BLUE_MASK, c2 & p.BLUE_MASK, f));
      },
      add: function(c1, c2) {
        var f = (c2 & p.ALPHA_MASK) >>> 24;
        return (Math.min(((c1 & p.ALPHA_MASK) >>> 24) + f, 0xff) << 24 | Math.min(((c1 & p.RED_MASK) + ((c2 & p.RED_MASK) >> 8) * f), p.RED_MASK) & p.RED_MASK | Math.min(((c1 & p.GREEN_MASK) + ((c2 & p.GREEN_MASK) >> 8) * f), p.GREEN_MASK) & p.GREEN_MASK | Math.min((c1 & p.BLUE_MASK) + (((c2 & p.BLUE_MASK) * f) >> 8), p.BLUE_MASK));
      },
      subtract: function(c1, c2) {
        var f = (c2 & p.ALPHA_MASK) >>> 24;
        return (Math.min(((c1 & p.ALPHA_MASK) >>> 24) + f, 0xff) << 24 | Math.max(((c1 & p.RED_MASK) - ((c2 & p.RED_MASK) >> 8) * f), p.GREEN_MASK) & p.RED_MASK | Math.max(((c1 & p.GREEN_MASK) - ((c2 & p.GREEN_MASK) >> 8) * f), p.BLUE_MASK) & p.GREEN_MASK | Math.max((c1 & p.BLUE_MASK) - (((c2 & p.BLUE_MASK) * f) >> 8), 0));
      },
      lightest: function(c1, c2) {
        var f = (c2 & p.ALPHA_MASK) >>> 24;
        return (Math.min(((c1 & p.ALPHA_MASK) >>> 24) + f, 0xff) << 24 | Math.max(c1 & p.RED_MASK, ((c2 & p.RED_MASK) >> 8) * f) & p.RED_MASK | Math.max(c1 & p.GREEN_MASK, ((c2 & p.GREEN_MASK) >> 8) * f) & p.GREEN_MASK | Math.max(c1 & p.BLUE_MASK, ((c2 & p.BLUE_MASK) * f) >> 8));
      },
      darkest: function(c1, c2) {
        var f = (c2 & p.ALPHA_MASK) >>> 24;
        return (Math.min(((c1 & p.ALPHA_MASK) >>> 24) + f, 0xff) << 24 | p.mix(c1 & p.RED_MASK, Math.min(c1 & p.RED_MASK, ((c2 & p.RED_MASK) >> 8) * f), f) & p.RED_MASK | p.mix(c1 & p.GREEN_MASK, Math.min(c1 & p.GREEN_MASK, ((c2 & p.GREEN_MASK) >> 8) * f), f) & p.GREEN_MASK | p.mix(c1 & p.BLUE_MASK, Math.min(c1 & p.BLUE_MASK, ((c2 & p.BLUE_MASK) * f) >> 8), f));
      },
      difference: function(c1, c2) {
        var f = (c2 & p.ALPHA_MASK) >>> 24;
        var ar = (c1 & p.RED_MASK) >> 16;
        var ag = (c1 & p.GREEN_MASK) >> 8;
        var ab = (c1 & p.BLUE_MASK);
        var br = (c2 & p.RED_MASK) >> 16;
        var bg = (c2 & p.GREEN_MASK) >> 8;
        var bb = (c2 & p.BLUE_MASK);
        // formula:
        var cr = (ar > br) ? (ar - br) : (br - ar);
        var cg = (ag > bg) ? (ag - bg) : (bg - ag);
        var cb = (ab > bb) ? (ab - bb) : (bb - ab);
        // alpha blend (this portion will always be the same)
        return (Math.min(((c1 & p.ALPHA_MASK) >>> 24) + f, 0xff) << 24 | (p.peg(ar + (((cr - ar) * f) >> 8)) << 16) | (p.peg(ag + (((cg - ag) * f) >> 8)) << 8) | (p.peg(ab + (((cb - ab) * f) >> 8))));
      },
      exclusion: function(c1, c2) {
        var f = (c2 & p.ALPHA_MASK) >>> 24;
        var ar = (c1 & p.RED_MASK) >> 16;
        var ag = (c1 & p.GREEN_MASK) >> 8;
        var ab = (c1 & p.BLUE_MASK);
        var br = (c2 & p.RED_MASK) >> 16;
        var bg = (c2 & p.GREEN_MASK) >> 8;
        var bb = (c2 & p.BLUE_MASK);
        // formula:
        var cr = ar + br - ((ar * br) >> 7);
        var cg = ag + bg - ((ag * bg) >> 7);
        var cb = ab + bb - ((ab * bb) >> 7);
        // alpha blend (this portion will always be the same)
        return (Math.min(((c1 & p.ALPHA_MASK) >>> 24) + f, 0xff) << 24 | (p.peg(ar + (((cr - ar) * f) >> 8)) << 16) | (p.peg(ag + (((cg - ag) * f) >> 8)) << 8) | (p.peg(ab + (((cb - ab) * f) >> 8))));
      },
      multiply: function(c1, c2) {
        var f = (c2 & p.ALPHA_MASK) >>> 24;
        var ar = (c1 & p.RED_MASK) >> 16;
        var ag = (c1 & p.GREEN_MASK) >> 8;
        var ab = (c1 & p.BLUE_MASK);
        var br = (c2 & p.RED_MASK) >> 16;
        var bg = (c2 & p.GREEN_MASK) >> 8;
        var bb = (c2 & p.BLUE_MASK);
        // formula:
        var cr = (ar * br) >> 8;
        var cg = (ag * bg) >> 8;
        var cb = (ab * bb) >> 8;
        // alpha blend (this portion will always be the same)
        return (Math.min(((c1 & p.ALPHA_MASK) >>> 24) + f, 0xff) << 24 | (p.peg(ar + (((cr - ar) * f) >> 8)) << 16) | (p.peg(ag + (((cg - ag) * f) >> 8)) << 8) | (p.peg(ab + (((cb - ab) * f) >> 8))));
      },
      screen: function(c1, c2) {
        var f = (c2 & p.ALPHA_MASK) >>> 24;
        var ar = (c1 & p.RED_MASK) >> 16;
        var ag = (c1 & p.GREEN_MASK) >> 8;
        var ab = (c1 & p.BLUE_MASK);
        var br = (c2 & p.RED_MASK) >> 16;
        var bg = (c2 & p.GREEN_MASK) >> 8;
        var bb = (c2 & p.BLUE_MASK);
        // formula:
        var cr = 255 - (((255 - ar) * (255 - br)) >> 8);
        var cg = 255 - (((255 - ag) * (255 - bg)) >> 8);
        var cb = 255 - (((255 - ab) * (255 - bb)) >> 8);
        // alpha blend (this portion will always be the same)
        return (Math.min(((c1 & p.ALPHA_MASK) >>> 24) + f, 0xff) << 24 | (p.peg(ar + (((cr - ar) * f) >> 8)) << 16) | (p.peg(ag + (((cg - ag) * f) >> 8)) << 8) | (p.peg(ab + (((cb - ab) * f) >> 8))));
      },
      hard_light: function(c1, c2) {
        var f = (c2 & p.ALPHA_MASK) >>> 24;
        var ar = (c1 & p.RED_MASK) >> 16;
        var ag = (c1 & p.GREEN_MASK) >> 8;
        var ab = (c1 & p.BLUE_MASK);
        var br = (c2 & p.RED_MASK) >> 16;
        var bg = (c2 & p.GREEN_MASK) >> 8;
        var bb = (c2 & p.BLUE_MASK);
        // formula:
        var cr = (br < 128) ? ((ar * br) >> 7) : (255 - (((255 - ar) * (255 - br)) >> 7));
        var cg = (bg < 128) ? ((ag * bg) >> 7) : (255 - (((255 - ag) * (255 - bg)) >> 7));
        var cb = (bb < 128) ? ((ab * bb) >> 7) : (255 - (((255 - ab) * (255 - bb)) >> 7));
        // alpha blend (this portion will always be the same)
        return (Math.min(((c1 & p.ALPHA_MASK) >>> 24) + f, 0xff) << 24 | (p.peg(ar + (((cr - ar) * f) >> 8)) << 16) | (p.peg(ag + (((cg - ag) * f) >> 8)) << 8) | (p.peg(ab + (((cb - ab) * f) >> 8))));
      },
      soft_light: function(c1, c2) {
        var f = (c2 & p.ALPHA_MASK) >>> 24;
        var ar = (c1 & p.RED_MASK) >> 16;
        var ag = (c1 & p.GREEN_MASK) >> 8;
        var ab = (c1 & p.BLUE_MASK);
        var br = (c2 & p.RED_MASK) >> 16;
        var bg = (c2 & p.GREEN_MASK) >> 8;
        var bb = (c2 & p.BLUE_MASK);
        // formula:
        var cr = ((ar * br) >> 7) + ((ar * ar) >> 8) - ((ar * ar * br) >> 15);
        var cg = ((ag * bg) >> 7) + ((ag * ag) >> 8) - ((ag * ag * bg) >> 15);
        var cb = ((ab * bb) >> 7) + ((ab * ab) >> 8) - ((ab * ab * bb) >> 15);
        // alpha blend (this portion will always be the same)
        return (Math.min(((c1 & p.ALPHA_MASK) >>> 24) + f, 0xff) << 24 | (p.peg(ar + (((cr - ar) * f) >> 8)) << 16) | (p.peg(ag + (((cg - ag) * f) >> 8)) << 8) | (p.peg(ab + (((cb - ab) * f) >> 8))));
      },
      overlay: function(c1, c2) {
        var f = (c2 & p.ALPHA_MASK) >>> 24;
        var ar = (c1 & p.RED_MASK) >> 16;
        var ag = (c1 & p.GREEN_MASK) >> 8;
        var ab = (c1 & p.BLUE_MASK);
        var br = (c2 & p.RED_MASK) >> 16;
        var bg = (c2 & p.GREEN_MASK) >> 8;
        var bb = (c2 & p.BLUE_MASK);
        // formula:
        var cr = (ar < 128) ? ((ar * br) >> 7) : (255 - (((255 - ar) * (255 - br)) >> 7));
        var cg = (ag < 128) ? ((ag * bg) >> 7) : (255 - (((255 - ag) * (255 - bg)) >> 7));
        var cb = (ab < 128) ? ((ab * bb) >> 7) : (255 - (((255 - ab) * (255 - bb)) >> 7));
        // alpha blend (this portion will always be the same)
        return (Math.min(((c1 & p.ALPHA_MASK) >>> 24) + f, 0xff) << 24 | (p.peg(ar + (((cr - ar) * f) >> 8)) << 16) | (p.peg(ag + (((cg - ag) * f) >> 8)) << 8) | (p.peg(ab + (((cb - ab) * f) >> 8))));
      },
      dodge: function(c1, c2) {
        var f = (c2 & p.ALPHA_MASK) >>> 24;
        var ar = (c1 & p.RED_MASK) >> 16;
        var ag = (c1 & p.GREEN_MASK) >> 8;
        var ab = (c1 & p.BLUE_MASK);
        var br = (c2 & p.RED_MASK) >> 16;
        var bg = (c2 & p.GREEN_MASK) >> 8;
        var bb = (c2 & p.BLUE_MASK);
        // formula:
        var cr = (br === 255) ? 255 : p.peg((ar << 8) / (255 - br)); // division requires pre-peg()-ing
        var cg = (bg === 255) ? 255 : p.peg((ag << 8) / (255 - bg)); // "
        var cb = (bb === 255) ? 255 : p.peg((ab << 8) / (255 - bb)); // "
        // alpha blend (this portion will always be the same)
        return (Math.min(((c1 & p.ALPHA_MASK) >>> 24) + f, 0xff) << 24 | (p.peg(ar + (((cr - ar) * f) >> 8)) << 16) | (p.peg(ag + (((cg - ag) * f) >> 8)) << 8) | (p.peg(ab + (((cb - ab) * f) >> 8))));
      },
      burn: function(c1, c2) {
        var f = (c2 & p.ALPHA_MASK) >>> 24;
        var ar = (c1 & p.RED_MASK) >> 16;
        var ag = (c1 & p.GREEN_MASK) >> 8;
        var ab = (c1 & p.BLUE_MASK);
        var br = (c2 & p.RED_MASK) >> 16;
        var bg = (c2 & p.GREEN_MASK) >> 8;
        var bb = (c2 & p.BLUE_MASK);
        // formula:
        var cr = (br === 0) ? 0 : 255 - p.peg(((255 - ar) << 8) / br); // division requires pre-peg()-ing
        var cg = (bg === 0) ? 0 : 255 - p.peg(((255 - ag) << 8) / bg); // "
        var cb = (bb === 0) ? 0 : 255 - p.peg(((255 - ab) << 8) / bb); // "
        // alpha blend (this portion will always be the same)
        return (Math.min(((c1 & p.ALPHA_MASK) >>> 24) + f, 0xff) << 24 | (p.peg(ar + (((cr - ar) * f) >> 8)) << 16) | (p.peg(ag + (((cg - ag) * f) >> 8)) << 8) | (p.peg(ab + (((cb - ab) * f) >> 8))));
      }
    };

    p.color = function color(aValue1, aValue2, aValue3, aValue4) {
      var r, g, b, a, rgb, aColor;
      if (aValue1 != null && aValue2 != null && aValue3 != null && aValue4 != null) {
        if (curColorMode === p.HSB) {
          rgb = p.color.toRGB(aValue1, aValue2, aValue3);
          r = rgb[0];
          g = rgb[1];
          b = rgb[2];
        } else {
          r = Math.round(255 * (aValue1 / redRange));
          g = Math.round(255 * (aValue2 / greenRange));
          b = Math.round(255 * (aValue3 / blueRange));
        }

        a = Math.round(255 * (aValue4 / opacityRange));

        // Normalize values: values greater than range == range 
        r = (r > 255) ? 255 : r;
        g = (g > 255) ? 255 : g;
        b = (b > 255) ? 255 : b;
        a = (a > 255) ? 255 : a;

        aColor = (a << 24) & p.ALPHA_MASK | (r << 16) & p.RED_MASK | (g << 8) & p.GREEN_MASK | b & p.BLUE_MASK;
      } else if (aValue1 != null && aValue2 != null && aValue3 != null) {
        aColor = p.color(aValue1, aValue2, aValue3, opacityRange);
      } else if (aValue1 != null && aValue2 != null) {
        if ((aValue1 & p.ALPHA_MASK)) { // colorInt and opacity
          aColor = p.color(p.red(aValue1), p.green(aValue1), p.blue(aValue1), aValue2);
        } else { // grayscale and alpha
          aColor = p.color(aValue1, aValue1, aValue1, aValue2);
        }
      } else if (typeof aValue1 === "number") {
        if (aValue1 < 256 && aValue1 >= 0) {
          aColor = p.color(aValue1, aValue1, aValue1, opacityRange);
        } else {
          var intcolor = 0;
          if (aValue1 < 0) {
            intcolor = 4294967296 - (aValue1 * -1);
          } else {
            intcolor = aValue1;
          }
          var ac = Math.floor((intcolor % 4294967296) / 16777216);
          var rc = Math.floor((intcolor % 16777216) / 65536);
          var gc = Math.floor((intcolor % 65536) / 256);
          var bc = intcolor % 256;
          aColor = p.color(rc, gc, bc, ac);
        }
      } else {
        aColor = p.color(redRange, greenRange, blueRange, opacityRange);
      }
      return aColor;
    };

    // Ease of use function to extract the colour bits into a string
    p.color.toString = function(colorInt) {
      return "rgba(" + ((colorInt & p.RED_MASK) >>> 16) + "," + ((colorInt & p.GREEN_MASK) >>> 8) + "," + ((colorInt & p.BLUE_MASK)) + "," + ((colorInt & p.ALPHA_MASK) >>> 24) / 255 + ")";
    };

    // Easy of use function to pack rgba values into a single bit-shifted color int.
    p.color.toInt = function(r, g, b, a) {
      return (a << 24) & p.ALPHA_MASK | (r << 16) & p.RED_MASK | (g << 8) & p.GREEN_MASK | b & p.BLUE_MASK;
    };

    // Creates a simple array in [R, G, B, A] format, [255, 255, 255, 255]
    p.color.toArray = function(colorInt) {
      return [(colorInt & p.RED_MASK) >>> 16, (colorInt & p.GREEN_MASK) >>> 8, colorInt & p.BLUE_MASK, (colorInt & p.ALPHA_MASK) >>> 24];
    };

    // Creates a WebGL color array in [R, G, B, A] format. WebGL wants the color ranges between 0 and 1, [1, 1, 1, 1]
    p.color.toGLArray = function(colorInt) {
      return [((colorInt & p.RED_MASK) >>> 16) / 255, ((colorInt & p.GREEN_MASK) >>> 8) / 255, (colorInt & p.BLUE_MASK) / 255, ((colorInt & p.ALPHA_MASK) >>> 24) / 255];
    };

    // HSB conversion function from Mootools, MIT Licensed
    p.color.toRGB = function(h, s, b) {
      h = (h / redRange) * 360;
      s = (s / greenRange) * 100;
      b = (b / blueRange) * 100;
      var br = Math.round(b / 100 * 255);
      if (s === 0) {
        return [br, br, br];
      } else {
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
        }
      }
    };

    var verifyChannel = function verifyChannel(aColor) {
      if (aColor.constructor === Array) {
        return aColor;
      } else {
        return p.color(aColor);
      }
    };

    p.red = function(aColor) {
      return ((aColor & p.RED_MASK) >>> 16) / 255 * redRange;
    };

    p.green = function(aColor) {
      return ((aColor & p.GREEN_MASK) >>> 8) / 255 * greenRange;
    };

    p.blue = function(aColor) {
      return (aColor & p.BLUE_MASK) / 255 * blueRange;
    };

    p.alpha = function(aColor) {
      return ((aColor & p.ALPHA_MASK) >>> 24) / 255 * opacityRange;
    };

    p.lerpColor = function lerpColor(c1, c2, amt) {
      // Get RGBA values for Color 1 to floats
      var colorBits1 = p.color(c1);
      var r1 = (colorBits1 & p.RED_MASK) >>> 16;
      var g1 = (colorBits1 & p.GREEN_MASK) >>> 8;
      var b1 = (colorBits1 & p.BLUE_MASK);
      var a1 = ((colorBits1 & p.ALPHA_MASK) >>> 24) / opacityRange;

      // Get RGBA values for Color 2 to floats
      var colorBits2 = p.color(c2);
      var r2 = (colorBits2 & p.RED_MASK) >>> 16;
      var g2 = (colorBits2 & p.GREEN_MASK) >>> 8;
      var b2 = (colorBits2 & p.BLUE_MASK);
      var a2 = ((colorBits2 & p.ALPHA_MASK) >>> 24) / opacityRange;

      // Return lerp value for each channel, INT for color, Float for Alpha-range
      var r = parseInt(p.lerp(r1, r2, amt), 10);
      var g = parseInt(p.lerp(g1, g2, amt), 10);
      var b = parseInt(p.lerp(b1, b2, amt), 10);
      var a = parseFloat(p.lerp(a1, a2, amt), 10);

      return p.color.toInt(r, g, b, a);
    };

    // Forced default color mode for #aaaaaa style
    p.defaultColor = function(aValue1, aValue2, aValue3) {
      var tmpColorMode = curColorMode;
      curColorMode = p.RGB;
      var c = p.color(aValue1 / 255 * redRange, aValue2 / 255 * greenRange, aValue3 / 255 * blueRange);
      curColorMode = tmpColorMode;
      return c;
    };

    p.colorMode = function colorMode(mode, range1, range2, range3, range4) {
      curColorMode = mode;
      if (arguments.length >= 4) {
        redRange = range1;
        greenRange = range2;
        blueRange = range3;
      }
      if (arguments.length === 5) {
        opacityRange = range4;
      }
      if (arguments.length === 2) {
        p.colorMode(mode, range1, range1, range1, range1);
      }
    };

    p.blendColor = function(c1, c2, mode) {
      var color = 0;
      switch (mode) {
      case p.REPLACE:
        color = p.modes.replace(c1, c2);
        break;
      case p.BLEND:
        color = p.modes.blend(c1, c2);
        break;
      case p.ADD:
        color = p.modes.add(c1, c2);
        break;
      case p.SUBTRACT:
        color = p.modes.subtract(c1, c2);
        break;
      case p.LIGHTEST:
        color = p.modes.lightest(c1, c2);
        break;
      case p.DARKEST:
        color = p.modes.darkest(c1, c2);
        break;
      case p.DIFFERENCE:
        color = p.modes.difference(c1, c2);
        break;
      case p.EXCLUSION:
        color = p.modes.exclusion(c1, c2);
        break;
      case p.MULTIPLY:
        color = p.modes.multiply(c1, c2);
        break;
      case p.SCREEN:
        color = p.modes.screen(c1, c2);
        break;
      case p.HARD_LIGHT:
        color = p.modes.hard_light(c1, c2);
        break;
      case p.SOFT_LIGHT:
        color = p.modes.soft_light(c1, c2);
        break;
      case p.OVERLAY:
        color = p.modes.overlay(c1, c2);
        break;
      case p.DODGE:
        color = p.modes.dodge(c1, c2);
        break;
      case p.BURN:
        color = p.modes.burn(c1, c2);
        break;
      }
      return color;
    };

    ////////////////////////////////////////////////////////////////////////////
    // Canvas-Matrix manipulation
    ////////////////////////////////////////////////////////////////////////////
    p.printMatrix = function printMatrix() {
      modelView.print();
    };

    p.translate = function translate(x, y, z) {
      if (p.use3DContext) {
        forwardTransform.translate(x, y, z);
        reverseTransform.invTranslate(x, y, z);
      } else {
        curContext.translate(x, y);
      }
    };

    p.scale = function scale(x, y, z) {
      if (p.use3DContext) {
        forwardTransform.scale(x, y, z);
        reverseTransform.invScale(x, y, z);
      } else {
        curContext.scale(x, y || x);
      }
    };

    p.pushMatrix = function pushMatrix() {
      if (p.use3DContext) {
        userMatrixStack.load(modelView);
      } else {
        curContext.save();
      }
    };

    p.popMatrix = function popMatrix() {
      if (p.use3DContext) {
        modelView.set(userMatrixStack.pop());
      } else {
        curContext.restore();
      }
    };

    p.resetMatrix = function resetMatrix() {
      forwardTransform.reset();
      reverseTransform.reset();
    };

    p.applyMatrix = function applyMatrix() {
      var a = arguments;
      if (!p.use3DContext) {
        for (var cnt = a.length; cnt < 16; cnt++) {
          a[cnt] = 0;
        }
        a[10] = a[15] = 1;
      }

      forwardTransform.apply(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9], a[10], a[11], a[12], a[13], a[14], a[15]);
      reverseTransform.invApply(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9], a[10], a[11], a[12], a[13], a[14], a[15]);
    };

    p.rotateX = function(angleInRadians) {
      forwardTransform.rotateX(angleInRadians);
      reverseTransform.invRotateX(angleInRadians);
    };

    p.rotateZ = function(angleInRadians) {
      forwardTransform.rotateZ(angleInRadians);
      reverseTransform.invRotateZ(angleInRadians);
    };

    p.rotateY = function(angleInRadians) {
      forwardTransform.rotateY(angleInRadians);
      reverseTransform.invRotateY(angleInRadians);
    };

    p.rotate = function rotate(angleInRadians) {
      if (p.use3DContext) {
        forwardTransform.rotateZ(angleInRadians);
        reverseTransform.invRotateZ(angleInRadians);
      } else {
        curContext.rotate(angleInRadians);
      }
    };

    p.pushStyle = function pushStyle() {
      // Save the canvas state.
      curContext.save();

      p.pushMatrix();

      var newState = {
        'doFill': doFill,
        'doStroke': doStroke,
        'curTint': curTint,
        'curRectMode': curRectMode,
        'curColorMode': curColorMode,
        'redRange': redRange,
        'blueRange': blueRange,
        'greenRange': greenRange,
        'opacityRange': opacityRange,
        'curTextFont': curTextFont,
        'curTextSize': curTextSize
      };

      styleArray.push(newState);
    };

    p.popStyle = function popStyle() {
      var oldState = styleArray.pop();

      if (oldState) {
        curContext.restore();

        p.popMatrix();

        doFill = oldState.doFill;
        doStroke = oldState.doStroke;
        curTint = oldState.curTint;
        curRectMode = oldState.curRectmode;
        curColorMode = oldState.curColorMode;
        redRange = oldState.redRange;
        blueRange = oldState.blueRange;
        greenRange = oldState.greenRange;
        opacityRange = oldState.opacityRange;
        curTextFont = oldState.curTextFont;
        curTextSize = oldState.curTextSize;
      } else {
        throw "Too many popStyle() without enough pushStyle()";
      }
    };

    ////////////////////////////////////////////////////////////////////////////
    // Time based functions
    ////////////////////////////////////////////////////////////////////////////
    p.year = function year() {
      return new Date().getFullYear();
    };
    p.month = function month() {
      return new Date().getMonth() + 1;
    };
    p.day = function day() {
      return new Date().getDate();
    };
    p.hour = function hour() {
      return new Date().getHours();
    };
    p.minute = function minute() {
      return new Date().getMinutes();
    };
    p.second = function second() {
      return new Date().getSeconds();
    };
    p.millis = function millis() {
      return new Date().getTime() - start;
    };

    p.noLoop = function noLoop() {
      doLoop = false;
      loopStarted = false;
      clearInterval(looping);
    };

    p.redraw = function redraw() {
      var sec = (new Date().getTime() - timeSinceLastFPS) / 1000;
      framesSinceLastFPS++;
      var fps = framesSinceLastFPS / sec;

      // recalculate FPS every half second for better accuracy.
      if (sec > 0.5) {
        timeSinceLastFPS = new Date().getTime();
        framesSinceLastFPS = 0;
        p.FRAME_RATE = fps;
      }

      p.frameCount++;

      inDraw = true;

      if (p.use3DContext) {
        // Delete all the lighting states and the materials the
        // user set in the last draw() call.
        p.noLights();
        p.lightFalloff(1, 0, 0);
        p.shininess(1);
        p.ambient(255, 255, 255);
        p.specular(0, 0, 0);

        curContext.clear(curContext.COLOR_BUFFER_BIT | curContext.DEPTH_BUFFER_BIT);
        p.camera();
        p.draw();
      } else {
        p.pushMatrix();
        p.draw();
        p.popMatrix();
      }

      inDraw = false;
    };

    p.loop = function loop() {
      if (loopStarted) {
        return;
      }

      looping = window.setInterval(function() {
        try {
          try {
            p.focused = document.hasFocus();
          } catch(e) {}
          p.redraw();
        } catch(e_loop) {
          window.clearInterval(looping);
          throw e_loop;
        }
      },
      curMsPerFrame);

      doLoop = true;
      loopStarted = true;
    };

    p.frameRate = function frameRate(aRate) {
      curFrameRate = aRate;
      curMsPerFrame = 1000 / curFrameRate;
    };

    p.exit = function exit() {
      window.clearInterval(looping);
    };


    ////////////////////////////////////////////////////////////////////////////
    // MISC functions
    ////////////////////////////////////////////////////////////////////////////
    p.cursor = function cursor() {
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

    p.noCursor = function noCursor() {
      curCursor = document.body.style.cursor = p.NOCURSOR;
    };

    p.link = function(href, target) {
      if (typeof target !== 'undefined') {
        window.open(href, target);
      } else {
        window.location = href;
      }
    };

    // PGraphics methods
    // TODO: These functions are suppose to be called before any operations are called on the 
    //       PGraphics object. They currently do nothing.
    p.beginDraw = function beginDraw() {};
    p.endDraw = function endDraw() {};

    // Imports an external Processing.js library
    p.Import = function Import(lib) {
      // Replace evil-eval method with a DOM <script> tag insert method that
      // binds new lib code to the Processing.lib names-space and the current
      // p context. -F1LT3R 
    };

    var contextMenu = function(e) {
      e.preventDefault();
      e.stopPropagation();
    };

    p.disableContextMenu = function disableContextMenu() {
      curElement.addEventListener('contextmenu', contextMenu, false);
    };

    p.enableContextMenu = function enableContextMenu() {
      curElement.removeEventListener('contextmenu', contextMenu, false);
    };


    ////////////////////////////////////////////////////////////////////////////
    // Binary Functions
    ////////////////////////////////////////////////////////////////////////////

    function decToBin(value, numBitsInValue) {
      var mask = 1;
      mask = mask << (numBitsInValue - 1);

      var str = "";
      for (var i = 0; i < numBitsInValue; i++) {
        str += (mask & value) ? "1" : "0";
        mask = mask >>> 1;
      }
      return str;
    }

    p.binary = function(num, numBits) {
      var numBitsInValue = 32;

      // color
      if (typeof num === "string" && num.length > 1) {
        var c = num.slice(5, -1).split(",");

        // if all components are zero, a single "0" is returned for some reason
        // [0] alpha is normalized, [1] r, [2] g, [3] b
        var sbin = [
          decToBin(c[3] * 255, 8),
          decToBin(c[0], 8),
          decToBin(c[1], 8),
          decToBin(c[2], 8)
          ];

        var s = sbin[0] + sbin[1] + sbin[2] + sbin[3];

        if (numBits) {
          s = s.substr(-numBits);
        }
        // if the user didn't specify number of bits,
        // trim leading zeros.
        else {
          s = s.replace(/^0+$/g, "0");
          s = s.replace(/^0{1,}1/g, "1");
        }
        return s;
      }

      // char
      if (typeof num === "string" || num instanceof Char) {

        if (num instanceof Char) {
          num = num.toString().charCodeAt(0);
        } else {
          num = num.charCodeAt(0);
        }

        if (numBits) {
          numBitsInValue = 32;
        } else {
          numBitsInValue = 16;
        }
      }

      var str = decToBin(num, numBitsInValue);

      // trim string if user wanted less chars
      if (numBits) {
        str = str.substr(-numBits);
      }
      return str;
    };

    p.unbinary = function unbinary(binaryString) {
      var binaryPattern = new RegExp("^[0|1]{8}$");
      var addUp = 0;

      if (isNaN(binaryString)) {
        throw "NaN_Err";
      } else {
        if (arguments.length === 1 || binaryString.length === 8) {
          if (binaryPattern.test(binaryString)) {
            for (var i = 0; i < 8; i++) {
              addUp += (Math.pow(2, i) * parseInt(binaryString.charAt(7 - i), 10));
            }
            return addUp + "";
          } else {
            throw "notBinary: the value passed into unbinary was not an 8 bit binary number";
          }
        } else {
          throw "longErr";
        }
      }
    };

    p.nfs = function(num, left, right) {
      var str, len, formatLength, rounded;

      // array handling
      if (typeof num === "object" && num.constructor === Array) {
        str = new Array(0);
        len = num.length;
        for (var i = 0; i < len; i++) {
          str[i] = p.nfs(num[i], left, right);
        }
      } else if (arguments.length === 3) {
        var negative = num < 0 ? true : false;

        // Make it work exactly like p5 for right = 0
        if (right === 0) {
          right = 1;
        }

        if (right < 0) {
          rounded = Math.round(num);
        } else {
          // round to 'right' decimal places
          rounded = Math.round(num * Math.pow(10, right)) / Math.pow(10, right);
        }

        // split number into whole and fractional components
        var splitNum = Math.abs(rounded).toString().split("."); // [0] whole number, [1] fractional number
        // format whole part
        formatLength = left - splitNum[0].length;
        for (; formatLength > 0; formatLength--) {
          splitNum[0] = "0" + splitNum[0];
        }

        // format fractional part
        if (splitNum.length === 2 || right > 0) {
          splitNum[1] = splitNum.length === 2 ? splitNum[1] : "";
          formatLength = right - splitNum[1].length;
          for (; formatLength > 0; formatLength--) {
            splitNum[1] += "0";
          }
          str = splitNum.join(".");
        } else {
          str = splitNum[0];
        }

        str = (negative ? "-" : " ") + str;
      } else if (arguments.length === 2) {
        str = p.nfs(num, left, -1);
      }
      return str;
    };

    p.nfp = function(num, left, right) {
      var str, len, formatLength, rounded;

      // array handling
      if (typeof num === "object" && num.constructor === Array) {
        str = new Array(0);
        len = num.length;
        for (var i = 0; i < len; i++) {
          str[i] = p.nfp(num[i], left, right);
        }
      } else if (arguments.length === 3) {
        var negative = num < 0 ? true : false;

        // Make it work exactly like p5 for right = 0
        if (right === 0) {
          right = 1;
        }

        if (right < 0) {
          rounded = Math.round(num);
        } else {
          // round to 'right' decimal places
          rounded = Math.round(num * Math.pow(10, right)) / Math.pow(10, right);
        }

        // split number into whole and fractional components
        var splitNum = Math.abs(rounded).toString().split("."); // [0] whole number, [1] fractional number
        // format whole part
        formatLength = left - splitNum[0].length;
        for (; formatLength > 0; formatLength--) {
          splitNum[0] = "0" + splitNum[0];
        }

        // format fractional part
        if (splitNum.length === 2 || right > 0) {
          splitNum[1] = splitNum.length === 2 ? splitNum[1] : "";
          formatLength = right - splitNum[1].length;
          for (; formatLength > 0; formatLength--) {
            splitNum[1] += "0";
          }
          str = splitNum.join(".");
        } else {
          str = splitNum[0];
        }

        str = (negative ? "-" : "+") + str;
      } else if (arguments.length === 2) {
        str = p.nfp(num, left, -1);
      }
      return str;
    };

    p.nfc = function(num, right) {
      var str;
      var decimals = right >= 0 ? right : 0;
      if (typeof num === "object") {
        str = new Array(0);
        for (var i = 0; i < num.length; i++) {
          str[i] = p.nfc(num[i], decimals);
        }
      } else if (arguments.length === 2) {
        var rawStr = p.nfs(num, 0, decimals);
        var ary = new Array(0);
        ary = rawStr.split('.');
        // ary[0] contains left of decimal, ary[1] contains decimal places if they exist
        // insert commas now, then append ary[1] if it exists
        var leftStr = ary[0];
        var rightStr = ary.length > 1 ? '.' + ary[1] : '';
        var commas = /(\d+)(\d{3})/;
        while (commas.test(leftStr)) {
          leftStr = leftStr.replace(commas, '$1' + ',' + '$2');
        }
        str = leftStr + rightStr;
      } else if (arguments.length === 1) {
        str = p.nfc(num, 0);
      }
      return str;
    };

    var decimalToHex = function decimalToHex(d, padding) {
      //if there is no padding value added, default padding to 8 else go into while statement.
      padding = typeof(padding) === "undefined" || padding === null ? padding = 8 : padding;
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
    p.hex = function hex(value, len) {
      var hexstring = "";
      if (arguments.length === 1) {
        if (value instanceof Char) {
          hexstring = hex(value, 4);
        } else { // int or byte, indistinguishable at the moment, default to 8
          hexstring = hex(value, 8);
        }
      } else { // pad to specified length
        hexstring = decimalToHex(value, len);
      }
      return hexstring;
    };

    p.unhex = function(str) {
      var value = 0,
        multiplier = 1,
        num = 0;

      var len = str.length - 1;
      for (var i = len; i >= 0; i--) {
        try {
          switch (str[i]) {
          case "0":
            num = 0;
            break;
          case "1":
            num = 1;
            break;
          case "2":
            num = 2;
            break;
          case "3":
            num = 3;
            break;
          case "4":
            num = 4;
            break;
          case "5":
            num = 5;
            break;
          case "6":
            num = 6;
            break;
          case "7":
            num = 7;
            break;
          case "8":
            num = 8;
            break;
          case "9":
            num = 9;
            break;
          case "A":
          case "a":
            num = 10;
            break;
          case "B":
          case "b":
            num = 11;
            break;
          case "C":
          case "c":
            num = 12;
            break;
          case "D":
          case "d":
            num = 13;
            break;
          case "E":
          case "e":
            num = 14;
            break;
          case "F":
          case "f":
            num = 15;
            break;
          default:
            return 0;
          }
          value += num * multiplier;
          multiplier *= 16;
        } catch(e) {
          Processing.debug(e);
        }
        // correct for int overflow java expectation
        if (value > 2147483647) {
          value -= 4294967296;
        }
      }
      return value;
    };


    // Load a file or URL into strings     
    p.loadStrings = function loadStrings(url) {
      return ajax(url).split("\n");
    };

    p.loadBytes = function loadBytes(url) {
      var string = ajax(url);
      var ret = new Array(string.length);

      for (var i = 0; i < string.length; i++) {
        ret[i] = string.charCodeAt(i);
      }

      return ret;
    };

    // nf() should return an array when being called on an array, at the moment it only returns strings. -F1LT3R
    // This breaks the join() ref-test. The Processing.org documentation says String or String[]. SHOULD BE FIXED NOW
    p.nf = function() {
      var str, num, pad, arr, left, right, isNegative, test, i;

      if (arguments.length === 2 && typeof arguments[0] === 'number' && typeof arguments[1] === 'number' && (arguments[0] + "").indexOf('.') === -1) {
        num = arguments[0];
        pad = arguments[1];

        isNegative = num < 0;

        if (isNegative) {
          num = Math.abs(num);
        }

        str = "" + num;
        for (i = pad - str.length; i > 0; i--) {
          str = "0" + str;
        }

        if (isNegative) {
          str = "-" + str;
        }
      } else if (arguments.length === 2 && typeof arguments[0] === 'object' && arguments[0].constructor === Array && typeof arguments[1] === 'number') {
        arr = arguments[0];
        pad = arguments[1];

        str = new Array(arr.length);

        for (i = 0; i < arr.length && str !== undefined; i++) {
          test = this.nf(arr[i], pad);
          if (test === undefined) {
            str = undefined;
          } else {
            str[i] = test;
          }
        }
      } else if (arguments.length === 3 && typeof arguments[0] === 'number' && typeof arguments[1] === 'number' && typeof arguments[2] === 'number' && (arguments[0] + "").indexOf('.') >= 0) {
        num = arguments[0];
        left = arguments[1];
        right = arguments[2];

        isNegative = num < 0;

        if (isNegative) {
          num = Math.abs(num);
        }

        // Change the way the number is 'floored' based on whether it is odd or even.
        if (right < 0 && Math.floor(num) % 2 === 1) {
          // Make sure 1.49 rounds to 1, but 1.5 rounds to 2.
          if ((num) - Math.floor(num) >= 0.5) {
            num = num + 1;
          }
        }

        str = "" + num;

        for (i = left - str.indexOf('.'); i > 0; i--) {
          str = "0" + str;
        }

        var numDec = str.length - str.indexOf('.') - 1;
        if (numDec <= right) {
          for (i = right - (str.length - str.indexOf('.') - 1); i > 0; i--) {
            str = str + "0";
          }
        } else if (right > 0) {
          str = str.substring(0, str.length - (numDec - right));
        } else if (right < 0) {

          str = str.substring(0, str.indexOf('.'));
        }

        if (isNegative) {
          str = "-" + str;
        }
      } else if (arguments.length === 3 && typeof arguments[0] === 'object' && arguments[0].constructor === Array && typeof arguments[1] === 'number' && typeof arguments[2] === 'number') {
        arr = arguments[0];
        left = arguments[1];
        right = arguments[2];

        str = new Array(arr.length);

        for (i = 0; i < arr.length && str !== undefined; i++) {
          test = this.nf(arr[i], left, right);
          if (test === undefined) {
            str = undefined;
          } else {
            str[i] = test;
          }
        }
      }

      return str;
    };

    ////////////////////////////////////////////////////////////////////////////
    // String Functions
    ////////////////////////////////////////////////////////////////////////////
    p.matchAll = function matchAll(aString, aRegExp) {
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

    String.prototype.replaceAll = function(re, replace) {
      return this.replace(new RegExp(re, "g"), replace);
    };

    String.prototype.equals = function equals(str) {
      return this.valueOf() === str.valueOf();
    };

    String.prototype.toCharArray = function() {
      var chars = this.split("");
      for (var i = chars.length - 1; i >= 0; i--) {
        chars[i] = new Char(chars[i]);
      }
      return chars;
    };

    p.match = function(str, regexp) {
      return str.match(regexp);
    };

    // tinylog lite JavaScript library
    /*global tinylog,print*/
    var tinylogLite = (function() {
      "use strict";

      var tinylogLite = {},
        undef = "undefined",
        func = "function",
        False = !1,
        True = !0,
        log = "log";

      if (typeof tinylog !== undef && typeof tinylog[log] === func) {
        // pre-existing tinylog present
        tinylogLite[log] = tinylog[log];
      } else if (typeof document !== undef && !document.fake) {
        (function() {
          // DOM document
          var doc = document,

          $div = "div",
            $style = "style",
            $title = "title",

          containerStyles = {
            zIndex: 10000,
            position: "fixed",
            bottom: "0px",
            width: "100%",
            height: "15%",
            fontFamily: "sans-serif",
            color: "#ccc",
            backgroundColor: "black"
          },
            outputStyles = {
            position: "relative",
            fontFamily: "monospace",
            overflow: "auto",
            height: "100%",
            paddingTop: "5px"
          },
            resizerStyles = {
            height: "5px",
            marginTop: "-5px",
            cursor: "n-resize",
            backgroundColor: "darkgrey"
          },
            closeButtonStyles = {
            position: "absolute",
            top: "5px",
            right: "20px",
            color: "#111",
            MozBorderRadius: "4px",
            webkitBorderRadius: "4px",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "normal",
            textAlign: "center",
            padding: "3px 5px",
            backgroundColor: "#333",
            fontSize: "12px"
          },
            entryStyles = {
            //borderBottom: "1px solid #d3d3d3",
            minHeight: "16px"
          },
            entryTextStyles = {
            fontSize: "12px",
            margin: "0 8px 0 8px",
            maxWidth: "100%",
            whiteSpace: "pre-wrap",
            overflow: "auto"
          },

          view = doc.defaultView,
            docElem = doc.documentElement,
            docElemStyle = docElem[$style],

          setStyles = function() {
            var i = arguments.length,
              elemStyle, styles, style;

            while (i--) {
              styles = arguments[i--];
              elemStyle = arguments[i][$style];

              for (style in styles) {
                if (styles.hasOwnProperty(style)) {
                  elemStyle[style] = styles[style];
                }
              }
            }
          },

          observer = function(obj, event, handler) {
            if (obj.addEventListener) {
              obj.addEventListener(event, handler, False);
            } else if (obj.attachEvent) {
              obj.attachEvent("on" + event, handler);
            }
            return [obj, event, handler];
          },
            unobserve = function(obj, event, handler) {
            if (obj.removeEventListener) {
              obj.removeEventListener(event, handler, False);
            } else if (obj.detachEvent) {
              obj.detachEvent("on" + event, handler);
            }
          },
            clearChildren = function(node) {
            var children = node.childNodes,
              child = children.length;

            while (child--) {
              node.removeChild(children.item(0));
            }
          },
            append = function(to, elem) {
            return to.appendChild(elem);
          },
            createElement = function(localName) {
            return doc.createElement(localName);
          },
            createTextNode = function(text) {
            return doc.createTextNode(text);
          },

          createLog = tinylogLite[log] = function(message) {
            // don't show output log until called once
            var uninit, originalPadding = docElemStyle.paddingBottom,
              container = createElement($div),
              containerStyle = container[$style],
              resizer = append(container, createElement($div)),
              output = append(container, createElement($div)),
              closeButton = append(container, createElement($div)),
              resizingLog = False,
              previousHeight = False,
              previousScrollTop = False,

            updateSafetyMargin = function() {
              // have a blank space large enough to fit the output box at the page bottom
              docElemStyle.paddingBottom = container.clientHeight + "px";
            },
              setContainerHeight = function(height) {
              var viewHeight = view.innerHeight,
                resizerHeight = resizer.clientHeight;

              // constrain the container inside the viewport's dimensions
              if (height < 0) {
                height = 0;
              } else if (height + resizerHeight > viewHeight) {
                height = viewHeight - resizerHeight;
              }

              containerStyle.height = height / viewHeight * 100 + "%";

              updateSafetyMargin();
            },
              observers = [
              observer(doc, "mousemove", function(evt) {
              if (resizingLog) {
                setContainerHeight(view.innerHeight - evt.clientY);
                output.scrollTop = previousScrollTop;
              }
            }),

              observer(doc, "mouseup", function() {
              if (resizingLog) {
                resizingLog = previousScrollTop = False;
              }
            }),

              observer(resizer, "dblclick", function(evt) {
              evt.preventDefault();

              if (previousHeight) {
                setContainerHeight(previousHeight);
                previousHeight = False;
              } else {
                previousHeight = container.clientHeight;
                containerStyle.height = "0px";
              }
            }),

              observer(resizer, "mousedown", function(evt) {
              evt.preventDefault();
              resizingLog = True;
              previousScrollTop = output.scrollTop;
            }),

              observer(resizer, "contextmenu", function() {
              resizingLog = False;
            }),

              observer(closeButton, "click", function() {
              uninit();
            })
              ];

            uninit = function() {
              // remove observers
              var i = observers.length;

              while (i--) {
                unobserve.apply(tinylogLite, observers[i]);
              }

              // remove tinylog lite from the DOM
              docElem.removeChild(container);
              docElemStyle.paddingBottom = originalPadding;

              clearChildren(output);
              clearChildren(container);

              tinylogLite[log] = createLog;
            };

            setStyles(
            container, containerStyles, output, outputStyles, resizer, resizerStyles, closeButton, closeButtonStyles);

            closeButton[$title] = "Close Log";
            append(closeButton, createTextNode("\u2716"));

            resizer[$title] = "Double-click to toggle log minimization";

            docElem.insertBefore(container, docElem.firstChild);

            tinylogLite[log] = function(message) {
              var entry = append(output, createElement($div)),
                entryText = append(entry, createElement($div));

              entry[$title] = (new Date()).toLocaleTimeString();

              setStyles(
              entry, entryStyles, entryText, entryTextStyles);

              append(entryText, createTextNode(message));
              output.scrollTop = output.scrollHeight;
            };

            tinylogLite[log](message);
          };
        }());
      } else if (typeof print === func) { // JS shell
        tinylogLite[log] = print;
      }

      return tinylogLite;
    }()),

    logBuffer = [];

    p.console = window.console || tinylogLite;

    p.println = function println(message) {
      var bufferLen = logBuffer.length;
      if (bufferLen) {
        tinylogLite.log(logBuffer.join(""));
        logBuffer.length = 0; // clear log buffer
      }

      if (arguments.length === 0 && bufferLen === 0) {
        tinylogLite.log("");
      } else if (arguments.length !== 0) {
        tinylogLite.log(message);
      }
    };

    p.print = function print(message) {
      logBuffer.push(message);
    };

    // Alphanumeric chars arguments automatically converted to numbers when
    // passed in, and will come out as numbers. 
    p.str = function str(val) {
      var ret;

      if (arguments.length === 1) {
        if (typeof val === "string" && val.length === 1) {
          // No strings allowed.
          ret = val;
        } else if (typeof val === "object" && val.constructor === Array) {
          ret = new Array(0);

          for (var i = 0; i < val.length; i++) {
            ret[i] = str(val[i]);
          }
        } else {
          ret = val + "";
        }
      }

      return ret;
    };

    p.trim = function(str) {
      var newstr;
      if (typeof str === "object" && str.constructor === Array) {
        newstr = new Array(0);
        for (var i = 0; i < str.length; i++) {
          newstr[i] = p.trim(str[i]);
        }
      } else {
        // if str is not an array then remove all whitespace, tabs, and returns
        newstr = str.replace(/^\s*/, '').replace(/\s*$/, '').replace(/\r*$/, '');
      }
      return newstr;
    };

    // Conversion
    p['boolean'] = function(val) {
      if (typeof val === 'number') {
        return val !== 0;
      } else if (typeof val === 'boolean') {
        return val;
      } else if (typeof val === 'string') {
        return val.toLowerCase() === 'true';
      } else if (val instanceof Char) {
        // 1, T or t
        return val.code === 49 || val.code === 84 || val.code === 116;
      } else if (typeof val === 'object' && val.constructor === Array) {
        var ret = new Array(val.length);
        for (var i = 0; i < val.length; i++) {
          ret[i] = p['boolean'](val[i]);
        }
        return ret;
      }
    };

    // a byte is a number between -128 and 127
    p['byte'] = function(aNumber) {
      if (typeof aNumber === 'object' && aNumber.constructor === Array) {
        var bytes = [];
        for (var i = 0; i < aNumber.length; i++) {
          bytes[i] = p['byte'](aNumber[i]);
        }
        return bytes;
      } else {
        return (0 - (aNumber & 0x80)) | (aNumber & 0x7F);
      }
    };

    p['char'] = function(key) {
      if (arguments.length === 1 && typeof key === "number") {
        return new Char(String.fromCharCode(key & 0xFFFF));
      } else if (arguments.length === 1 && typeof key === "object" && key.constructor === Array) {
        var ret = new Array(key.length);
        for (var i = 0; i < key.length; i++) {
          ret[i] = p['char'](key[i]);
        }
        return ret;
      } else {
        throw "char() may receive only one argument of type int, byte, int[], or byte[].";
      }
    };

    // Processing doc claims good argument types are: int, char, byte, boolean,
    // String, int[], char[], byte[], boolean[], String[].
    // floats should not work. However, floats with only zeroes right of the
    // decimal will work because JS converts those to int.
    p['float'] = function(val) {
      if (arguments.length === 1) {
        if (typeof val === 'number') {
          return val;
        } else if (typeof val === 'boolean') {
          return val ? 1 : 0;
        } else if (typeof val === 'string') {
          return parseFloat(val);
        } else if (val instanceof Char) {
          return val.code;
        } else if (typeof val === 'object' && val.constructor === Array) {
          var ret = new Array(val.length);
          for (var i = 0; i < val.length; i++) {
            ret[i] = p['float'](val[i]);
          }
          return ret;
        }
      }
    };

    p['int'] = function(val) {
      if (typeof val === 'number') {
        return val & 0xFFFFFFFF;
      } else if (typeof val === 'boolean') {
        return val ? 1 : 0;
      } else if (typeof val === 'string') {
        var number = parseInt(val, 10); // Force decimal radix. Don't convert hex or octal (just like p5)
        return number & 0xFFFFFFFF;
      } else if (val instanceof Char) {
        return val.code;
      } else if (typeof val === 'object' && val.constructor === Array) {
        var ret = new Array(val.length);
        for (var i = 0; i < val.length; i++) {
          if (typeof val[i] === 'string' && !/^\s*[+\-]?\d+\s*$/.test(val[i])) {
            ret[i] = 0;
          } else {
            ret[i] = p['int'](val[i]);
          }
        }
        return ret;
      }
    };

    ////////////////////////////////////////////////////////////////////////////
    // Math functions
    ////////////////////////////////////////////////////////////////////////////
    // Calculation
    p.abs = Math.abs;

    p.ceil = Math.ceil;

    p.constrain = function(aNumber, aMin, aMax) {
      return aNumber > aMax ? aMax : aNumber < aMin ? aMin : aNumber;
    };

    p.dist = function() {
      var dx, dy, dz;
      if (arguments.length === 4) {
        dx = arguments[0] - arguments[2];
        dy = arguments[1] - arguments[3];
        return Math.sqrt(dx * dx + dy * dy);
      } else if (arguments.length === 6) {
        dx = arguments[0] - arguments[3];
        dy = arguments[1] - arguments[4];
        dz = arguments[2] - arguments[5];
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
      }
    };

    p.exp = Math.exp;

    p.floor = Math.floor;

    p.lerp = function(value1, value2, amt) {
      return ((value2 - value1) * amt) + value1;
    };

    p.log = Math.log;

    p.mag = function(a, b, c) {
      if (arguments.length === 2) {
        return Math.sqrt(a * a + b * b);
      } else if (arguments.length === 3) {
        return Math.sqrt(a * a + b * b + c * c);
      }
    };

    p.map = function(value, istart, istop, ostart, ostop) {
      return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
    };

    p.max = function() {
      if (arguments.length === 2) {
        return arguments[0] < arguments[1] ? arguments[1] : arguments[0];
      } else {
        var numbers = arguments.length === 1 ? arguments[0] : arguments; // if single argument, array is used
        if (! ("length" in numbers && numbers.length > 0)) {
          throw "Non-empty array is expected";
        }
        var max = numbers[0],
          count = numbers.length;
        for (var i = 1; i < count; ++i) {
          if (max < numbers[i]) {
            max = numbers[i];
          }
        }
        return max;
      }
    };

    p.min = function() {
      if (arguments.length === 2) {
        return arguments[0] < arguments[1] ? arguments[0] : arguments[1];
      } else {
        var numbers = arguments.length === 1 ? arguments[0] : arguments; // if single argument, array is used
        if (! ("length" in numbers && numbers.length > 0)) {
          throw "Non-empty array is expected";
        }
        var min = numbers[0],
          count = numbers.length;
        for (var i = 1; i < count; ++i) {
          if (min > numbers[i]) {
            min = numbers[i];
          }
        }
        return min;
      }
    };

    p.norm = function(aNumber, low, high) {
      return (aNumber - low) / (high - low);
    };

    p.pow = Math.pow;

    p.round = Math.round;

    p.sq = function(aNumber) {
      return aNumber * aNumber;
    };

    p.sqrt = Math.sqrt;

    // Trigonometry 
    p.acos = Math.acos;

    p.asin = Math.asin;

    p.atan = Math.atan;

    p.atan2 = Math.atan2;

    p.cos = Math.cos;

    p.degrees = function(aAngle) {
      return (aAngle * 180) / Math.PI;
    };

    p.radians = function(aAngle) {
      return (aAngle / 180) * Math.PI;
    };

    p.sin = Math.sin;

    p.tan = Math.tan;

    // Random
    p.Random = function() {
      var haveNextNextGaussian = false,
        nextNextGaussian;

      this.nextGaussian = function() {
        if (haveNextNextGaussian) {
          haveNextNextGaussian = false;
          return nextNextGaussian;
        } else {
          var v1, v2, s;
          do {
            v1 = 2 * p.random(1) - 1; // between -1.0 and 1.0
            v2 = 2 * p.random(1) - 1; // between -1.0 and 1.0
            s = v1 * v1 + v2 * v2;
          }
          while (s >= 1 || s === 0);

          var multiplier = Math.sqrt(-2 * Math.log(s) / s);
          nextNextGaussian = v2 * multiplier;
          haveNextNextGaussian = true;

          return v1 * multiplier;
        }
      };
    };

    p.random = function random(aMin, aMax) {
      return arguments.length === 2 ? aMin + (Math.random() * (aMax - aMin)) : Math.random() * aMin;
    };

    var noiseGen = function noiseGen(x, y) {
      var n = x + y * 57;
      n = (n << 13) ^ n;
      return Math.abs(1.0 - (((n * ((n * n * 15731) + 789221) + 1376312589) & 0x7fffffff) / 1073741824.0));
    };

    var smoothedNoise = function smoothedNoise(x, y) {
      var corners = (noiseGen(x - 1, y - 1) + noiseGen(x + 1, y - 1) + noiseGen(x - 1, y + 1) + noiseGen(x + 1, y + 1)) / 16,
        sides = (noiseGen(x - 1, y) + noiseGen(x + 1, y) + noiseGen(x, y - 1) + noiseGen(x, y + 1)) / 8,
        center = noiseGen(x, y) / 4;
      return corners + sides + center;
    };

    var interpolate = function interpolate(a, b, x) {
      var ft = x * p.PI;
      var f = (1 - Math.cos(ft)) * 0.5;
      return a * (1 - f) + b * f;
    };

    var interpolatedNoise = function interpolatedNoise(x, y) {
      var integer_X = Math.floor(x);
      var fractional_X = x - integer_X;
      var integer_Y = Math.floor(y);
      var fractional_Y = y - integer_Y;
      var v1 = smoothedNoise(integer_X, integer_Y),
        v2 = smoothedNoise(integer_X + 1, integer_Y),
        v3 = smoothedNoise(integer_X, integer_Y + 1),
        v4 = smoothedNoise(integer_X + 1, integer_Y + 1);
      var i1 = interpolate(v1, v2, fractional_X),
        i2 = interpolate(v3, v4, fractional_X);
      return interpolate(i1, i2, fractional_Y);
    };

    var perlinNoise_2D = function perlinNoise_2D(x, y) {
      var total = 0,
        p = 0.25,
        n = 3;
      for (var i = 0; i <= n; i++) {
        var frequency = Math.pow(2, i);
        var amplitude = Math.pow(p, i);
        total += interpolatedNoise(x * frequency, y * frequency) * amplitude;
      }

      return total;
    };

    // Add Thomas Saunders 3D noiseGen code here....
    var perlinNoise_3D = function perlinNoise_3D() {
      return 0;
    };

    // From: http://freespace.virgin.net/hugo.elias/models/m_perlin.htm
    p.noise = function(x, y, z) {
      switch (arguments.length) {
      case 2:
        return perlinNoise_2D(x, y);
      case 3:
        return perlinNoise_3D(x, y, z);
      case 1:
        return perlinNoise_2D(x, x);
      }
    };

    // Changes the size of the Canvas ( this resets context properties like 'lineCap', etc.
    p.size = function size(aWidth, aHeight, aMode) {
      if (aMode && (aMode === "OPENGL" || aMode === "P3D")) {
        // get the 3D rendering context
        try {
          if (!curContext) {
            curContext = curElement.getContext("experimental-webgl");
          }
        } catch(e_size) {
          Processing.debug(e_size);
        }

        if (!curContext) {
          throw "OPENGL 3D context is not supported on this browser.";
        } else {
          for (var i = 0; i < p.SINCOS_LENGTH; i++) {
            sinLUT[i] = p.sin(i * (p.PI / 180) * 0.5);
            cosLUT[i] = p.cos(i * (p.PI / 180) * 0.5);
          }
          // Set defaults
          curContext.viewport(0, 0, curElement.width, curElement.height);
          curContext.clearColor(204 / 255, 204 / 255, 204 / 255, 1.0);
          curContext.enable(curContext.DEPTH_TEST);
          curContext.enable(curContext.BLEND);
          curContext.blendFunc(curContext.SRC_ALPHA, curContext.ONE_MINUS_SRC_ALPHA);

          // Create the program objects to render 2D (points, lines) and 
          // 3D (spheres, boxes) shapes. Because 2D shapes are not lit, 
          // lighting calculations could be ommitted from that program object.
          programObject2D = createProgramObject(curContext, vertexShaderSource2D, fragmentShaderSource2D);
          programObject3D = createProgramObject(curContext, vertexShaderSource3D, fragmentShaderSource3D);

          // Now that the programs have been compiled, we can set the default
          // states for the lights.
          curContext.useProgram(programObject3D);
          p.lightFalloff(1, 0, 0);
          p.shininess(1);
          p.ambient(255, 255, 255);
          p.specular(0, 0, 0);

          // Create buffers for 3D primitives
          boxBuffer = curContext.createBuffer();
          curContext.bindBuffer(curContext.ARRAY_BUFFER, boxBuffer);
          curContext.bufferData(curContext.ARRAY_BUFFER, newWebGLArray(boxVerts), curContext.STATIC_DRAW);

          boxNormBuffer = curContext.createBuffer();
          curContext.bindBuffer(curContext.ARRAY_BUFFER, boxNormBuffer);
          curContext.bufferData(curContext.ARRAY_BUFFER, newWebGLArray(boxNorms), curContext.STATIC_DRAW);

          boxOutlineBuffer = curContext.createBuffer();
          curContext.bindBuffer(curContext.ARRAY_BUFFER, boxOutlineBuffer);
          curContext.bufferData(curContext.ARRAY_BUFFER, newWebGLArray(boxOutlineVerts), curContext.STATIC_DRAW);

          // The sphere vertices are specified dynamically since the user
          // can change the level of detail. Everytime the user does that
          // using sphereDetail(), the new vertices are calculated.
          sphereBuffer = curContext.createBuffer();

          lineBuffer = curContext.createBuffer();
          curContext.bindBuffer(curContext.ARRAY_BUFFER, lineBuffer);

          pointBuffer = curContext.createBuffer();
          curContext.bindBuffer(curContext.ARRAY_BUFFER, pointBuffer);
          curContext.bufferData(curContext.ARRAY_BUFFER, newWebGLArray([0, 0, 0]), curContext.STATIC_DRAW);

          cam = new PMatrix3D();
          cameraInv = new PMatrix3D();
          forwardTransform = new PMatrix3D();
          reverseTransform = new PMatrix3D();
          modelView = new PMatrix3D();
          modelViewInv = new PMatrix3D();
          projection = new PMatrix3D();
          p.camera();
          p.perspective();
          forwardTransform = modelView;
          reverseTransform = modelViewInv;

          userMatrixStack = new PMatrixStack();
          // used by both curve and bezier, so just init here
          curveBasisMatrix = new PMatrix3D();
          curveToBezierMatrix = new PMatrix3D();
          curveDrawMatrix = new PMatrix3D();
          bezierBasisInverse = new PMatrix3D();
          bezierBasisMatrix = new PMatrix3D();
          bezierBasisMatrix.set(-1, 3, -3, 1, 3, -6, 3, 0, -3, 3, 0, 0, 1, 0, 0, 0);
        }
        p.stroke(0);
        p.fill(255);
      } else {
        if (typeof curContext === "undefined") {
          // size() was called without p.init() default context, ie. p.createGraphics()
          curContext = curElement.getContext("2d");
          userMatrixStack = new PMatrixStack();
          modelView = new PMatrix2D();
        }
      }

      // The default 2d context has already been created in the p.init() stage if 
      // a 3d context was not specified. This is so that a 2d context will be 
      // available if size() was not called.
      var props = {
        fillStyle: curContext.fillStyle,
        strokeStyle: curContext.strokeStyle,
        lineCap: curContext.lineCap,
        lineJoin: curContext.lineJoin
      };
      curElement.width = p.width = aWidth;
      curElement.height = p.height = aHeight;

      for (var j in props) {
        if (props) {
          curContext[j] = props[j];
        }
      }

      // redraw the background if background was called before size
      if (hasBackground) {
        p.background();
      }

      p.context = curContext; // added for createGraphics
      p.toImageData = function() {
        return curContext.getImageData(0, 0, this.width, this.height);
      };
    };

    ////////////////////////////////////////////////////////////////////////////
    // 3D Functions
    ////////////////////////////////////////////////////////////////////////////
    /*
      Sets the uniform variable 'varName' to the value specified by 'value'.
      Before calling this function, make sure the correct program object 
      has been installed as part of the current rendering state.

      On some systems, if the variable exists in the shader but isn't used,
      the compiler will optimize it out and this function will fail.
    */

    function uniformf(programObj, varName, varValue) {
      var varLocation = curContext.getUniformLocation(programObj, varName);
      // the variable won't be found if it was optimized out.
      if (varLocation !== -1) {
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

    function uniformi(programObj, varName, varValue) {
      var varLocation = curContext.getUniformLocation(programObj, varName);
      // the variable won't be found if it was optimized out.
      if (varLocation !== -1) {
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

    function vertexAttribPointer(programObj, varName, size, VBO) {
      var varLocation = curContext.getAttribLocation(programObj, varName);
      if (varLocation !== -1) {
        curContext.bindBuffer(curContext.ARRAY_BUFFER, VBO);
        curContext.vertexAttribPointer(varLocation, size, curContext.FLOAT, false, 0, 0);
        curContext.enableVertexAttribArray(varLocation);
      }
    }

    function uniformMatrix(programObj, varName, transpose, matrix) {
      var varLocation = curContext.getUniformLocation(programObj, varName);
      // the variable won't be found if it was optimized out.
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

    ////////////////////////////////////////////////////////////////////////////
    // Lights
    ////////////////////////////////////////////////////////////////////////////
    p.ambientLight = function(r, g, b, x, y, z) {
      if (p.use3DContext) {
        if (lightCount === p.MAX_LIGHTS) {
          throw "can only create " + p.MAX_LIGHTS + " lights";
        }

        var pos = new PVector(x, y, z);
        var view = new PMatrix3D();
        view.scale(1, -1, 1);
        view.apply(modelView.array());
        view.mult(pos, pos);

        curContext.useProgram(programObject3D);
        uniformf(programObject3D, "lights[" + lightCount + "].color", [r / 255, g / 255, b / 255]);
        uniformf(programObject3D, "lights[" + lightCount + "].position", pos.array());
        uniformi(programObject3D, "lights[" + lightCount + "].type", 0);
        uniformi(programObject3D, "lightCount", ++lightCount);
      }
    };

    p.directionalLight = function(r, g, b, nx, ny, nz) {
      if (p.use3DContext) {
        if (lightCount === p.MAX_LIGHTS) {
          throw "can only create " + p.MAX_LIGHTS + " lights";
        }

        curContext.useProgram(programObject3D);

        // Less code than manually multiplying, but I'll fix
        // this when I have more time.
        var dir = [nx, ny, nz, 0.0000001];

        var view = new PMatrix3D();
        view.scale(1, -1, 1);
        view.apply(modelView.array());
        view.mult(dir, dir);

        uniformf(programObject3D, "lights[" + lightCount + "].color", [r / 255, g / 255, b / 255]);
        uniformf(programObject3D, "lights[" + lightCount + "].position", [-dir[0], -dir[1], -dir[2]]);
        uniformi(programObject3D, "lights[" + lightCount + "].type", 1);
        uniformi(programObject3D, "lightCount", ++lightCount);
      }
    };

    p.lightFalloff = function lightFalloff(constant, linear, quadratic) {
      if (p.use3DContext) {
        curContext.useProgram(programObject3D);
        uniformf(programObject3D, "falloff", [constant, linear, quadratic]);
      }
    };

    p.lightSpecular = function lightSpecular(r, g, b) {
      if (p.use3DContext) {
        curContext.useProgram(programObject3D);
        uniformf(programObject3D, "specular", [r / 255, g / 255, b / 255]);
      }
    };

    /*
      Sets the default ambient light, directional light,
      falloff, and specular values. P5 Documentation says specular()
      is set, but the code calls lightSpecular().
    */
    p.lights = function lights() {
      p.ambientLight(128, 128, 128);
      p.directionalLight(128, 128, 128, 0, 0, -1);
      p.lightFalloff(1, 0, 0);
      p.lightSpecular(0, 0, 0);
    };

    p.pointLight = function(r, g, b, x, y, z) {
      if (p.use3DContext) {
        if (lightCount === p.MAX_LIGHTS) {
          throw "can only create " + p.MAX_LIGHTS + " lights";
        }

        // place the point in view space once instead of once per vertex
        // in the shader.
        var pos = new PVector(x, y, z);
        var view = new PMatrix3D();
        view.scale(1, -1, 1);
        view.apply(modelView.array());
        view.mult(pos, pos);

        curContext.useProgram(programObject3D);
        uniformf(programObject3D, "lights[" + lightCount + "].color", [r / 255, g / 255, b / 255]);
        uniformf(programObject3D, "lights[" + lightCount + "].position", pos.array());
        uniformi(programObject3D, "lights[" + lightCount + "].type", 2);
        uniformi(programObject3D, "lightCount", ++lightCount);
      }
    };

    /*
      Disables lighting so the all shapes drawn after this
      will not be lit.
    */
    p.noLights = function noLights() {
      if (p.use3DContext) {
        lightCount = 0;
        curContext.useProgram(programObject3D);
        uniformi(programObject3D, "lightCount", lightCount);
      }
    };

    /*
      r,g,b - Color of the light
      x,y,z - position of the light in modeling space
      nx,ny,nz - direction of the spotlight
      angle - in radians
      concentration - 
    */
    p.spotLight = function spotLight(r, g, b, x, y, z, nx, ny, nz, angle, concentration) {
      if (p.use3DContext) {
        if (lightCount === p.MAX_LIGHTS) {
          throw "can only create " + p.MAX_LIGHTS + " lights";
        }

        curContext.useProgram(programObject3D);

        // place the point in view space once instead of once per vertex
        // in the shader.
        var pos = new PVector(x, y, z);
        var view = new PMatrix3D();
        view.scale(1, -1, 1);
        view.apply(modelView.array());
        view.mult(pos, pos);

        // transform the spotlight's direction
        // need to find a solution for this one. Maybe manual mult?
        var dir = [nx, ny, nz, 0.0000001];
        view = new PMatrix3D();
        view.scale(1, -1, 1);
        view.apply(modelView.array());
        view.mult(dir, dir);

        uniformf(programObject3D, "lights[" + lightCount + "].color", [r / 255, g / 255, b / 255]);
        uniformf(programObject3D, "lights[" + lightCount + "].position", pos.array());
        uniformf(programObject3D, "lights[" + lightCount + "].direction", [dir[0], dir[1], dir[2]]);
        uniformf(programObject3D, "lights[" + lightCount + "].concentration", concentration);
        uniformf(programObject3D, "lights[" + lightCount + "].angle", angle);
        uniformi(programObject3D, "lights[" + lightCount + "].type", 3);
        uniformi(programObject3D, "lightCount", ++lightCount);
      }
    };

    ////////////////////////////////////////////////////////////////////////////
    // Camera functions
    ////////////////////////////////////////////////////////////////////////////
    p.beginCamera = function beginCamera() {
      if (manipulatingCamera) {
        throw ("You cannot call beginCamera() again before calling endCamera()");
      } else {
        manipulatingCamera = true;
        forwardTransform = cameraInv;
        reverseTransform = cam;
      }
    };

    p.endCamera = function endCamera() {
      if (!manipulatingCamera) {
        throw ("You cannot call endCamera() before calling beginCamera()");
      } else {
        modelView.set(cam);
        modelViewInv.set(cameraInv);
        forwardTransform = modelView;
        reverseTransform = modelViewInv;
        manipulatingCamera = false;
      }
    };

    p.camera = function camera(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ) {
      if (arguments.length === 0) {
        //in case canvas is resized
        cameraX = curElement.width / 2;
        cameraY = curElement.height / 2;
        cameraZ = cameraY / Math.tan(cameraFOV / 2);
        p.camera(cameraX, cameraY, cameraZ, cameraX, cameraY, 0, 0, 1, 0);
      } else {
        var z = new p.PVector(eyeX - centerX, eyeY - centerY, eyeZ - centerZ);
        var y = new p.PVector(upX, upY, upZ);
        var transX, transY, transZ;
        z.normalize();
        var x = p.PVector.cross(y, z);
        y = p.PVector.cross(z, x);
        x.normalize();
        y.normalize();

        cam.set(x.x, x.y, x.z, 0, y.x, y.y, y.z, 0, z.x, z.y, z.z, 0, 0, 0, 0, 1);

        cam.translate(-eyeX, -eyeY, -eyeZ);

        cameraInv.reset();
        cameraInv.invApply(x.x, x.y, x.z, 0, y.x, y.y, y.z, 0, z.x, z.y, z.z, 0, 0, 0, 0, 1);

        cameraInv.translate(eyeX, eyeY, eyeZ);

        modelView.set(cam);
        modelViewInv.set(cameraInv);
      }
    };

    p.perspective = function perspective(fov, aspect, near, far) {
      if (arguments.length === 0) {
        //in case canvas is resized
        cameraY = curElement.height / 2;
        cameraZ = cameraY / Math.tan(cameraFOV / 2);
        cameraNear = cameraZ / 10;
        cameraFar = cameraZ * 10;
        cameraAspect = curElement.width / curElement.height;
        p.perspective(cameraFOV, cameraAspect, cameraNear, cameraFar);
      } else {
        var a = arguments;
        var yMax, yMin, xMax, xMin;
        yMax = near * Math.tan(fov / 2);
        yMin = -yMax;
        xMax = yMax * aspect;
        xMin = yMin * aspect;
        p.frustum(xMin, xMax, yMin, yMax, near, far);
      }
    };

    p.frustum = function frustum(left, right, bottom, top, near, far) {
      frustumMode = true;
      projection = new PMatrix3D();
      projection.set((2 * near) / (right - left), 0, (right + left) / (right - left), 0, 0, (2 * near) / (top - bottom), (top + bottom) / (top - bottom), 0, 0, 0, -(far + near) / (far - near), -(2 * far * near) / (far - near), 0, 0, -1, 0);
    };

    p.ortho = function ortho(left, right, bottom, top, near, far) {
      if (arguments.length === 0) {
        p.ortho(0, p.width, 0, p.height, -10, 10);
      } else {
        var x = 2 / (right - left);
        var y = 2 / (top - bottom);
        var z = -2 / (far - near);

        var tx = -(right + left) / (right - left);
        var ty = -(top + bottom) / (top - bottom);
        var tz = -(far + near) / (far - near);

        projection = new PMatrix3D();
        projection.set(x, 0, 0, tx, 0, y, 0, ty, 0, 0, z, tz, 0, 0, 0, 1);

        frustumMode = false;
      }
    };

    p.printProjection = function() {
      projection.print();
    };

    p.printCamera = function() {
      cam.print();
    };

    ////////////////////////////////////////////////////////////////////////////
    // Shapes
    ////////////////////////////////////////////////////////////////////////////
    p.box = function(w, h, d) {
      if (p.use3DContext) {
        // user can uniformly scale the box by  
        // passing in only one argument.
        if (!h || !d) {
          h = d = w;
        }

        // Modeling transformation
        var model = new PMatrix3D();
        model.scale(w, h, d);

        // viewing transformation needs to have Y flipped
        // becuase that's what Processing does.
        var view = new PMatrix3D();
        view.scale(1, -1, 1);
        view.apply(modelView.array());

        curContext.useProgram(programObject3D);
        uniformMatrix(programObject3D, "model", true, model.array());
        uniformMatrix(programObject3D, "view", true, view.array());
        uniformMatrix(programObject3D, "projection", true, projection.array());

        if (doFill === true) {
          // fix stitching problems. (lines get occluded by triangles
          // since they share the same depth values). This is not entirely
          // working, but it's a start for drawing the outline. So
          // developers can start playing around with styles. 
          curContext.enable(curContext.POLYGON_OFFSET_FILL);
          curContext.polygonOffset(1, 1);
          uniformf(programObject3D, "color", fillStyle);

          var v = new PMatrix3D();
          v.set(view);

          var m = new PMatrix3D();
          m.set(model);

          v.mult(m);

          var normalMatrix = new PMatrix3D();
          normalMatrix.set(v);
          normalMatrix.invert();

          uniformMatrix(programObject3D, "normalTransform", false, normalMatrix.array());

          vertexAttribPointer(programObject3D, "Vertex", 3, boxBuffer);
          vertexAttribPointer(programObject3D, "Normal", 3, boxNormBuffer);

          curContext.drawArrays(curContext.TRIANGLES, 0, boxVerts.length / 3);
          curContext.disable(curContext.POLYGON_OFFSET_FILL);
        }

        if (lineWidth > 0 && doStroke) {
          curContext.useProgram(programObject3D);
          uniformMatrix(programObject3D, "model", true, model.array());
          uniformMatrix(programObject3D, "view", true, view.array());
          uniformMatrix(programObject3D, "projection", true, projection.array());

          uniformf(programObject3D, "color", strokeStyle);
          curContext.lineWidth(lineWidth);
          vertexAttribPointer(programObject3D, "Vertex", 3, boxOutlineBuffer);
          curContext.drawArrays(curContext.LINES, 0, boxOutlineVerts.length / 3);
        }
      }
    };


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
          sphereVerts.push(parseFloat(sphereX[v1]));
          sphereVerts.push(parseFloat(sphereY[v1]));
          sphereVerts.push(parseFloat(sphereZ[v1++]));
          sphereVerts.push(parseFloat(sphereX[v2]));
          sphereVerts.push(parseFloat(sphereY[v2]));
          sphereVerts.push(parseFloat(sphereZ[v2++]));
        }

        // close each ring
        v1 = v11;
        v2 = voff;

        sphereVerts.push(parseFloat(sphereX[v1]));
        sphereVerts.push(parseFloat(sphereY[v1]));
        sphereVerts.push(parseFloat(sphereZ[v1]));
        sphereVerts.push(parseFloat(sphereX[v2]));
        sphereVerts.push(parseFloat(sphereY[v2]));
        sphereVerts.push(parseFloat(sphereZ[v2]));
      }

      // add the northern cap
      for (i = 0; i < sphereDetailU; i++) {
        v2 = voff + i;

        sphereVerts.push(parseFloat(sphereX[v2]));
        sphereVerts.push(parseFloat(sphereY[v2]));
        sphereVerts.push(parseFloat(sphereZ[v2]));
        sphereVerts.push(0);
        sphereVerts.push(1);
        sphereVerts.push(0);
      }

      sphereVerts.push(parseFloat(sphereX[voff]));
      sphereVerts.push(parseFloat(sphereY[voff]));
      sphereVerts.push(parseFloat(sphereZ[voff]));
      sphereVerts.push(0);
      sphereVerts.push(1);
      sphereVerts.push(0);

      //set the buffer data
      curContext.bindBuffer(curContext.ARRAY_BUFFER, sphereBuffer);
      curContext.bufferData(curContext.ARRAY_BUFFER, newWebGLArray(sphereVerts), curContext.STATIC_DRAW);
    };

    p.sphereDetail = function sphereDetail(ures, vres) {
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

      var delta = p.SINCOS_LENGTH / ures;
      var cx = new Array(ures);
      var cz = new Array(ures);
      // calc unit circle in XZ plane
      for (i = 0; i < ures; i++) {
        cx[i] = cosLUT[parseInt((i * delta) % p.SINCOS_LENGTH, 10)];
        cz[i] = sinLUT[parseInt((i * delta) % p.SINCOS_LENGTH, 10)];
      }

      // computing vertexlist
      // vertexlist starts at south pole
      var vertCount = ures * (vres - 1) + 2;
      var currVert = 0;

      // re-init arrays to store vertices
      sphereX = new Array(vertCount);
      sphereY = new Array(vertCount);
      sphereZ = new Array(vertCount);

      var angle_step = (p.SINCOS_LENGTH * 0.5) / vres;
      var angle = angle_step;

      // step along Y axis
      for (i = 1; i < vres; i++) {
        var curradius = sinLUT[parseInt(angle % p.SINCOS_LENGTH, 10)];
        var currY = -cosLUT[parseInt(angle % p.SINCOS_LENGTH, 10)];
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

    p.sphere = function() {
      if (p.use3DContext) {
        var sRad = arguments[0],
          c;

        if ((sphereDetailU < 3) || (sphereDetailV < 2)) {
          p.sphereDetail(30);
        }

        // Modeling transformation
        var model = new PMatrix3D();
        model.scale(sRad, sRad, sRad);

        // viewing transformation needs to have Y flipped
        // becuase that's what Processing does.
        var view = new PMatrix3D();
        view.scale(1, -1, 1);
        view.apply(modelView.array());

        curContext.useProgram(programObject3D);

        uniformMatrix(programObject3D, "model", true, model.array());
        uniformMatrix(programObject3D, "view", true, view.array());
        uniformMatrix(programObject3D, "projection", true, projection.array());

        var v = new PMatrix3D();
        v.set(view);

        var m = new PMatrix3D();
        m.set(model);

        v.mult(m);

        var normalMatrix = new PMatrix3D();
        normalMatrix.set(v);
        normalMatrix.invert();

        uniformMatrix(programObject3D, "normalTransform", false, normalMatrix.array());

        vertexAttribPointer(programObject3D, "Vertex", 3, sphereBuffer);
        vertexAttribPointer(programObject3D, "Normal", 3, sphereBuffer);

        if (doFill === true) {
          // fix stitching problems. (lines get occluded by triangles
          // since they share the same depth values). This is not entirely
          // working, but it's a start for drawing the outline. So
          // developers can start playing around with styles. 
          curContext.enable(curContext.POLYGON_OFFSET_FILL);
          curContext.polygonOffset(1, 1);

          uniformf(programObject3D, "color", fillStyle);

          curContext.drawArrays(curContext.TRIANGLE_STRIP, 0, sphereVerts.length / 3);
          curContext.disable(curContext.POLYGON_OFFSET_FILL);
        }

        if (lineWidth > 0 && doStroke) {
          curContext.useProgram(programObject3D);
          vertexAttribPointer(programObject3D, "Vertex", 3, sphereBuffer);

          uniformMatrix(programObject3D, "model", true, model.array());
          uniformMatrix(programObject3D, "view", true, view.array());
          uniformMatrix(programObject3D, "projection", true, projection.array());

        