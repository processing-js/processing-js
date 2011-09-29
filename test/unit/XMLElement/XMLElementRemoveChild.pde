String sites =  "<?xml version='1.0'?>\n"+
                "<websites>\n"+
                "  <site id='0' url='processing.org'>Processing</site>\n"+
                "  <site id='1' url='mobile.processing.org'>Processing Mobile</site>\n"+
                "</websites>";

String site1 = "<site id='0' url='processing.org'>Processing</site>";
String site2 = "<site id='1' url='mobile.processing.org'>Processing Mobile</site>";
String site3 = "<site id='2' url='processingjs.org'>Processing JS</site>";

XMLElement xml = XMLElement.parse(sites);
XMLElement child1 = XMLElement.parse(site1);
XMLElement child2 = XMLElement.parse(site2);
XMLElement child3 = XMLElement.parse(site3);

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
