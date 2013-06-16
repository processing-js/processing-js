// Test the various Unit Test functions themselves
_checkEqual(1, 1);
_checkEqual([1,2], [1,2]);
_checkEqual([ [1,2], [3,4] ], [ [1,2], [3,4] ]);
_checkEqual(3.000001, 3.000002, 0.0001);
_checkEqual([3.000001, 4.000001], [3.000002, 4.000002], 0.0001);

_checkNotEqual(1, 2);
_checkNotEqual([1,3], [1,2]);
_checkNotEqual([ [1,3], [3,4] ], [ [1,2], [3,4] ]);

_checkTrue(true);
_checkTrue(1);

_checkFalse(false);
_checkFalse(0);
_checkFalse(null);

_checkIsNaN(NaN);

_checkIsNull(null);
_checkIsNull(undefined);

_checkThrows(function(){throw "Error";});
