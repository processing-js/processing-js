String sites =  "<?xml version='1.0'?>\n"+
                "<websites>\n"+
                "  <site id='0' url='processing.org'>Processing</site>\n"+
                "  <site id='1' url='mobile.processing.org'>Processing Mobile</site>\n"+
                "</websites>";

XMLElement xml = XMLElement.parse(sites);
XMLElement child = xml.getChild(0);
String site = child.getContent();
_checkEqual(site, "Processing");