_checkEqual(unhex("FF006699"), -16750951);
_checkEqual(unhex("6699"), 26265);
_checkEqual(unhex("FF00"), 65280);
_checkEqual(unhex(["FF006699", "6699", "FF00"]), [-16750951, 26265, 65280]);
