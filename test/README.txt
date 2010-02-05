Processing.js automated tests rely on a working JavaScript Shell.
The easiest way to do this is to build one from source.  First you
will need a working Mozilla build environment:

https://developer.mozilla.org/en/Build_Documentation

Next, obtain the Firefox source code:

$ hg clone http://hg.mozilla.org/mozilla-central

Now configure and build the source (NOTE: use the appropriate
autoconf v 2.13 for your system, autoconf213, autoconf-2.13, etc.):

$ cd mozilla-central/js/src
$ autoconf213
$ mkdir opt-build
$ ../configure --disable-debug --enable-optimize
$ make

This should produce a working JavaScript Shell at:

mozilla-central/js/src/opt-build/js

You should update the Makefile with the path to your js executable:

JS=/path/to/your/js/src/opt-build/js

Once you have a working JS Shell, you can run tests and do other
tasks like so:

1) Run all tests (unit, parser):

   $ make check

2) Run only parser tests:

   $ make check-parser

3) Run only unit tests:

   $ make check-unit

4) Run only one test, or tests under a particular dir:

   $ make check-one TEST=/path/to/single/test.js

   or

   $ make check-one TEST=/path/to/dir/with/tests

5) Parse a Processing file into JavaScript:

   $ make /path/to/processing-pde-file.js

   For example, given /tmp/foo.pde (note the extension):

   $ make /tmp/foo.js

6) Create a release:

   $ make release

7) Clean out old release:

   $ make clean

8) Check Processing.js for errors (jslint):

   $ make check-lint

