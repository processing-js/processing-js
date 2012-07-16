String sites =  "<?xml version='1.0'?>\n"+
                "<websites>\n"+
                "  <site id='0' url='processing.org'>Processing</site>\n"+
                "  <site id='1' url='mobile.processing.org'>Processing Mobile</site>\n"+
                "</websites>";
String site = "<site id='3' url='processingjs.org'>Processing JavaScript</site>\n";

XML xml = XML.parse(sites);
XML child = XML.parse(site);

// verify correct number of children
int numSites = xml.getChildCount();
_checkEqual(numSites, 2);

// verify correct number of children after insert
xml.insertChild(child,1);
numSites = xml.getChildCount();
_checkEqual(numSites, 3);

// verify correct insertion
XML child1 = xml.getChild(1);
_checkEqual(child, child1);
