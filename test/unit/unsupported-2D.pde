var unsupported2D = ["frustum"],
    count = unsupported2D.length;

while (count--) {
  _checkThrows(unsupported2D[count]);
}
