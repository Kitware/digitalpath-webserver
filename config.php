<?php
if (!isset ($_cookie[ini_get('session.name')])) {
  session_start();
}

// initialize a session

if (!isset($_SESSION['book'])) 
	{
	// if no data, print the form
	header('location:index.php');
	}
else
	{
	# define some variables
	$server = "amber11:27017";
	$database = $_SESSION['book'];
	$base_url = "tile.php";

#	$server = "ayodhya:27017";
#	$database = $_SESSION['book'];
#	$base_url = "http://ayodhya:82/tile.php";
	}

?>
