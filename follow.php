<?php
header('Content-Type: text/javascript; charset=utf8');

try
	{
	# Process command line parameters if any
	@$username = $_REQUEST['id'];

	
	# If parameters not available
	if(!isset($username))
		{
		$username = "dhandeo@gmail.com";
		}
	
	# Perform database initialization and get chapter name
	require_once("config.php"); 

	# connect
	$m = new Mongo($server, array('persist' => 'pathfollow'));
	
	# select a collection (analogous to a relational database's table)
	$collection = $m->selectDB($database)->selectCollection("users"); 

	# Perform the query to get chapter name
	
	$query = array( "name" => $username);
	$obj = $collection->findOne($query);
	
	if($obj != null)
		{
		echo json_encode(array("image" => $obj["image"], 
					"zoom" => $obj["zoom"], "center" => $obj["center"]));
		}
	else
		{
		echo json_encode(array());
		} 
	}
# Error handling	
catch (Exception $e) 
	{
	return;
	}
?>
