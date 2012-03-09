/*
from PHP:
	toFollow - not yet implemented
*/

var follow = (function()
	{
	var pub = {};

	var active;
	var state; // 'lead', 'follow'
	var followTimer;
	var leadTimer;

	// Event handlers
	function onClickFollowButton(event)
		{
		if (!active)
			{
			active = true;
			state = 'follow';
			changeButtonTheme($('#follow'), 'e');
			$('#follow .ui-btn-text').text('Stop Following');
			$('#lead').addClass('ui-disabled');
			followTimer.reset();
			}
		else
			{
			active = false;
			followTimer.stop();
			changeButtonTheme($('#follow'), 'a');
			$('#follow .ui-btn-text').text('Join Session');
			$('#lead').removeClass('ui-disabled');
			}
		}

	function onClickLeadButton(event)
		{
		if (!active)
			{
			active = true;
			state = 'lead';
			changeButtonTheme($('#lead'), 'e');
			$('#lead .ui-btn-text').text('Stop Leading');
			$('#follow').addClass('ui-disabled');
			map.registerMapEvents(
				{
				"moveend": onMapEvent
				});
/*			// TODO: verify that none of these other map events are needed
			map.registerMapEvents(
				{
				"zoomend": onMapEvent,
				"touchstart": onMapEvent
				});
			map.registerLayerEvents(
				{
				"dragend": onMapEvent,
				"moveend": onMapEvent
				});
*/
			bookmarks.registerEvent(onMapEvent);
			leadTimer.reset();
			onMapEvent();
			}
		else
			{
			active = false;
			leadTimer.stop();
			changeButtonTheme($('#lead'), 'c');
			$('#lead .ui-btn-text').text('Lead a collaborative session');
			$('#follow').removeClass('ui-disabled');
			map.unregisterAllEvents();
			bookmarks.unregisterEvent();
			}
		}

	function onMapEvent(event)
		{
		if(active && state === 'lead')
			{
			leadTimer.reset(); // note: if onMapEvent is being called by a leadTimer event, this will double-reset leadTimer, but the overhead is minimal
			$.post( // TODO: confirm from the server that data is being received and no errors
				"lead.php",
				$.extend(
					{},
					{
						username: 'dhandeo@gmail.com'
					},
					map.getState(), // img, sess, zoom, cenx, ceny, rotation
					bookmarks.getState(), // bookmarks
					{
						// TODO: add marker support
						curx: 0,
						cury: 0
					}
					)
				); // END post
			}
		}

	function updateMapFollow(followData)
		{
		// TODO: change image and session if necessary, but at least verify that we're on the same image as the followData
		map.moveTo(
			new OpenLayers.LonLat(
				parseFloat(followData['cenx']),
				parseFloat(followData['ceny'])
				),
			parseFloat(followData['zoom']),
			true // TODO: more testing to make sure smooth panning doesn't fail
			);
		map.rotateTo(parseFloat(followData['rotation']));
		if (followData['bookmarks'] !== null)
			{
			// TODO: get and update bookmarks global state
			for (var i = 0, len_i = followData['bookmarks'].length; i < len_i; i++)
				{
				bookmarks.setVisibilityState(i, parseInt(followData['bookmarks'][i]), true);
				}
			}
		// TODO: curx, cury markers
		}

	sendFollowRequest = (function() // this function self-executes once to provide a closure
		{
		var isWaiting;
		return function(evt) // this is the actual updateFollow()
			{
			if(active && state === 'follow' && !isWaiting)
				{
				isWaiting = true;
				$.ajax(
					{
					url: "follow.php",
					data:
						{
						'username': 'dhandeo@gmail.com'
						},
					cache: false,
					dataType: 'json',
					complete: function(jqXHR, textStatus)
						{
						isWaiting = false;
						},
					success:function(data, textStatus, jqXHR)
						{
						if (jqXHR.status === 200)
							{
							updateMapFollow(data);
							}
						else // typically status 204 No Content
							{
							onClickFollowButton();
							alert("No follow session available."); // TODO: better dialog
							}
						},
					error:function(jqXHR, textStatus, errorThrown)
						{
						onClickFollowButton();
						;// TODO: error handling
						}
					}); // END $.ajax
				}
			}
		})();

	// Initialization method - must be called before any others
	pub.init = function()
		{
		followTimer = $.timer(
			sendFollowRequest, // function called on interval
			300, // interval time in ms
			false // autostart
			);
		leadTimer = $.timer(
			onMapEvent,
			5000,
			false
			);

		$('#follow').on("vclick", onClickFollowButton);
		$('#follow').removeClass('ui-disabled')

		$("#lead").bind("vclick", onClickLeadButton);
		$('#lead').removeClass('ui-disabled')

		// TODO: start following if query parameter toFollow === true
		};

	return pub;
}());

