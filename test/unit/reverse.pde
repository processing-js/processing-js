float[] forward  = {1, 2, 3, 4, 5, 6, 7, 8, 9};
float[] backward = {9, 8, 7, 6, 5, 4, 3, 2, 1};
_checkIsNull(reverse(forward));
_checkEqual(forward, backward);