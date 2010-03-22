// Tests for Processing dist() function

// making sure 2d wasn't broken
_checkEqual(78.10249675906654, dist(10, 20, 60, 80), 0.00001);
_checkEqual(64.03124, dist(10, 10, 50, 60), 0.00001);

// adding 3rd dimension
_checkEqual(78.10249675906654, dist(10, 20, 0, 60, 80, 0), 0.00001);
_checkEqual(79.52987111111, dist(10, 20, 10, 60, 80, 25), 0.00001);
_checkEqual(64.03124111111, dist(10, 10, 0, 50, 60, 0), 0.00001);
_checkEqual(66.79072111111, dist(10, 10, 15, 50, 60, 34), 0.00001);
_checkEqual(66.79072111111, dist(-10, -10, -15, -50, -60, -34), 0.00001);
_checkEqual(104.40785111111, dist(-10, -10, -15, 50, 60, 34), 0.00001);
_checkEqual(104.40785111111, dist(10, 10, 15, -50, -60, -34), 0.00001);
