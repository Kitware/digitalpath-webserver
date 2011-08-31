<?php
# vim:tabstop=2:softtabstop=2:shiftwidth=2:noexpandtab

# Documentation
# Correct way of calling is 

# http://upload_ndpa.php

# When called with incorrect or unknown parameters returns a JSON with list of
# algorithms in list key. Also returns name = None to indicate that algorithm
# was not successfully returned

# Report all PHP errors (see changelog)
require_once("config.php"); 

@$label = $_POST["image_label"];
@$image_id = $_POST['image_id'];

if(!isset($label) || !isset($image_id))
{
header('Location: ' . $_SERVER['HTTP_REFERER']);
}
try
	{
	# connect
	$m = new Mongo($server, array('persist' => 'path'));
	
	# select a collection (analogous to a relational database's table)
	$collection = $m->selectDB($database)->selectCollection("images"); 

	# Perform the query to get chapter name
	$oid = new MongoId($image_id);
	
	$collection->update( array( "_id" => $oid), array('$set' => array("label" => $label)));

	$cursor = $collection->findOne(array( "_id" => $oid));
	$image_title = $cursor['title'];

	}
# catch exception
catch(Exception $e)
	{
	echo 'Error !!';
	echo 'Message: ' .$e->getMessage();
	return;
	}

$headstring = 'location: chapter.php?id='. $image_title;
header($headstring);
?>




