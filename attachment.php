<?php
# vim:tabstop=2:softtabstop=2:shiftwidth=2:noexpandtab
require_once("config.php"); 
//var_dump($_SESSION['book']);
# Process the command line parameters
@$id = $_GET['id'];

//header('content-type: image/jpeg');
# Return grey image as there is error or parameters not set
header('content-type: application/octet-stream');

# If parameters not available
if(!isset($id))
  {
	return;
  }
try
	{
	# Connect
	$m = new Mongo($server);
	$db = $m->selectDB($database);
	$grid = $db->getGridFS("attachments");
	$mid = new MongoId($id);
	$file = $grid->get($mid);
	// It will be called downloaded.pdf
	header('content-type: application/octet-stream');
	header('Content-Disposition: attachment; filename="' . $file->getFilename()  . '"');
	echo $file->getBytes();
	}
	catch(Exception $e)
	{
	header("HTTP/1.0 404 Not Found");
	}
?>
