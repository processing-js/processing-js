# Make sure $JSSHELL points to your js shell binary in .profile or .bashrc
TOOLSDIR=./tools
CLOSUREJAR=${TOOLSDIR}/closure/compiler.jar

# Rule for making pure JS code from a .pde (runs through parser + beautify)
%.js : %.pde
	${TOOLSDIR}/pde2js.py ${JSSHELL} $?

all: release

create-release: clean
	mkdir ./release

# Version number used in naming release files.
VERSION ?= $(error Specify a version for your release (e.g., VERSION=0.5))

release: release-files zipped examples

release-files: pjs yui closure api-only example release-docs

zipped: release-files
	gzip -9 -c ./release/processing-${VERSION}.min.js > ./release/processing-${VERSION}.min.js.gz
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

examples: pjs
	mkdir ./release/processing-js-${VERSION}-examples
	cp ./release/processing-${VERSION}.js ./release/processing-js-${VERSION}-examples/processing.js
	cp -R examples ./release/processing-js-${VERSION}-examples
	cd ./release ; zip -r processing-js-${VERSION}-examples.zip processing-js-${VERSION}-examples
	rm -fr ./release/processing-js-${VERSION}-examples

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

check: check-globals
	${TOOLSDIR}/runtests.py ${JSSHELL}

check-release: yui closure
	${TOOLSDIR}/runtests.py ${JSSHELL} -l ./release/processing-${VERSION}.min.js
	${TOOLSDIR}/runtests.py ${JSSHELL} -l ./release/processing-${VERSION}.closure.js

check-summary:
	${TOOLSDIR}/runtests.py -s ${JSSHELL}

check-lint:
	${TOOLSDIR}/jslint.py ${JSSHELL} processing.js

check-parser:
	${TOOLSDIR}/runtests.py -p ${JSSHELL}

check-unit:
	${TOOLSDIR}/runtests.py -u ${JSSHELL}

bespin: create-release
	java -jar ${TOOLSDIR}/yui/yuicompressor-2.4.2.jar --nomunge tools/ide/js/loader.js -o ./tools/ide/js/loader.min.js
	java -jar ${TOOLSDIR}/yui/yuicompressor-2.4.2.jar --nomunge tools/ide/js/bespin.js -o ./tools/ide/js/bespin.min.js
	java -jar ${TOOLSDIR}/yui/yuicompressor-2.4.2.jar --nomunge tools/ide/js/pjs-box.js -o ./tools/ide/js/pjs-box.min.js

SKETCHRUN ?= runSketch
SKETCHINPUT ?= $(error Specify an input filename in SKETCHINPUT when using package-sketch)
SKETCHOUTPUT ?= ${SKETCHINPUT}.js

closure: create-release
	java -jar ${CLOSUREJAR} --js=processing.js --js_output_file=./release/processing-${VERSION}.closure.js

check-closure: create-release
	java -jar ${CLOSUREJAR} --js=processing.js --js_output_file=./release/processing-closure.js
	${TOOLSDIR}/runtests.py ${JSSHELL} -l ./release/processing-closure.js

compile-sketch:
	${JSSHELL} -f processing.js -f ${TOOLSDIR}/jscompile.js < ${SKETCHINPUT} > ${SKETCHOUTPUT}
	echo "Created ${SKETCHOUTPUT}"

package-sketch:
	echo "function ${SKETCHRUN}(canvas) {" > ${SKETCHOUTPUT}.src
	${JSSHELL} -f ${TOOLSDIR}/jspreprocess.js -e "PARSER=false;preprocess();" < processing.js >> ${SKETCHOUTPUT}.src
	echo "return new Processing(canvas," >> ${SKETCHOUTPUT}.src
	${JSSHELL} -f ${TOOLSDIR}/fake-dom.js -f processing.js -f ${TOOLSDIR}/jscompile.js < ${SKETCHINPUT} >> ${SKETCHOUTPUT}.src
	echo "); } window['${SKETCHRUN}']=${SKETCHRUN};" >> ${SKETCHOUTPUT}.src
	java -jar ${CLOSUREJAR} --js=${SKETCHOUTPUT}.src --js_output_file=${SKETCHOUTPUT} --compilation_level ADVANCED_OPTIMIZATIONS
	rm ${SKETCHOUTPUT}.src
	echo "Created ${SKETCHOUTPUT}"

api-only: create-release
	${JSSHELL} -f ${TOOLSDIR}/jspreprocess.js -e "PARSER=false;preprocess();" < processing.js > ./release/processing-api-${VERSION}.js
	java -jar ${CLOSUREJAR} --js=./release/processing-api-${VERSION}.js \
                          --js_output_file=./release/processing-api-${VERSION}.min.js

# If you want to test just one file or dir, use |make check-one TEST=<file or dir>|
TEST ?= $(error Specify a test filename/dir in TEST when using check-test)

# Most targets use commands that need a js shell path specified
JSSHELL ?= $(error Specify a valid path to a js shell binary in ~/.profile: export JSSHELL=C:\path\js.exe or /path/js)

check-one:
	${TOOLSDIR}/runtests.py ${JSSHELL} -t ${TEST}

add-coverage: create-release
	cat processing.js | ${JSSHELL} -f ${TOOLSDIR}/jscoverage.js > ./release/processing-cv.js

check-coverage: add-coverage
	${TOOLSDIR}/runtests.py ${JSSHELL} -l ./release/processing-cv.js -c ./release/codecoverage.txt

check-globals:
	${JSSHELL} -f ${TOOLSDIR}/fake-dom.js -f ${TOOLSDIR}/jsglobals.js -e "findDifference()" < processing.js

print-globals:
	${JSSHELL} -f ${TOOLSDIR}/fake-dom.js -f ${TOOLSDIR}/jsglobals.js -e "printNames()" < processing.js

clean:
	rm -fr ./release
