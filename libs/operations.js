// Contains functions for interacting with the server using ops.php

(function($) {
    $.extend({
        doGet: function(url, params) {
            document.location = url + '?' + $.param(params);
        },
        doPost: function(url, params) {
            var $div = $("<div>").css("display", "none");
            var $form = $("<form method='POST'>").attr("action", url);
            $.each(params, function(name, value) {
                $("<input type='hidden'>")
                    .attr("name", name)
                    .attr("value", value)
                    .appendTo($form);
            });
            $form.appendTo($div);
            $div.appendTo("body");
            $form.submit();
        }
    });
})(jQuery);

function init_operations()
	{

	$("#renameimage").bind( "vclick", function(event, ui)
		{
		// alert($("#newname").val());
	
		$.post("ops.php", 
				{
					col:"images",
					op:"change",
					param:"label",
					data: "\"" + $("#newname").val() + "\"",
					id:imageName
				},
			function(data)
				{ 
				image_label = $("#newname").val();
				alert("Done!");
				}
			);
		});

	$("#imageoptions").bind( "vclick", function(event, ui) 
		{
		$("#newname").val(image_label);
		});

	$("#deleteimage").bind( "vclick", function(event, ui) 
		{
		// alert($("#newname").val());
	
		$.post("ops.php", 
				{
					col:"images",
					op:"change",
					param:"hide",
					id:imageName
				},
			function(data)
				{ 
				alert("The image is removed from chapter index.");
				}
			);
		});

	$("#resetrename").bind( "vclick", function(event, ui) 
		{
		// alert($("#newname").val());
	
		$.post("ops.php", 
				{
					col:"images",
					op:"del",
					param:"label",
					id:imageName
				},
			function(data)
				{ 
				image_label = image_name;
				alert("Done!");
				$("#newname").val(image_label);
				}
			);
		});

	$("#setdefault").bind( "vclick", function(event, ui) 
		{
		// alert($("#newname").val());

		startup_view["zoom"] = map.getZoom();
		var lonlat =  map.getCenter();
		startup_view["center"] = [lonlat.lon, lonlat.lat];
		startup_view["rotation"] = map.mapRotation;

		//alert(JSON.stringify(startup_view));
	 
		$.post("ops.php", 
				{
					col:"images",
					op:"change",
					param:"startup_view",
					id:imageName,
					data:JSON.stringify(startup_view)
				},
			function(data)
				{ 
				alert("Done!");
				}
			);
		});


	$("#deldefault").bind( "vclick", function(event, ui) 
		{
		// alert($("#newname").val());
		$.post("ops.php", 
				{
					col:"images",
					op:"del",
					param:"startup_view",
					id:imageName,
				},
			function(data)
				{ 
				alert("Startup view is now reset");
				}
			);
		});

	}
