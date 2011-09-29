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

	$("#renameimage").bind( "vclick", function(event, ui) {
		// alert($("#newname").val());
	
	$.post("ops.php", {
			col:"images",
			op:"change",
			param:"label",
			data: "\"" + $("#newname").val() + "\"",
			id:imageName
	},function(data){ alert("Loaded");}
);

	});
}
