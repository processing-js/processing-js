// Tests multiple array []'s declared seperated by a comma.

int array1[] = {1, 2}, array2[] = {3, 4, 5};

_checkEqual(array1[1], 2);
_checkEqual(array2[1], 4);

