var unsupportedP5 = ["open","createOutput","createInput","BufferedReader","selectFolder",
                     "dataPath","createWriter","selectOutput","beginRecord",
                     "saveStream","endRecord","selectInput","saveBytes","createReader",
                     "beginRaw","endRaw","PrintWriter","delay"],
    count = unsupportedP5.length;

while (count--) {
  _checkThrows(unsupportedP5[count]);
}
