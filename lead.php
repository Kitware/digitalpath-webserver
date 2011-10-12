<?php
header('Content-Type: text/javascript; charset=utf8');

# sample data will be 
# db['users'].insert({'name':'dhandeo@gmail.com', 'zoom':2, 'cenx':100, 'ceny':100, 'image':'4e537737e982f508a8000001'})

try
	{
	# Process command line parameters if any
	@$username = $_REQUEST['id'];
	@$cenx = $_REQUEST['cenx'];
	@$ceny = $_REQUEST['ceny'];
	@$zoom = $_REQUEST['zoom'];
	@$rotation = $_REQUEST['rotation'];
	@$image = $_REQUEST['image'];
	
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
		if(isset($zoom))
			{
			$collection->update($query,array('$set' => array("zoom" => $zoom)));
			}
		if(isset($cenx))
			{
			$collection->update($query,array('$set' => array("cenx" => $cenx)));
			}
		if(isset($ceny))
			{
			$collection->update($query,array('$set' => array("ceny" => $ceny)));
			}
		if(isset($rotation))
			{
			$collection->update($query,array('$set' => array("rotation" => $rotation)));
			}
		if(isset($image))
			{
			$collection->update($query,array('$set' => array("image" => $image)));
			}
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
