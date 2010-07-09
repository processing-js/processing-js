// Make sure a file with no @pjs directive has the basic empty elements.
_checkNotEqual(externals.sketch.options, null);
_checkNotEqual(externals.sketch.options, undefined);
_checkNotEqual(externals.sketch.imageCache, null);
_checkNotEqual(externals.sketch.imageCache, undefined);
_checkEqual(externals.sketch.imageCache.pending, 0);
