// Simple classes and functions can be declared in a static library

// Registering complex numbers library
Processing.registerLibrary("complex", {
  init: function(defaultScope) {
    function ComplexNumber(re, im) {
      this.re = re;
      this.im = im || 0;
    }
    ComplexNumber.prototype.add = function(other) {
      return new ComplexNumber(this.re + other.re, this.im + other.im);
    };
    ComplexNumber.prototype.mul = function(other) {
      return new ComplexNumber(this.re * other.re - this.im * other.im, 
        this.im * other.re + this.re * other.im);
    };
    // etc
    ComplexNumber.prototype.toString = function(other) {
      return this.re + " " + this.im + "i";
    };
    // attaching class to the default scope
    defaultScope.ComplexNumber = ComplexNumber;
  }
});
