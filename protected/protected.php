<?php

// initialize a session
session_start();
?>
<html>
<head></head>
<body>

<?php
if (!isset($_SESSION['name'])) 
	{
	// if no data, print the form
	header('location:login.php');
	}
else
	{
	if(time() - $_SESSION['last_activity'] > 20)
	{
	echo ('Your login expired due to inactivity');
	echo ('</br> redirecting to login page n 5 seconds');
	header('Refresh: 5; URL=login.php');
	}
	else
	{
	$_SESSION['last_activity'] = time();
  echo "Welcome, " . $_SESSION['name'] . ". This is protected content. <br/>";
	$newtime = $_SESSION['start'];
	echo 'This session is active for ' . round((time() - $newtime)) . " second(s).<br/>" ;
	echo "Click <a href=" . $_SERVER['PHP_SELF'] . ">here</a> to refresh the page.";
  echo '<br/> Click <a href="logout.php"> here </a> to logout.' ;
}
}
?>
</body>
</html>
