// frameRate <-- __frameRate and frameRate() stays the same

// if _frameRate_ is parsed, it will become __frameRate_
// then be clobbered
// this is not what we want, only frameRate should be parsed
var frameRate_ = 1;
var __frameRate_ = 0;

_checkEqual(frameRate_, 1);

// if _frameRate is parsed, it will become ___frameRate
// then be clobbered
// this is not what we want, only frameRate should be parsed
var _frameRate = 1;
var ___frameRate = 0;

_checkEqual(_frameRate, 1);

