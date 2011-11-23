<?php
# Report all PHP errors (see changelog)
error_reporting(E_ALL ^ E_NOTICE);
#ini_set('display_errors','On'); 

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
#	$server = "127.0.0.1:27017";
# 	$server = "slide-atlas.org:27017"
	$database = $_SESSION['book'];
	$base_url = "tile.php";
	#$server = "140.247.106.249:27017";
	#	$server = "amber11:27017";
#	$database = $_SESSION['book'];
#	$base_url = "tile.php";

	$server = "ayodhya:27017";
#	$database = $_SESSION['book'];
#	$base_url = "http://ayodhya:82/tile.php";
	}

?>
