/**
 * This can be included in a PDE executed sketch to generate the 3D pixel data
 */
void dump3d()
{
	String s = "//[100,100]"; // The beginning of the ref test image
	loadPixels(); // load the pixel data
	int index = 0;
	for (int i = height-1; i >= 0; i--) {
	  for (int j = 0; j < width; j++) {
		index = i * width + j;
		s = s + (int)red(pixels[index]) + "," + (int)green(pixels[index]) + "," + (int)blue(pixels[index]) + "," + (int)alpha(pixels[index]) + ",";
	  }
	}
	s = s.substring(0, s.length() - 1); // take away the last comma

	String[] out = new String[]{ s };
	saveStrings("out.txt", out);
}