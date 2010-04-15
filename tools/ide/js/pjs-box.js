/*
	PJSBox Bookmarklet
	idea: @humphd
	author: @sanchothefat
	original url: http://sanchothefat.com/dev/processing/pjs-box/pjs-box.js
	using Processing.js v0.8.0
*/
(function() {

var p;

// more or less stolen form jquery core and adapted by paul irish
function getScript(url,success){
	var script=document.createElement('script');
	script.src=url;
	var head=document.getElementsByTagName('head')[0],
	done=false;
	// Attach handlers for all browsers
	script.onload=script.onreadystatechange = function(){
	if ( !done && (!this.readyState
		|| this.readyState == 'loaded'
		|| this.readyState == 'complete') ) {
		done=true;
		success();
	}
	};
	head.appendChild(script);
}

// load jQuery + PJS
function init(){
	if(typeof jQuery!='undefined') {
		getProcessing(jQuery);
	} else {
		getJquery();
	}
}
function getJquery() {
	getScript('js/processing.js',function() {
		if (typeof jQuery!='undefined') {			
			var $jq = jQuery.noConflict();
			getProcessing($jq);
		}
	});
}
function getProcessing($jq){
	if (typeof Processing=='undefined') {
		getScript('http://processingjs.org/content/download/processing-js-0.8/processing-0.8.min.js',function() {
			if (typeof Processing!='undefined') {
				PJSBox($jq);
			}
		});
	} else {
		PJSBox($jq);
	}
}

function PJSBox($jq) {

	function getSize(script) {
		/*var size = script.match(/size\([\s]*([\d]+)[\s]*\,[\s]*([\d]+)[\s]*\)/);
		if (size.length == 3) {
			return [ size[1], size[2] ];
		} else if ( size.length == 2 ) {
			return [ size[1], size[1] ];
		} else {
			return [200,200];
		}*/
    var r = "" + script.match(/size\s*\((?:.+),(?:.+)(?:,\s*(OPENGL|P3D))?\s*\)\s*;/);
    var dimensions = r.match(/[0-9]+/g);
    if (dimensions) {
      return[dimensions[0],dimensions[1]];
    }
    else{
      tinylogLite.log("Did not find a call to size(), defaulting to size(200,200)");
      return [200,200];
    }
	}

	// grab the code from bespin
	source = window.bespin.value; 
	
	var selected = source;   
  if (source != "") {
		var code = selected.toString();
		var anchor = selected.anchorNode;
		var focus = selected.focusNode;
		var codeObjText = source;//anchor.textContent;
		/*if ( anchor != focus ) {
			var fp = $jq(focus).parents();
			var ap = $jq(anchor).parents();
			for (var i=0; i<ap.length; i++) {
				if (fp.index(ap[i]) != -1) {
					if ( ap[i].tagName == "OL" || ap[i].tagName == "UL" ) {
						codeObjText = "";
						$jq("li",ap[i]).each(function(){
							codeObjText += $jq(this)[0].textContent + "\n";
						});
					}
					break;
				}
			}
		}*/
		
		var size = getSize(source);
		var cpos = {};
		
		$jq("body").append('\
<div id="pjsbox-overlay" style="z-index:100000;position:fixed;left:0;top:0;height:100%;width:100%;background:#fff;opacity:0.5;display:none;"></div>\
<div id="pjsbox" style="z-index:100001;position:fixed;left:50%;top:50%;overflow:hidden;width:0;height:0;padding:10px;border-radius:10px;-moz-border-radius:10px;-webkit-border-radius:10px;background:#fff;box-shadow:0 0 20px #353535;-webkit-box-shadow:0 0 20px #353535;-moz-box-shadow:0 0 20px #353535;">\
<div id="pjsbox-canvas" style="position:relative;"></div>\
<a id="pjsbox-close" style="display:block;display:none;position:absolute;text-decoration:none;font-weight:bold;font-family:Helvetica,sans-serif;font-size:14px;top:-12px;right:-12px;width:20px;height:20px;line-height:20px;text-align:center;background:#353535;color:#fff;-moz-border-radius:10px;-moz-box-shadow:0 0 10px #353535;-webkit-border-radius:10px;-webkit-box-shadow:0 0 10px #353535;border-radius:10px;box-shadow:0 0 10px #353535;" href="#pjsbox-closer" title="Close">&#10006;</a>\
</div>');

		$jq("#pjsbox-canvas").append('<canvas width="'+ size[0] +'" height="'+ size[1] +'"></canvas>');
		var canvas = $jq("#pjsbox-canvas canvas")[0];
		
		$jq("#pjsbox-overlay").fadeIn("normal",function(){
			$jq("#pjsbox").animate({
				width: size[0],
				height: size[1],
				marginLeft: -(size[0]/2)-10,
				marginTop: -(size[1]/2)-10
			},"slow",function(){
				try {
					p = Processing(canvas,codeObjText);
					$jq("#pjsbox-canvas canvas").bind("mousemove.shim",function(e){
						cpos = $jq("#pjsbox-canvas canvas").offset();
					});
				} catch(e) {
          tinylogLite.log("ERROR Initializing p. "+ e);
					$jq("#pjsbox-close").click();
					//alert("Might be a bad selection...\n\n" + e.message);
				}
				$jq(this).css("overflow","visible").find("#pjsbox-close").fadeIn("slow");
			});
		});
			
		$jq("#pjsbox-overlay,#pjsbox-close").click(function(){
			if(p){p.exit();}
			p = null;
			$jq("#pjsbox").fadeOut("normal",function(){
				$jq("#pjsbox-overlay").fadeOut("slow",function(){
					$jq(this).remove();
					$jq("#pjsbox").remove();
				});
			});
			return false;
		});
	}
}

init();

})();
