
<?php
header('Content-Type: text/javascript; charset=utf8');

try
	{
	# Process command line parameters if any
	@$image_id =  $_GET['id'];
	
	# If parameters not available
	if(!isset($image_id))
		{
		$image_id = "4e25e244114d970935000051";
		}
	
	# Perform database initialization and get chapter name
	require_once("config.php"); 

	# connect
	$m = new Mongo($server, array('persist' => 'path'));
	
	# select a collection (analogous to a relational database's table)
	$collection = $m->selectDB($database)->selectCollection("images"); 

	# Perform the query to get chapter name
  $oid = new MongoId($image_id);
	
	$query = array( "_id" => $oid);
	$obj = $collection->findOne($query);
	
	if($obj != null)
		{
		echo json_encode(array("bookmarks" => $obj["bookmarks"], 
					"spacing" => $obj["spacing"], "origin" => $obj["origin"]));
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
