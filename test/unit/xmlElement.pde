// xmlElement 
// test addChild, getChildCount
XMLElement xml;
XMLElement child;
xml = new XMLElement('<websites><site id="0" url="processing.org">Processing</site><site id="1" url="mobile.processing.org">Processing Mobile</site></websites>');
child = new XMLElement("<site id='3' url='processingjs.org'>Processing JavaScript</site>");
int numSites = xml.getChildCount();

_checkEqual(numSites, 2);

