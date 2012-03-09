<?php
header('Content-Type: text/javascript; charset=utf8');

try
	{
	@$username = $_REQUEST['username'];
	if(!isset($username))
		{
		header("HTTP/1.1 400 Bad Request");
		return;
		}

	require_once("config.php"); # get $server and $database
	$conn = new Mongo('mongodb://' . $server);
	$collection = $conn->selectDB($database)->selectCollection("follow");

	$followDoc = $collection->findOne(array("username" => $username));

	if($followDoc != null )
		{
		$followTimeout = 30;
		if (time() - $followDoc['timestamp']->sec <= $followTimeout) # only send data for recently-updated sessions
			{
			$followProperties = array(
				'username',
				'img',
				'sess',
				'zoom',
				'cenx',
				'ceny',
				'rotation',
				'bookmarks',
				'curx',
				'cury'
				);

			$followData = array();
			foreach ($followProperties as $prop)
				{
				$followData[$prop] = $followDoc[$prop];
				}
			echo json_encode($followData);
			return;
			}
		else
			{
			# delete expired sessions
			$collection->remove(array("username" => $username));
			}
		}
	# if data wasn't sent
	header("HTTP/1.1 204 No Content");
	}
# Error handling
catch (Exception $e)
	{
	# TODO: send a better failure response to client
	header("HTTP/1.1 500 Internal Server Error");
	return;
	}
?>

