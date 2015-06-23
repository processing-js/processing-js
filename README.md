# Processing.js

For the project website, visit http://processingjs.org

This is the compilation repository for Processing.js, used in building the `processing.js` library from a series of Node.js flavoured commonjs modules, rather than existing as one large file as was the case in all versions up to and including  1.4.1 (released august 2012) .

The current version is 1.4.13 (released March 21, 2015)

**note:** this is not the repository for Processing, the language and IDE. Processing itself is hosted over at https://github.com/processing/processing. This is also not where to file bugs or ask questions about the "JS mode" that can be used with Processing, that project is hosted over at https://github.com/fjenett/javascript-mode-processing

## Getting Processing.js

### Bower install

`bower install Processing.js`

### NPM install

`npm install processing-js`

### Getting Processing.js the plain way

Simply grab the `processing.js` or `processing.min.js` files, include them as script on your webpage, and you're all set. See `test.html` for a simple example of using Processing.js on your pages.

## Playing with the code

Clone this project using git, and ensure you have [node.js](http://nodejs.org) installed. After cloning, install the require node packages using `npm install` in the processing-js directory. Modifying the code and building your own `processing.js` and `processing.min.js` files is then a fairly straight forward process. Modify the code as much as you want or need, then:

1. Lint: `$> grunt`
2. Test: `$> node test`

If step 1 gives you a "grunt: command not found" or similar error, run `npm install -g grunt-cli` to make sure grunt is globally installed as CLI command. If step 1 does not throw any errors, step 2 will run the Processing object through a battery of tests. Once the browser reference tests start, your `processing.js` and `processing.min.js` have been successfully built.

The test script also accepts the following optional arguments:

* `--test=testfile.pde` runs one specific test
* `--nobuild` does not build Pjs if all tests pass
* `--failonerror` terminates the run if any error occurs.
* `--noref` will not start a server process and a browser for doing ref testing.
* `--noautoref` will start a server and a browser for ref testing, but doesn't auto-start the tests.

### Manual operations

You can also perform the post-unit-test steps manually:

* Build processing.js: `$> browserify build.js -o processing.js`
* Minify processing.js: `$> node minify`
* Run test server: `$> node server`


### While the browser tests run

With the test server is running, the following urls are good to know:

* [http://localhost:3000](http://localhost:3000) - vanilla example page
* [http://localhost:3000/ref](http://localhost:3000/ref) - reference testing page
* [http://localhost:3000/perf](http://localhost:3000/perf) - performance testing page
* [http://localhost:3000/processing-helper.html](http://localhost:3000/processing-helper.html) - utility page for converting/running Processing code
