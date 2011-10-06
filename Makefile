#############################################################################################
# NOTES:
#
# This Makefile assumes that you have the following installed, setup:
#
#  python
#  java
#  Unixy shell (use msys on Windows)
#  $JSSHELL environment variable in .profile or .bashrc pointing to a SpiderMonkey binary
#  If on Windows, $FIND environment variable in .profile or .bashrc for unixy find cmd
#############################################################################################

JSSHELL ?= $(error Specify a valid path to a js shell binary in ~/.profile: export JSSHELL=C:\path\js.exe or /path/js)

# If you want to test just one file or dir, use |make check-one TEST=<file or dir>|
TEST ?= $(error Specify a test filename/dir in TEST when using check-test)

# Version number used in naming release files. Defaults to git commit sha.
VERSION ?= $(shell git show -s --pretty=format:%h)

# On Windows?  You can specify a FIND value for your cygwin/msys find command
FIND ?= /usr/bin/find

TMP := .__tmp_file__
QUIET := > $(TMP) ; rm -f $(TMP)

EMPTY :=
SRC_DIR :=.
P5 :=processing
PJS :=$(P5).js
PJS_SRC :=$(SRC_DIR)/$(PJS)
PJS_VERSION :=$(P5)-$(VERSION)
PJS_VERSION_FULL :=$(P5)-js-$(VERSION)
PJS_API_SUFFIX := -API

RELEASE_DIR :=$(SRC_DIR)/release
PJS_RELEASE_PREFIX :=$(RELEASE_DIR)/$(PJS_VERSION)
PJS_RELEASE_SRC :=$(PJS_RELEASE_PREFIX).js
PJS_RELEASE_MIN :=$(PJS_RELEASE_PREFIX).min.js
EXAMPLE_HTML :=$(RELEASE_DIR)/example.html
EXAMPLES_DIR :=$(PJS_RELEASE_PREFIX)-examples

TOOLS_DIR :=$(SRC_DIR)/tools
FAKE_DOM :=$(TOOLS_DIR)/fake-dom.js
CLOSUREJAR :=$(TOOLS_DIR)/closure/compiler.jar
YUIJAR :=$(TOOLS_DIR)/yui/yuicompressor-2.4.6.jar
RUNTESTS :=@@$(TOOLS_DIR)/runtests.py $(JSSHELL)
RUNJS :=@@$(JSSHELL) -f $(FAKE_DOM) -f

SKETCHRUN :=runSketch
SKETCHINPUT ?=$(error Specify an input filename in SKETCHINPUT when using package-sketch)
SKETCHOUTPUTSRC ?=$(SKETCHINPUT).src
SKETCHOUTPUT ?=$(SKETCHINPUT).js

preprocess =@@$(JSSHELL) -f $(TOOLS_DIR)/jspreprocess.js -e "PARSER=false;preprocess();" < $(2) >> $(1)

# Both Google Closure and YUI are in our tree.  Switch compile below to whichever.
compile_closure =@@java -jar $(CLOSUREJAR) --js="$(1)" --js_output_file="$(2)" $(3) --jscomp_off=nonStandardJsDocs
compile_yui =@@java -jar $(YUIJAR) -o "$(2)" "$(1)"
compile=$(compile_yui)

copydir = @@cp -R "$(1)" "$(2)" $(QUIET) && $(FIND) $(RELEASE_DIR) -type f \( -iname '*.DS_Store'  -o \
                                                                              -iname 'desktop.ini' -o \
                                                                              -iname 'Thumbs.db'      \) -delete
addlicense = @@cat $(SRC_DIR)/LICENSE-HEADER | sed -e 's/@VERSION@/$(VERSION)$(2)/' > $(RELEASE_DIR)/addlicense.tmp && \
             cat $(1) >> $(RELEASE_DIR)/addlicense.tmp && \
             rm -f $(1) && \
             mv $(RELEASE_DIR)/addlicense.tmp $(1)
addversion = @@cp $(1) addversion.tmp && \
             rm -f $(1) && \
             cat addversion.tmp | sed -e 's/@VERSION@/$(VERSION)$(2)/' > $(1) && \
             rm -f addversion.tmp

# Rule for making pure JS code from a .pde (runs through parser + beautify)
%.js : %.pde
	@@$(TOOLS_DIR)/pde2js.py $(JSSHELL) $?

release: release-files zipped examples check-release ref-testing
	@@echo "Release Created, see $(RELEASE_DIR)"

check: check-lint check-closure check-globals check-submodules check-summary

release-dir: clean
	@@mkdir $(RELEASE_DIR)

