int attempts = 10000, buckets = 10;

double[] r0 = new double[attempts],
         r1 = new double[attempts],
         r2 = new double[attempts],
         r3 = new double[attempts],
         inputs = new double[attempts];

for(int i=0; i<attempts; i++) { inputs[i] = random(255); }


// no seeding
for(int i=0;i<attempts;++i) { r0[i] = noise(inputs[i]); }

// explicit seeding
noiseSeed(14);
for(int i=0;i<attempts;++i) { r1[i] = noise(inputs[i]); }

// same explicit seeding
noiseSeed(14);
for(int i=0;i<attempts;++i) { r2[i] = noise(inputs[i]); }

// new explicit seeding
noiseSeed(414);
for(int i=0;i<attempts;++i) { r3[i] = noise(inputs[i]); }

var results = [true, true, true];

for(int i=0;i<attempts;++i) {
  if(r0[i] !== r1[i]) results[0] = false;
  if(r1[i] !== r2[i]) results[1] = false;
  if(r2[i] !== r3[i]) results[2] = false;
}

_checkFalse(results[0], "random noise without seed not equal to seeded");
_checkTrue( results[1], "random noise with the same seeds are equal");
_checkFalse(results[2], "random noise with different seeds are not equal");
