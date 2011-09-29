// Start with the map page
//window.location.replace(window.location.href.split("#")[0] + "#mappage");

var selectedFeature = null;
var showAnno = 0;

$(document).bind("mobileinit", function()
		{
	
	$.mobile.ajaxFormsEnabled = false;

});


$(document).ready(function() {
		if(window.map)
		{
		}
		else
		{	



		init();
		}


	function rotate(num)
		{
			var stri = "+=" + num + 'deg';
			if (num < 0)
				var stri = "-=" + (-num) + 'deg';
				
			mapdiv.animate({rotate: stri}, 0); 
			map.mapRotation -= num;
		}


    // fix height of content
    function fixContentHeight() {
        var header = $("div[data-role='header']:visible"),
            footer = $("div[data-role='footer']:visible"),
            content = $("div[data-role='content']:visible:visible"),
            viewHeight = $(window).height(),
            contentHeight = viewHeight - header.outerHeight() - footer.outerHeight();

        if ((content.outerHeight() +footer.outerHeight()+ header.outerHeight()) !== viewHeight) {
							contentHeight -= (content.outerHeight() - content.height() + 1);
							content.height(contentHeight);
					}

			mapcontainer = $('#mapcontainer');
			mapdiv = $('#map');

			var boundSize = tileSize *  Math.pow(2,zoomLevels-1); 
			
			var containwidth = parseFloat($('#mapcontainer').css('width'))
			var containheight = parseFloat($('#mapcontainer').css('height'))

			var hyp = parseInt(Math.sqrt(containheight * containheight + containwidth * containwidth))
			var map_top_margin = parseInt((hyp - containheight) / -2);
			var map_left_margin = parseInt((hyp - containwidth) / -2);
			
		mapdiv.css('width',hyp + "px");
		mapdiv.css('height',hyp + "px");
		mapdiv.css('cssText', 'margin-top :' + map_top_margin + 'px !important; margin-left :' + map_left_margin + 'px !important; height : ' + hyp + 'px !important; width : ' + hyp + 'px !important;');
			}

    $(window).bind("orientationchange resize pageshow", fixContentHeight);
    document.body.onload = fixContentHeight;

    // Map zoom  
    $("#plus").click(function(){
        map.zoomIn();
    });
    $("#minus").click(function(){
        map.zoomOut();
    });

		$("#rright").bind( "vclick", function(event, ui) {
			rotate(-5);
		});

		$("#rleft").bind( "vclick", function(event, ui) {
			rotate(5);
		});
		$("#show-anno").bind( "vclick", function(event, ui) {
			var themes = ["a","b","e"];
			var oldtheme = themes[showAnno];
			showAnno = showAnno + 1;
			if(showAnno === 3)
				{
				showAnno = 0;
				}					
			var newtheme = themes[showAnno];

			//alert("Changing theme from " + oldtheme + " to " + newtheme);

			$('#show-anno').attr("data-theme", newtheme).removeClass("ui-btn-up-"+oldtheme).removeClass("ui-btn-hover-"+oldtheme).addClass("ui-btn-up-"+newtheme).trigger("create");
			switch(showAnno)
				{
				case 0:
					anno.setVisibility(false);
					labels.setVisibility(false);
					break;
				case 1:
					anno.setVisibility(true);
					labels.setVisibility(false);
					break;
				case 2:
					anno.setVisibility(true);
					labels.setVisibility(true);
					break;
				default:
					break;
				}
			});

		//$("#checkbox-2").live();
			init_operations();

			$("#checkbox-2").checkboxradio();
			$("#checkbox-2").checkboxradio('disable');

});


