window.onload = function()
{
  var canvas = document.getElementsByTagName("canvas");
  
  for ( var i = 0; i < canvas.length; i++ )
  {
    Processing( canvas[i], canvas[i].previousSibling.textContent );
  }
};
