
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
	
	# connect
	$m = new Mongo('amber11:27017', array('persist' => 'path'));
	
	# select a collection (analogous to a relational database's table)
	$collection = $m->selectDB("book")->selectCollection("images"); 

	# Perform the query to get chapter name
  $oid = new MongoId($image_id);
	
	$query = array( "_id" => $oid);
	$obj = $collection->findOne($query);

	echo json_encode($obj["bookmarks"]);
	}

# Error handling	
catch (Exception $e) 
	{
	return;
	}
?>
