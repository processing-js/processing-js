Processing.js
=============

*EXPERIMENTAL NODE COMPILE BRANCH*

This is an experimental branch for Processing.js that builds up Pjs as a series of modules, rather than existing as one large file.

Clone the usual way, check out the nodecompile branch, install the node packages with `npm install`. Then it's a fairly straight forward process:

1. Lint: `$> grunt`
2. Test: `$> node test`

If step 1. gives you a "grunt: command not found" or similar error, run `npm install -g grunt-cli` to make sure grunt is globally installed as CLI command.

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

*Note: this branch is still under development.*
