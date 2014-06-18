// runtime argument handling
argv = require("argv"),
argv.option({
    name: 'test',
    type: 'string',
    description: 'Run a single test, rather than all tests.',
    example: "'node test --test=unittest.pde'"
});
argv.option({
    name: 'nobuild',
    type: 'string',
    description: 'Do not build processing.js prior to running tests.',
    example: "'node test --nobuild'"
});
argv.option({
    name: 'failonerror',
    type: 'string',
    description: 'Stop running on the first error encountered',
    example: "'node test --failonerror'"
});
argv.option({
    name: 'noref',
    type: 'string',
    description: 'Do not perform reference testing in the browser after building processing.js',
    example: "'node test --noref'"
});
argv.option({
    name: 'noautoref',
    type: 'string',
    description: 'Open the reference test page after building processing.js, but do not autorun',
    example: "'node test --noautoref'"
});
argv = argv.run().options;


// nodejs requirements
var Browser = require('./lib/Browser'),
    canvas = Browser.document.createElement("canvas"),
    exec = require('child_process').exec,
    fs = require("fs"),
    open = require('open'),
    testHarness = require("./lib/TestHarness"),
    unitDir = "./test/unit";

// script vars
var _passcount = 0,
    _failcount = 0,
    Processing = require('./src/')(Browser, testHarness);


/**
 * Run a test from the unit test directory
 */
function runTest(dir, testName) {
  var test,
      sketch;

   // shortcut on not-pde-files, for now.
  if (testName.indexOf(".pde")===-1) {

    // recurse dirs
    if(fs.statSync(dir + testName).isDirectory()) {
      runTests(dir + testName + "/");
    }

    return;
  }

  // run test for this file.
  test = fs.readFileSync(dir + testName, "utf-8");
  testHarness.prep(testName);
  try {
    sketch = new Processing(canvas, test, testHarness);
    if(sketch._failCount > 0) {
      throw "\n    [one or more tests failed]";
    }
    console.log("- " + testName + " passed.");
    _passcount++;
  }
  catch (e) {
    console.log(e);
    if (!sketch) {
      console.log("could not build sketch for " + testName);
    } else {
      console.log("    " + testName + " failed (" + sketch._failCount + " times)\n");
    }
    _failcount++;
    if (!argv.test && argv.failonerror) {
      throw new Error("fail on error specified");
    }
  }
}

/**
 * Run all tests from the unit test directory
 */
function runTests(dir, next) {
  // scan unit test directory for tests to execute
  dirContent = fs.readdirSync(dir);
  try {
    console.log();
    dirContent.forEach(function(file) {
      runTest(dir, file);
    });
  } catch (e) {
    if(argv.failonerror) {
      console.log("Failing on first error");
    } else { throw e; }
  }

  if(next) { next(); }
}

/**
 * run the tests, either with or without building
 */
var postOp = function() {
  console.log("\n"+_passcount+" tests passed, "+_failcount+" tests failed.\n");

  if(_failcount===0 && !argv.nobuild) {
    console.log("\nall tests pass: building processing.js...");
    exec('browserify build.js -o processing.js', function() {
      console.log("build finished.");
      console.log("minifying to processing.min.js");
      exec('node minify', function() {
        console.log("finished");
        if(!argv.noref) {
          console.log("\nStarting web server for reference testing...");
          console.log("Test server will terminate once all tests have run.");
          exec('node server', function(error, stdout, stderr) {
            var lines = stdout.split("\n"),
                len = lines.length,
                counts = lines[len-2].split(".").map(function(v) { return parseInt(v, 10); }),
                failed = counts[0] + counts[1],
                known = counts[1],
                passed = counts[2];
            console.log("done - "+passed+" tests passed, "+failed+" tests failed (of which "+known+" known fails).");
          });
          // open reference tests in the browser and auto-run
          open("http://localhost:3000/ref/" + (argv.noautoref ? '' : "?autorun=true"));
        }
      });
    });
  }
};
if (argv.nobuild) { postOp = function(){}; }

if (argv.test) {
  console.log("running test " + argv.test);
  runTest("./test/unit/", argv.test);
} else {
  console.log("running tests...");
  runTests("./test/unit/", postOp);
}
