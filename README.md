# Processing.js

For the project website, visit http://processingjs.org

This is the compilation repository for Processing.js, used in building the `processing.js` library from a series of Node.js flavoured commonjs modules, rather than existing as one large file as was the case in all versions up to and including  1.4.1 (released august 2012) .

**note:** this is not the repository for Processing, the language and IDE. Processing itself is hosted over at https://github.com/processing/processing. This is also not where to file bugs or ask questions about the "JS mode" that can be used with Processing, that project is hosted over at https://github.com/fjenett/javascript-mode-processing

# Versioning

Processing.js adheres to [semver](http://semver.org) style versioning.

#  This project is currently in need of developers

There is currently no one working on, or maintaining, this codebase on a regular basis, so if you think you'd like to contribute to Processing.js, to bring it back in line with Processing's current API, and take advantage of the various APIs that have become available in browsers since Processing.js slowed down, we'd love to hear from you!

File an issue to say that you'd like to help out, and we can find some good places for you to get started.

## Getting Processing.js

### NPM install

This is the preferred method of installing "the latest" version of Processing.js

`npm install processing-js`

### Getting Processing.js the plain way

If you need to, you can also grab the `processing.js` or `processing.min.js` files, include them as script on your webpage, and you're all set. See `test.html` for a simple example of using Processing.js on your pages.

### Bower install

Bower is no longer recommended as a way to get processing.js, and so might not even work anymore (it "should" work but there is no verification on that)

`bower install Processing.js`

## Playing with the code

Clone this project using git, and ensure you have [node.js](http://nodejs.org) installed. After cloning, install the require node packages using `npm install` in the processing-js directory. Modifying the code and building your own `processing.js` and `processing.min.js` files is then a fairly straight forward process. Modify the code as much as you want or need, then:

1. Lint: `$> grunt`
2. Test: `$> node test`

If step 1 gives you a "grunt: command not found" or similar error, run `npm install -g grunt-cli` to make sure grunt is globally installed as CLI command. If step 1 does not throw any errors, step 2 will run the Processing object through a battery of tests. Once the browser reference tests start, your `processing.js` and `processing.min.js` have been successfully built.

### Only edit files in the ./src directory

As is implicit to the whole `processing.js` and `processing.min.js` getting rebuilt every time: remember not to edit either of these files directly. Instead, all the real source code live inside the `./src` directory, except for the `build.js` file that is used to create the library bundle. As this build file should not reasonably require any fixing, if you want to try to fix anything, or see what happens when you change something, make sure you only ever do that in files inside `./src`.

### Test script runtime flags

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

### Contributing to Processing.js

Please read ["how to contribute to Processing.js"](CONTRIBUTING.md) for how you can contribute, and what code of conduct is expected to be followed.
