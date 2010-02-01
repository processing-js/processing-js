Processing.js automated tests rely on a working JavaScript Shell.
You can build one for your platform by following the instructions
in tools/js/src/README-Processing-js.txt:

$ cd tools/js/src
$ autoconf213
$ mkdir opt-build
$ ../configure --disable-debug --enable-optimize
$ make


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

6) Create a release (not finished yet):

   $ make release

7) Clean out old release:

   $ make clean
