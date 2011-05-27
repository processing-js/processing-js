String sites =  "<?xml version='1.0'?>\n"+
                "<websites>\n"+
                "  <site id='0' url='processing.org'>Processing</site>\n"+
                "  <site id='1' url='mobile.processing.org'>Processing Mobile</site>\n"+
                "</websites>";

XMLElement xml = XMLElement.parse(sites);

xml.setString("number_s", "5");
String number_s = xml.getString("number_s");
_checkEqual(number_s,"5");

xml.setInt("number_i", 5);
int number_i = xml.getInt("number_i");
_checkEqual(number_i, 5);

xml.setFloat("number_f", 5.5);
float number_f = xml.getFloat("number_f");
_checkEqual(number_f, 5.5);