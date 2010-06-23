// Make sure a file with no @pjs directive has the basic empty elements.
_checkNotEqual(__sketch.options, null);
_checkNotEqual(__sketch.options, undefined);
_checkNotEqual(__sketch.imageCache, null);
_checkNotEqual(__sketch.imageCache, undefined);
_checkEqual(__sketch.imageCache.pending, 0);
