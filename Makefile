#############################################################################################
# NOTES:
#
# This Makefile assumes that you have the following installed, setup:
#
#  python
#  java
#  Unixy shell (use msys on Windows)
#  $JSSHELL environment variable in .profile or .bashrc pointing to a SpiderMonkey binary
#############################################################################################

JSSHELL ?= $(error Specify a valid path to a js shell binary in ~/.profile: export JSSHELL=C:\path\js.exe or /path/js)

# If you want to test just one file or dir, use |make check-one TEST=<file or dir>|
TEST ?= $(error Specify a test filename/dir in TEST when using check-test)

# Version number used in naming release files. Defaults to DEV_VERSION
VERSION ?= DEV_VERSION

QUIET := > /dev/null 2>&1

EMPTY :=
SRC_DIR :=.
P5 :=processing
PJS :=$(P5).js
PJS_SRC :=$(SRC_DIR)/$(PJS)
PJS_VERSION :=$(P5)-$(VERSION)

RELEASE_DIR :=$(SRC_DIR)/release
PJS_RELEASE_PREFIX :=$(RELEASE_DIR)/$(PJS_VERSION)
PJS_RELEASE_SRC :=$(PJS_RELEASE_PREFIX).js
PJS_RELEASE_MIN :=$(PJS_RELEASE_PREFIX).min.js
EXAMPLE_HTML :=$(RELEASE_DIR)/example.html
EXAMPLES_DIR :=$(PJS_RELEASE_PREFIX)-examples

TOOLS_DIR :=$(SRC_DIR)/tools
FAKE_DOM :=$(TOOLS_DIR)/fake-dom.js
CLOSUREJAR :=$(TOOLS_DIR)/closure/compiler.jar
RUNTESTS :=@@$(TOOLS_DIR)/runtests.py $(JSSHELL)
RUNJS :=@@$(JSSHELL) -f $(FAKE_DOM) -f

SKETCHRUN :=runSketch
SKETCHINPUT ?=$(error Specify an input filename in SKETCHINPUT when using package-sketch)
SKETCHOUTPUTSRC ?=$(SKETCHINPUT).src
SKETCHOUTPUT ?=$(SKETCHINPUT).js

preprocess =@@$(JSSHELL) -f $(TOOLS_DIR)/jspreprocess.js -e "PARSER=false;preprocess();" < $(PJS_SRC) >> $(1)
compile =@@java -jar $(CLOSUREJAR) --js="$(1)" --js_output_file="$(2)" $(3) --jscomp_off=nonStandardJsDocs

# Rule for making pure JS code from a .pde (runs through parser + beautify)
%.js : %.pde
	@@$(TOOLS_DIR)/pde2js.py $(JSSHELL) $?

release: release-files zipped examples
	@@echo "Release Created, see $(RELEASE_DIR)"

check: check-lint check-closure check-globals check-summary

release-dir: clean
	@@mkdir $(RELEASE_DIR)

release-files: $(PJS_RELEASE_SRC) closure api-only example release-docs

zipped: release-files
	@@echo "Creating zipped archives..."
	@@gzip -9 -c $(PJS_RELEASE_MIN) > $(PJS_RELEASE_MIN).gz $(QUIET)
	@@find $(RELEASE_DIR) -print | zip -j $(PJS_RELEASE_PREFIX).zip -@ $(QUIET)

release-docs: release-dir
	@@echo "Copying project release docs..."
	@@cp $(SRC_DIR)/AUTHORS $(RELEASE_DIR)
	@@cat $(SRC_DIR)/README | sed -e 's/@VERSION@/$(VERSION)/' > $(RELEASE_DIR)/README
	@@cp $(SRC_DIR)/LICENSE $(RELEASE_DIR) $(QUIET)
	@@cp $(SRC_DIR)/CHANGELOG $(RELEASE_DIR) $(QUIET)

