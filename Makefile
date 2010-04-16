# Make sure $JSSHELL points to your js shell binary in .profile or .bashrc
TOOLSDIR=./tools

# Rule for making pure JS code from a .pde (runs through parser + beautify)
%.js : %.pde
	${TOOLSDIR}/pde2js.py ${JSSHELL} $?

all: release

create-release: clean
	mkdir ./release

# Version number used in naming release files.
VERSION ?= $(error Specify a version for your release (e.g., VERSION=0.5))

release: release-files zipped

release-files: pjs yui example release-docs

zipped: release-files
	gzip -c ./release/processing-${VERSION}.min.js > ./release/processing-${VERSION}.min.js.gz
	find ./release -print | zip -j ./release/processing.js-${VERSION}.zip -@

release-docs: create-release
	cp AUTHORS ./release
	cat README | sed -e 's/@VERSION@/${VERSION}/' > ./release/README
	cp LICENSE ./release
	cp CHANGELOG ./release

example: create-release pjs
	echo "<script src=\"processing-${VERSION}.js\"></script>" > ./release/example.html
	echo "<canvas datasrc=\"example.pjs\" width=\"200\" height=\"200\"></canvas>" >> ./release/example.html
	cp example.pjs ./release

pretty: create-release
	${TOOLSDIR}/jsbeautify.py ${JSSHELL} processing.js > ./release/processing-${VERSION}.js.tmp
# check for any parsing errors in pretty version of processing.js
	${JSSHELL} -f ${TOOLSDIR}/fake-dom.js -f ./release/processing-${VERSION}.js.tmp
	cat ./release/processing-${VERSION}.js.tmp | sed -e 's/@VERSION@/${VERSION}/' > ./release/processing-${VERSION}.js
	rm -f ./release/processing-${VERSION}.js.tmp

pjs: create-release
	cp processing.js ./release/processing-${VERSION}.js.tmp
# check for any parsing errors in processing.js
	${JSSHELL} -f ${TOOLSDIR}/fake-dom.js -f ./release/processing-${VERSION}.js.tmp
	cat ./release/processing-${VERSION}.js.tmp | sed -e 's/@VERSION@/${VERSION}/' > ./release/processing-${VERSION}.js
	rm -f ./release/processing-${VERSION}.js.tmp

packed: create-release
	${TOOLSDIR}/packer.py ${JSSHELL} processing.js > ./release/processing-${VERSION}.packed.js
# check for any parsing errors in packed version of processing.js
	${JSSHELL} -f ${TOOLSDIR}/fake-dom.js -f ./release/processing-${VERSION}.packed.js

minified: create-release
	${TOOLSDIR}/minifier.py ${JSSHELL} processing.js > ./release/processing-${VERSION}.jsmin.js
# check for any parsing errors in minified version of processing.js
	${JSSHELL} -f ${TOOLSDIR}/fake-dom.js -f ./release/processing-${VERSION}.jsmin.js

yui: create-release
	java -jar ${TOOLSDIR}/yui/yuicompressor-2.4.2.jar --nomunge processing.js -o ./release/processing-${VERSION}.min.js
# check for any parsing errors in compiled version of processing.js
	${JSSHELL} -f ${TOOLSDIR}/fake-dom.js -f ./release/processing-${VERSION}.min.js

check:
	${TOOLSDIR}/runtests.py ${JSSHELL}

check-release: yui
	${TOOLSDIR}/runtests.py ${JSSHELL} -l ./release/processing-${VERSION}.min.js

check-summary:
	${TOOLSDIR}/runtests.py -s ${JSSHELL}

check-lint:
	${TOOLSDIR}/jslint.py ${JSSHELL} processing.js

check-parser:
	${TOOLSDIR}/runtests.py -p ${JSSHELL}

check-unit:
	${TOOLSDIR}/runtests.py -u ${JSSHELL}

# If you want to test just one file or dir, use |make check-one TEST=<file or dir>|
TEST ?= $(error Specify a test filename/dir in TEST when using check-test)

# Most targets use commands that need a js shell path specified
JSSHELL ?= $(error Specify a valid path to a js shell binary in ~/.profile: export JSSHELL=C:\path\js.exe or /path/js)

check-one:
	${TOOLSDIR}/runtests.py ${JSSHELL} -t ${TEST}

clean:
	rm -fr ./release
