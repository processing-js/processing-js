int attempts = 10000, buckets = 10;
double[] r = new double[attempts]; // fully random
for(int i=0;i<attempts;++i) {
  r[i] = randomGaussian();
}

randomSeed(14); // with seed
double[] r1 = new double[attempts];
for(int i=0;i<attempts;++i) {
  r1[i] = randomGaussian();
}

randomSeed(14); // with same seed
double[] r2 = new double[attempts];
for(int i=0;i<attempts;++i) {
  r2[i] = randomGaussian();
}

boolean r1r2TheSame = true;
boolean r1rTheSame = true;
for(int i=0;i<attempts;++i) {
  if( Math.abs(r1[i] - r[i]) > 0.00000000001) {
    r1rTheSame = false;
  }
  if( Math.abs(r1[i] - r2[i]) > 0.00000000001) {
    r1r2TheSame = false;
  }
}

_checkTrue(r1r2TheSame); // random with the same seeds are equal
_checkFalse(r1rTheSame); // no way fully random equal to seeded
