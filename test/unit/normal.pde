// Tests for normal(). http://processing.org/reference/normal_.html

// normal() has no return values, but at least its arguments can be checked.
_checkThrows(function(){normal("Only","Numbers","Allowed");})
_checkThrows(function(){normal(1,2);})
_checkThrows(function(){normal(1,2,3,4);})
_checkThrows(function(){normal(1,2,true);})