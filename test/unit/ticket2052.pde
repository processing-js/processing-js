void return1() {
	return
		1 == 1;
}

void return2() {
	return

		1 == 1;
}

void return3() {
	return 1 == 1;
}

_checkEqual(return1(), true);
_checkEqual(return2(), true);
_checkEqual(return3(), true);
