_checkEqual(nf(200, 10),"0000000200");
_checkEqual(nf(40, 5),"00040");
_checkEqual(nf(90, 3),"090");

_checkEqual(nf(200.94, 10, 4),"0000000200.9400");
_checkEqual(nf(40.2, 5, 3),"00040.200");
_checkEqual(nf(9.012, 3, 5),"009.01200");

_checkEqual(nf(-200, 10),"-0000000200");
_checkEqual(nf(-200.94, 10, 4),"-0000000200.9400");

_checkEqual(nf(-200, 2),"-200");
// -200.95 cannot be represented as real number in binary system
// there is a loss of precision when float -> double
// _checkEqual(nf(-200.95, 2, 1),"-200.9");
// bad test even for Java, and according half/even rule we have to do
_checkEqual(nf(-200.95, 2, 1),"-201.0");

_checkEqual(nf(-200, 2),"-200");
_checkEqual(nf(-200.94, 2, 0),"-200.94");

_checkEqual(nf(-10, -1),"-10");
_checkEqual(nf(-10, -3),"-10");
        
_checkEqual(nf(-10.05, -1, -1),"-10");
_checkEqual(nf(-10.05, -1, -3),"-10");
        
_checkEqual(nf(-10.05, 3, -1),"-010");
_checkEqual(nf(-10.05, 3, -3),"-010");
        
_checkEqual(nf(-10.49, -1, -1),"-10");
_checkEqual(nf(-10.5, -1, -1),"-10");
        
_checkEqual(nf(-11.49, -1, -1),"-11");
_checkEqual(nf(-11.5, -1, -1),"-12");

String[] res1=new String[3];
res1[0]="-01";
res1[1]="20";
res1[2]="300";
int[] inp1=new int[3];
inp1[0]=-1;
inp1[1]=20;
inp1[2]=300;
_checkEqual(nf(inp1, 2),res1);

String[] res2=new String[3];
res2[0]="-001.00";
res2[1]="020.02";
res2[2]="300.01";
float[] inp2=new float[3];
inp2[0]=-1.002;
inp2[1]=20.02;
inp2[2]=300.0123;
_checkEqual(nf(inp2, 3, 2),res2);

String[] res3=new String[3];
res3[0]="-1";
res3[1]="20";
res3[2]="300";
int[] inp3=new int[3];
inp3[0]=-1;
inp3[1]=20;
inp3[2]=300;
_checkEqual(nf(inp3, -1),res3);

String[] res4=new String[3];
res4[0]="-001";
res4[1]="000";
res4[2]="000";
float[] inp4=new float[3];
inp4[0]=-1.002;
inp4[1]=0.49;
inp4[2]=0.5;
_checkEqual(nf(inp4, 3, -1),res4);

String[] res5=new String[3];
res5[0]="-001";
res5[1]="001";
res5[2]="002";
float[] inp5=new float[3];
inp5[0]=-1.002;
inp5[1]=1.49;
inp5[2]=1.5;
_checkEqual(nf(inp5, 3, -1),res5);