example: $(PJS_RELEASE_SRC)
	@@echo "Creating example.html..."
	@@echo "<script src=\"$(PJS_VERSION).js\"></script>" > $(EXAMPLE_HTML)
	@@echo "<canvas datasrc=\"example.pjs\" width=\"200\" height=\"200\"></canvas>" >> $(EXAMPLE_HTML)
	@@cp $(SRC_DIR)/example.pjs $(RELEASE_DIR)

examples: $(PJS_RELEASE_SRC)
	@@echo "Copying examples..."
	@@mkdir $(EXAMPLES_DIR)
	@@cp $(PJS_RELEASE_SRC) $(EXAMPLES_DIR)/$(PJS)
	@@cp -R $(SRC_DIR)/examples $(EXAMPLES_DIR) $(QUIET)
	@@cd $(RELEASE_DIR); zip -r $(PJS_VERSION)-examples.zip $(PJS_VERSION)-examples $(QUIET)
	@@rm -fr $(EXAMPLES_DIR)

pretty: $(PJS_RELEASE_SRC)
	@@echo "Creating beautified processing.js..."
	@@$(TOOLS_DIR)/jsbeautify.py $(JSSHELL) $(PJS_RELEASE_SRC) > $(PJS_RELEASE_SRC).tmp
	@@$(JSSHELL) -f $(FAKE_DOM) -f $(PJS_RELEASE_SRC).tmp
	@@mv $(PJS_RELEASE_SRC).tmp $(PJS_RELEASE_SRC)

$(PJS_RELEASE_SRC): release-dir
	@@echo "Creating processing.js..."
	@@cp $(PJS_SRC) $(PJS_RELEASE_SRC).tmp
	@@$(RUNJS) $(PJS_RELEASE_SRC).tmp
	@@cat $(PJS_RELEASE_SRC).tmp | sed -e 's/@VERSION@/$(VERSION)/' > $(PJS_RELEASE_SRC)
	@@rm -f $(PJS_RELEASE_SRC).tmp

check-tests:
	$(RUNTESTS)

check-release: closure
	$(RUNTESTS) -s -l $(PJS_RELEASE_MIN)

check-summary:
	$(RUNTESTS) -s

check-lint:
	@@echo "\nRunning jslint on processing.js:"
	@@$(TOOLS_DIR)/jslint.py $(JSSHELL) $(PJS_SRC)

check-closure:
	@@echo "\nRunning closure compiler on processing.js:"
	@@$(call compile,$(PJS_SRC),/dev/null,$(EMPTY))

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

closure: release-dir
	@@$(call compile,$(PJS_SRC),$(PJS_RELEASE_MIN),$(EMPTY))

compile-sketch:
	@@$(RUNJS) $(PJS_SRC) -f $(TOOLS_DIR)/jscompile.js < $(SKETCHINPUT) > $(SKETCHOUTPUT)
	@@echo "Created $(SKETCHOUTPUT)"

package-sketch:
	@@echo "function $(SKETCHRUN)(canvas) {" > $(SKETCHOUTPUTSRC)
	@@$(call preprocess,$(SKETCHOUTPUTSRC))
	@@echo "return new Processing(canvas," >> $(SKETCHOUTPUTSRC)
	@@$(RUNJS) $(PJS_SRC) -f $(TOOLS_DIR)/jscompile.js < $(SKETCHINPUT) >> $(SKETCHOUTPUTSRC)
	@@echo "); } window['$(SKETCHRUN)']=$(SKETCHRUN);" >> $(SKETCHOUTPUTSRC)
	@@$(call compile,$(SKETCHOUTPUTSRC),$(SKETCHOUTPUT),--compilation_level ADVANCED_OPTIMIZATIONS)
	@@rm -f $(SKETCHOUTPUTSRC)
	@@echo "Created $(SKETCHOUTPUT)"

api-only: release-dir
	@@echo "Creating processing.js API version..."
	@@$(call preprocess,$(PJS_RELEASE_PREFIX)-api.js)
	@@$(call compile,$(PJS_RELEASE_PREFIX)-api.js,$(PJS_RELEASE_PREFIX)-api.min.js,$(EMPTY))

clean:
	@@rm -fr $(RELEASE_DIR)