all: release

release-files: $(PJS_RELEASE_SRC) closure api-only example release-docs extensions web-server

web-server: release-dir
	@@echo "Copying httpd.py to release..."
	@@cp $(TOOLS_DIR)/httpd.py $(RELEASE_DIR)

zipped: release-files
	@@echo "Creating zipped archives..."
	@@gzip -9 -c $(PJS_RELEASE_MIN) > $(PJS_RELEASE_MIN).gz
	@@cd $(RELEASE_DIR); $(FIND) . -print | zip $(PJS_VERSION_FULL).zip -@ $(QUIET)

release-docs: release-dir
	@@echo "Copying project release docs..."
	@@cp $(SRC_DIR)/AUTHORS $(RELEASE_DIR)
	@@cp $(SRC_DIR)/README.md $(RELEASE_DIR)/README.md
	@@$(call addversion,$(RELEASE_DIR)/README.md,$(EMPTY))
	@@cp $(SRC_DIR)/LICENSE $(RELEASE_DIR) $(QUIET)
	@@cp $(SRC_DIR)/CHANGELOG $(RELEASE_DIR) $(QUIET)

example: $(PJS_RELEASE_SRC)
	@@echo "Creating example.html..."
	@@cat $(SRC_DIR)/example.html | sed -e 's/src="processing.js"/src="$(PJS_VERSION).js"/' > $(EXAMPLE_HTML)
	@@cp $(SRC_DIR)/example.pde $(RELEASE_DIR)

examples: $(PJS_RELEASE_SRC)
	@@echo "Copying examples..."
	@@mkdir $(EXAMPLES_DIR)
	@@cp $(PJS_RELEASE_SRC) $(EXAMPLES_DIR)/$(PJS)
	@@$(call copydir,$(SRC_DIR)/examples,$(EXAMPLES_DIR))
	@@cd $(RELEASE_DIR); zip -r $(PJS_VERSION_FULL)-examples.zip $(PJS_VERSION)-examples $(QUIET)
	@@rm -fr $(EXAMPLES_DIR)

extensions: release-dir
	@@echo "Copying extensions..."
	@@$(call copydir,$(SRC_DIR)/extensions,$(RELEASE_DIR))

$(PJS_RELEASE_SRC): $(PJS_SRC) release-dir
	@@echo "Creating $(PJS_RELEASE_SRC)..."
	@@$(call compile_closure,$(PJS_SRC),$(RELEASE_DIR)/closurecompile.out,--compilation_level WHITESPACE_ONLY)
	@@$(JSSHELL) -f $(TOOLS_DIR)/fake-dom.js \
               -f $(PJS_SRC) \
               $(TOOLS_DIR)/rewrite-pconstants.js < $(RELEASE_DIR)/closurecompile.out > \
               $(RELEASE_DIR)/processing.js-no-pconstants
	@@$(TOOLS_DIR)/jsbeautify.py $(JSSHELL) $(RELEASE_DIR)/processing.js-no-pconstants > $(PJS_RELEASE_SRC)
	@@rm -f $(RELEASE_DIR)/closurecompile.out
	@@rm -f $(RELEASE_DIR)/processing.js-no-pconstants
	@@$(call addlicense,$(PJS_RELEASE_SRC),$(EMPTY))
	@@$(call addversion,$(PJS_RELEASE_SRC),$(EMPTY))
	@@$(RUNJS) $(PJS_RELEASE_SRC)

check-tests:
	$(RUNTESTS)

check-release: closure
	$(RUNTESTS) -s -l $(PJS_RELEASE_MIN)

check-submodules:
	@@echo "\nChecking for git submodules"
	@@git submodule status | awk '/^-/ { print $$2, "not found"; printMsg=1 } \
                                /^ / { print $$2, "included" } \
                                END { if (printMsg==1) { print "To add these tests to your repository, run git submodule init && git submodule update" } }'

check-summary:
	$(RUNTESTS) -s

check-lint:
	@@echo "\nRunning jslint on processing.js:"
	@@$(TOOLS_DIR)/jslint.py $(JSSHELL) $(PJS_SRC)

check-closure: release-dir
	@@echo "\nRunning closure compiler on processing.js:"
	@@$(call compile,$(PJS_SRC),$(RELEASE_DIR)/closurecompile.out,$(EMPTY))
	@@rm -f $(RELEASE_DIR)/closurecompile.out

check-parser:
	$(RUNTESTS) -p

check-unit:
	$(RUNTESTS) -u

