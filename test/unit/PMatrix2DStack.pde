PMatrix2DStack matrixStack = new PMatrix2DStack();
PMatrix2D test1 = new PMatrix2D();
PMatrix2D test2 = new PMatrix2D();
PMatrix2D test3 = new PMatrix2D();
PMatrix2D test4 = new PMatrix2D();

test1.set(1,2,3,4,5,6);
test2.set(16,15,14,13,12,11);
matrixStack.load(test1);
matrixStack.mult(test2);
test3 = matrixStack.peek();
test4 = matrixStack.pop();

_checkEqual(test1.elements, [1,2,3,4,5,6]);
_checkEqual(test2.elements, [16,15,14,13,12,11]);
_checkEqual(test3.elements, [42,39,36,129,120,111]);
_checkEqual(test4.elements, [42,39,36,129,120,111]);
