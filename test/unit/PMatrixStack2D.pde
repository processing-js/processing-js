PMatrixStack matrix2DStack = new PMatrixStack();
PMatrix2D test1 = new PMatrix2D();
PMatrix2D test2 = new PMatrix2D();
PMatrix2D test3 = new PMatrix2D();
PMatrix2D test4 = new PMatrix2D();

test1.set(1,2,3,4,5,6);
test2.set(16,15,14,13,12,11);
matrix2DStack.load(test1);
matrix2DStack.mult(test2);
test3 = matrix2DStack.peek();
test4 = matrix2DStack.pop();

_checkEqual(test1.elements, [1,2,3,4,5,6]);
_checkEqual(test2.elements, [16,15,14,13,12,11]);
_checkEqual(test3.elements, [42,39,39,129,120,117]);
_checkEqual(test4.elements, [42,39,39,129,120,117]);
