String sites =  "<?xml version='1.0'?>\n"+
                "<websites>\n"+
                "  <site id='0' url='processing.org'>Processing</site>\n"+
                "  <site id='1' url='mobile.processing.org'>Processing Mobile</site>\n"+
                "</websites>";

XMLElement xml = new XMLElement(sites);
xml.setAttribute("number","5");
String number = xml.getAttribute("number");
_checkEqual(number,"5");