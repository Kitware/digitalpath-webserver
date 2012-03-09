<?php
header('Content-Type: text/javascript; charset=utf8');

try
	{
	@$username = $_POST['username']; # TODO: get/confirm username from session cookie for better security

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
	# note: all field data are recieved as strings and will be stored in the database as strings

	$followData = array();
	foreach ($followProperties as $prop)
		{
		if (array_key_exists($prop, $_POST))
			{
			$followData[$prop] = $_POST[$prop];
			}
		else
			{
			throw new Exception($prop . " not found in lead.php data");
			}
		}
	$followData['timestamp'] = new MongoDate();

	require_once("config.php"); # get $server and $database
	$conn = new Mongo('mongodb://' . $server);
	$collection = $conn->selectDB($database)->selectCollection("follow");

	$collection->update(array("username" => $username), $followData, array('upsert' => true));
	}
# Error handling
catch (Exception $e) 
	{
	# TODO: send a better failure response to client
	header("HTTP/1.1 400 Bad Request");
	return;
	}
?>

