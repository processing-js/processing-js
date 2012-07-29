String sites =  "<?xml version='1.0'?>\n"+
                "<websites>\n"+
                "  <site id='0' url='processing.org'>Processing</site>\n"+
                "  <site id='1' url='mobile.processing.org'>Processing Mobile</site>\n"+
                "</websites>";

String site1 = "<site id='0' url='processing.org'>Processing</site>";
String site2 = "<site id='1' url='mobile.processing.org'>Processing Mobile</site>";
String site3 = "<site id='2' url='processingjs.org'>Processing JS</site>";

XML xml = XML.parse(sites);
XML child1 = XML.parse(site1);
XML child2 = XML.parse(site2);
XML child3 = XML.parse(site3);

int numSites = xml.getChildCount();
_checkEqual(numSites,2);

xml.removeChild(child3);
numSites = xml.getChildCount();
_checkEqual(numSites,2);

xml.removeChild(child2);
numSites = xml.getChildCount();
_checkEqual(numSites,1);

xml.removeChild(child1);
numSites = xml.getChildCount();
_checkEqual(numSites,0);
