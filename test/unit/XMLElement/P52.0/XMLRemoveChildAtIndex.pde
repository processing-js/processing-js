String sites1 =  "<?xml version='1.0'?>\n"+
                "<websites>\n"+
                "  <site id='0' url='processing.org'>Processing</site>\n"+
                "  <site id='1' url='mobile.processing.org'>Processing Mobile</site>\n"+
                "</websites>";

String sites2 =  "<?xml version='1.0'?>\n"+
                "<websites>\n"+
                "  <site id='0' url='processing.org'>Processing</site>\n"+
                "</websites>";

XML xml1 = XML.parse(sites1);
XML xml2 = XML.parse(sites2);

xml1.removeChildAtIndex(1);
_checkTrue(xml1.equals(xml2));
_checkTrue(xml2.equals(xml1));