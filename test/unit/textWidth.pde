// Andor Salga

size(100,100);

PFont font;
font = loadFont("Times New Roman"); 
textFont(font, 45); 

_checkEqual( 0, textWidth("i"));

textWidth("");    // 0.0
textWidth("X");  // 8.0
textWidth("XX"); // 16.0

textWidth(" ");   // 4.0
textWidth("  ");  // 8.0
textWidth("   "); // 12.0

textWidth("i"); // 3.0
textWidth("."); // 4.0
textWidth(","); // 4.0
textWidth("("); // 4.0
textWidth("_"); // 6.0
textWidth("~"); // 8.0
textWidth("#"); // 8.0
textWidth("W"); // 10.0
textWidth("@"); // 10.0

