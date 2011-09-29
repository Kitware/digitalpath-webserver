<?php
# vim:tabstop=2:softtabstop=2:shiftwidth=2:noexpandtab

# Documentation
# Correct way of calling is 

# http://upload_ndpa.php

# When called with incorrect or unknown parameters returns a JSON with list of
# algorithms in list key. Also returns name = None to indicate that algorithm
# was not successfully returned

# Tests without json
# Adds 
# http://ayodhya:82/ops.php?col=images&id=4e6bf58d83ff8d0bac000000&op=change&param=test&data=99 
# Delets
# http://ayodhya:82/ops.php?col=images&id=4e6bf58d83ff8d0bac000000&op=del&param=test 
# Adds with json
# http://ayodhya:82/ops.php?col=images&id=4e6bf58d83ff8d0bac000000&op=change&param=test&data={%22center%22:[100,100],%22rotation%22:35,%22zoom%22:3}
# Report all PHP errors (see changelog)
require_once("config.php"); 

# Get the parameters

@$col = $_REQUEST['col'];  # images or chapters
@$id = $_REQUEST['id']; # id 
@$param = $_REQUEST["param"]; # parameter like label or default_view
@$data_str = $_REQUEST['data'];   # data, converts structure from json
@$op = $_REQUEST['op'];   # intended operation like add, del, change

$data = json_decode($data_str);
//var_dump($data_str);
//var_dump($data);
//return;

# Make sure the user has access rights 
# Currently check that the login is admin

if($_SESSION['auth'] != 'admin')
	{
	echo('Admin access required');
	}

# Parse the parameters and report the errors
// if(!isset($label) || !isset($image_id))
// 	{
// 	header('Location: ' . $_SERVER['HTTP_REFERER']);
// 	}
$success = false;

try
	{
	## Find the concerned image

	# connect
	$m = new Mongo($server, array('persist' => 'path'));
	
	# select a collection (analogous to a relational database's table)
	$collection = $m->selectDB($database)->selectCollection($col); 

	# Perform the query to get chapter name
	$oid = new MongoId($id);
	}
# catch exception
catch(Exception $e)
	{
	echo('Error while accessing mongo: ' .$e->getMessage());
	var_dump($col);
	var_dump($id);
	return;
	}

try
	{
	switch ($op) 
		{
		case "change":
			$success = $collection->update( array( "_id" => $oid), array('$set' => array($param => $data)));
      break;
    case "del":
			$success = $collection->update( array( "_id" => $oid), array('$unset' => array($param => 1)));
			break;
    case "add":
			# Make sure that there is no record of that kind
    default:
			echo('Unsupported operation');
			return;
			break;
		}
	}
# catch exception
catch(Exception $e)
	{
	echo('Error while operation: ' .$e->getMessage());
	return;
	}

try
	{
if($success == true)
	{	
	$headstring = 'Success, location: ' . $col . ".php?id=" . $id;
	echo($headstring);
	return;
  }
else
	{
	echo('Operation Failed, probably nothing to do');
	return;
	}
}
catch(Exception $e)
	{
	echo('Operation may be successful, but error: ' .$e->getMessage());
	return;
	}

?>




