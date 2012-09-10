String sites =  "<?xml version='1.0'?>\n"+
                "<websites number='2'>\n"+
                "  <site id='0' url='processing.org'>Processing</site>\n"+
                "  <site id='1' url='mobile.processing.org'>Processing Mobile</site>\n"+
                "</websites>";

XMLElement xml = XMLElement.parse(sites);
xml.removeAttribute("number");
String number = xml.getAttribute("number");
_checkIsNull(number);