add-coverage: release-dir
	@@cat $(PJS_SRC) | $(JSSHELL) -f $(TOOLS_DIR)/jscoverage.js > $(RELEASE_DIR)/$(P5)-cv.js

check-one:
	$(RUNTESTS) -t $(TEST)

check-coverage: add-coverage
	@@echo "Creating codecoverate.txt..."
	@@$(RUNTESTS) -l $(RELEASE_DIR)/$(P5)-cv.js -c $(RELEASE_DIR)/codecoverage.txt

check-globals:
	@@echo "\nRunning jsglobals on processing.js:"
	@@$(RUNJS) $(TOOLS_DIR)/jsglobals.js -e "findDifference()" < $(PJS_SRC)

print-globals:
	@@$(RUNJS) $(TOOLS_DIR)/jsglobals.js -e "printNames()" < $(PJS_SRC)

closure: $(PJS_RELEASE_SRC) release-dir
	@@echo "Compiling processing.js with closure..."
	@@$(call compile,$(PJS_RELEASE_SRC),$(PJS_RELEASE_MIN),$(EMPTY))
	@@$(call addlicense,$(PJS_RELEASE_MIN),$(EMPTY))
	@@$(call addversion,$(PJS_RELEASE_MIN),$(EMPTY))
	@@$(RUNJS) $(PJS_RELEASE_MIN)

compile-sketch:
	@@$(RUNJS) $(PJS_SRC) -f $(TOOLS_DIR)/jscompile.js < $(SKETCHINPUT) > $(SKETCHOUTPUT)
	@@echo "Created $(SKETCHOUTPUT)"

package-sketch: $(PJS_SRC)
	@@echo "function $(SKETCHRUN)(canvas) {" > $(SKETCHOUTPUTSRC)
	@@$(call preprocess,$(SKETCHOUTPUTSRC),$(PJS_SRC))
	@@echo "return new Processing(canvas," >> $(SKETCHOUTPUTSRC)
	@@$(RUNJS) $(PJS_SRC) -f $(TOOLS_DIR)/jscompile.js < $(SKETCHINPUT) >> $(SKETCHOUTPUTSRC)
	@@echo "); } window['$(SKETCHRUN)']=$(SKETCHRUN);" >> $(SKETCHOUTPUTSRC)
	@@$(call compile_closure,$(SKETCHOUTPUTSRC),$(SKETCHOUTPUT),--compilation_level ADVANCED_OPTIMIZATIONS)
	@@$(call addlicense,$(SKETCHOUTPUT),-Packaged)
	@@$(call addversion,$(SKETCHOUTPUT),-Packaged)
	@@rm -f $(SKETCHOUTPUTSRC)
	@@echo "Created $(SKETCHOUTPUT)"

api-only: $(PJS_SRC) release-dir
	@@echo "Creating processing.js API version..."
	@@$(call preprocess,$(PJS_RELEASE_PREFIX)-api.js,$(PJS_SRC))
	@@$(JSSHELL) -f $(TOOLS_DIR)/fake-dom.js \
               -f $(PJS_SRC) \
               $(TOOLS_DIR)/rewrite-pconstants.js < $(PJS_RELEASE_PREFIX)-api.js > \
               $(RELEASE_DIR)/processing.js-no-pconstants
	@@$(call compile_closure,$(RELEASE_DIR)/processing.js-no-pconstants,$(PJS_RELEASE_PREFIX)-api.tmp.js,--compilation_level WHITESPACE_ONLY)
	@@$(TOOLS_DIR)/jsbeautify.py $(JSSHELL) $(PJS_RELEASE_PREFIX)-api.tmp.js > $(PJS_RELEASE_PREFIX)-api.js
	@@$(call addlicense,$(PJS_RELEASE_PREFIX)-api.js,-API)
	@@$(call addversion,$(PJS_RELEASE_PREFIX)-api.js,-API)
	@@$(call compile,$(PJS_RELEASE_PREFIX)-api.js,$(PJS_RELEASE_PREFIX)-api.min.js,$(EMPTY))
	@@$(call addlicense,$(PJS_RELEASE_PREFIX)-api.min.js,$(PJS_API_SUFFIX))
	@@rm -f $(PJS_RELEASE_PREFIX)-api.tmp.js
	@@rm -f $(RELEASE_DIR)/processing.js-no-pconstants

ref-testing: closure
	@@cp -R test release
	@@cp $(PJS_RELEASE_MIN) $(RELEASE_DIR)/$(PJS)
	@@echo "Created ref-testing distribution, see $(RELEASE_DIR)/test/ref/"

clean:
	@@rm -fr $(RELEASE_DIR)
