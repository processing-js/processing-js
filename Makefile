# If your jsshell isn't at ./tools/js/src/js, update JS below
TOOLSDIR=./tools
JS=$(TOOLSDIR)/js/src/js

# Rule for making pure JS code from a .pde (runs through parser + beautify)
%.js : %.pde
	$(TOOLSDIR)/pde2js.py $(JS) $?

all: release

create-release: clean
	mkdir ./release

# Version number used in naming release files.
VERSION ?= $(error Specify a version for your release (e.g., VERSION=0.5))

release: release-files zipped

release-files: pretty packed minified example release-docs

zipped: release-files
	find ./release -print | zip -j ./release/processing.js-$(VERSION).zip -@

release-docs: create-release
	cp AUTHORS ./release
	cp README ./release
	cp LICENSE ./release
	cp CHANGELOG ./release

example: create-release pretty
	echo "<script src=\"processing-$(VERSION).js\"></script>" > ./release/example.html
	echo "<canvas datasrc=\"example.pjs\" width=\"200\" height=\"200\"></canvas>" >> ./release/example.html
	cp example.pjs ./release

pretty: create-release
	$(TOOLSDIR)/jsbeautify.py $(JS) processing.js > ./release/processing-$(VERSION).js
# check for any parsing errors in pretty version of processing.js
	$(JS) -f $(TOOLSDIR)/fake-dom.js -f ./release/processing-$(VERSION).js

packed: create-release
	$(TOOLSDIR)/packer.py $(JS) processing.js > ./release/processing-$(VERSION).packed.js
# check for any parsing errors in packed version of processing.js
	$(JS) -f $(TOOLSDIR)/fake-dom.js -f ./release/processing-$(VERSION).packed.js

minified: create-release
	$(TOOLSDIR)/minifier.py $(JS) processing.js > ./release/processing-$(VERSION).min.js
# check for any parsing errors in minified version of processing.js
	$(JS) -f $(TOOLSDIR)/fake-dom.js -f ./release/processing-$(VERSION).min.js

check:
	$(TOOLSDIR)/runtests.py $(JS)

check-summary:
	$(TOOLSDIR)/runtests.py -s $(JS)

check-lint:
	$(TOOLSDIR)/jslint.py $(JS) processing.js

check-parser:
	$(TOOLSDIR)/runtests.py -p $(JS)

check-unit:
	$(TOOLSDIR)/runtests.py -u $(JS)

# If you want to test just one file or dir, use |make check-one TEST=<file or dir>|
TEST ?= $(error Specify a test filename/dir in TEST when using check-test)

check-one:
	$(TOOLSDIR)/runtests.py $(JS) -t $(TEST)

clean:
	rm -fr ./release
