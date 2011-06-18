/**
 * This can be included in a PDE executed sketch to generate the 2D pixel data
 */
void dump2d()
{
	String s = "//[100,100]"; // The beginning of the ref test image
	loadPixels(); // load the pixel data
	for (int i = 0; i < pixels.length; i++) {
	  s = s + (int)red(pixels[i]) + "," + (int)green(pixels[i]) + "," + (int)blue(pixels[i]) + "," + (int)alpha(pixels[i]) + ",";
	}
	s = s.substring(0, s.length() - 1); // take away the last comma
	
	String[] out = new String[]{ s };
	saveStrings("out.txt", out);
}