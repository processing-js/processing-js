String sites =  "<?xml version='1.0'?>\n"+
                "<websites>\n"+
                "  <site id='0' url='processing.org'>Processing</site>\n"+
                "  <site id='1' url='mobile.processing.org'>Processing Mobile</site>\n"+
                "</websites>";
String site = "<site id='3' url='processingjs.org'>Processing JavaScript</site>\n";

XML xml = XML.parse(sites);
XML child = XML.parse(site);
int numSites = xml.getChildCount();
_checkEqual(numSites,2);

xml.addChild(child);
numSites = xml.getChildCount();
_checkEqual(numSites,3);
