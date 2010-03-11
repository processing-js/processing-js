// Make sure a file with no @pjs directive has the basic empty elements.
_checkNotEqual(pjs, null);
_checkNotEqual(pjs, undefined);
_checkNotEqual(pjs.imageCache, null);
_checkNotEqual(pjs.imageCache, undefined);
_checkEqual(pjs.imageCache.pending, 0);
