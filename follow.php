<?php
header('Content-Type: text/javascript; charset=utf8');

# sample data will be 
# db['users'].insert({'name':'dhandeo@gmail.com', 'zoom':2, 'cenx':100, 'ceny':100, 'image':'4e537737e982f508a8000001'})

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
	$m = new Mongo($server);
	
	# select a collection (analogous to a relational database's table)
	$collection = $m->selectDB($database)->selectCollection("users"); 

	# Perform the query to get chapter name
	
	$query = array( "name" => $username);
	$obj = $collection->findOne($query);
	
	if($obj != null)
		{
		echo json_encode(array(
					"image" => $obj["image"], 
					"zoom" => $obj["zoom"],
					"cenx" => $obj["cenx"], 
					"ceny" => $obj["ceny"],
					"rotation" => $obj["rotation"],
					"anno" => $obj["anno"],
					"curx" => $obj["curx"], 
					"cury" => $obj["cury"]));
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
