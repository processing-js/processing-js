
int[] int1 = {1, 2, 3};
int[] int2 = {1, 2, 3};
int[] int3 = {1, 2, 4};

int[][] int4 = { {1, 2, 3}, {4, 5, 6} };
int[][] int5 = { {1, 2, 3}, {4, 5, 6} };
int[][] int6 = { {1, 2, 3}, {4, 5, 7} };

_checkEqual(2, 2);
_checkEqual("2", "2");
_checkEqual(true, true);
_checkEqual(int1, int2);
_checkEqual(int4, int5);

_checkNotEqual(3, 2);
_checkNotEqual("3", "2");
_checkNotEqual(true, false);
_checkNotEqual(int1, int3);
_checkNotEqual(int4, int6);

_checkIsNaN(NaN);
_checkIsNull(null);
_checkIsNull(undefined); // null and undefined both return true

_checkThrows(function() { throw "Exception"; });
_checkThrows(function() { return; }, false);
