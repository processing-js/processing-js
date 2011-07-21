var unsupportedP5 = ["open","createOutput","createInput","BufferedReader","selectFolder",
                     "dataPath","createWriter","selectOutput","saveStream","beginRecord",
                     "saveStream","endRecord","selectInput","saveBytes","createReader",
                     "beginRaw","endRaw","PrintWriter"],
    count = unsupportedP5.length;

while (count--) {
  _checkThrows(unsupportedP5[count]);
}
