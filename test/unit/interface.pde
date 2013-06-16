interface I {
  static final int A = 1;
}

interface J {
  static final int B = 2;
}

interface K extends I, J {
}

_checkEqual(K.A, 1);
_checkEqual(K.B, 2);

class C implements K {
}

_checkEqual(C.A, 1);
