<?php
# Report all PHP errors (see changelog)
error_reporting(E_ALL ^ E_NOTICE);
#ini_set('display_errors','On'); 

if (!isset ($_cookie[ini_get('session.name')]))
	{
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
	$database = $_SESSION['book'];
	$base_url = "tile.php";
	$server = $_SESSION['host'];
	}
?>
