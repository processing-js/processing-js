Processing.js
=============

This is the compilation repository for Processing.js, building the processing.js library from a series of modules, rather than existing as one large file as was the case in version 1.4.1 and earlier.

Clone the usual way, ensure you have `node.js` installed (http://nodejs.org) and install the require node packages by typing `npm install` in the processing-js directory. Then it's a fairly straight forward process:

1. Lint: `$> grunt`
2. Test: `$> node test`

If step 1 gives you a "grunt: command not found" or similar error, run `npm install -g grunt-cli` to make sure grunt is globally installed as CLI command.

The test script accepts the following arguments:

* `--test=testfile.pde` runs one specific test
* `--nobuild` does not build Pjs if all tests pass
* `--failonerror` terminates the run if any error occurs.
* `--noref` will not start a server process and a browser for doing ref testing.
* `--noautoref` will start a server and a browser for ref testing, but doesn't auto-start the tests.

You can also perform the post-unit-test steps manually:

* Build processing.js: `$> browserify build.js -o processing.js`
* Minify processing.js: `$> node minify`
* Run test server: `$> node server`


In the browser
--------------

With the test server running, the following urls are good to know:

* http://localhost:3000 - vanilla example page
* http://localhost:3000/ref - reference testing page
* http://localhost:3000/perf - performance testing page
* http://localhost:3000/processing-helper.html - utility page for converting/running Processing code
