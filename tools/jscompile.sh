#/bin/sh

TOOLSDIR=`dirname $0`
PROCESSINGJS=$TOOLSDIR/../processing.js

$JSSHELL -f $PROCESSINGJS -e "var s, code; while((s=readline()) !== null) code+=s+'\\n'; var sketch=Processing.compile(code); print(sketch.sourceCode);"

