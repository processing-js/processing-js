# If your jsshell isn't at ./tools/js/src/js, update JS below
TOOLSDIR=./tools
JS=$(TOOLSDIR)/js/src/js

# Rule for making pure JS code from a .pde (runs through parser + beautify)
%.js : %.pde
	$(TOOLSDIR)/pde2js.py $(JS) $?

all: release

create-release: clean
	mkdir ./release

release: pretty packed minified

pretty: create-release
	$(TOOLSDIR)/jsbeautify.py $(JS) processing.js > ./release/processing.js
# check for any parsing errors in pretty version of processing.js
	$(JS) -f $(TOOLSDIR)/fake-dom.js -f ./release/processing.js

packed: create-release
	$(TOOLSDIR)/packer.py $(JS) processing.js > ./release/processing-packed.js
# check for any parsing errors in packed version of processing.js
	$(JS) -f $(TOOLSDIR)/fake-dom.js -f ./release/processing-packed.js

minified: create-release
	$(TOOLSDIR)/minifier.py $(JS) processing.js > ./release/processing-min.js
# check for any parsing errors in minified version of processing.js
	$(JS) -f $(TOOLSDIR)/fake-dom.js -f ./release/processing-min.js

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
