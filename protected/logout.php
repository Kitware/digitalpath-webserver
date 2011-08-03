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
		// Display warning if the session is not active
		echo 'No user logged in currently. Click <a href="/counter.php"> Here </a> to go to login page.';
		}
	else 
		{
		// If the session is active then log it out.	
		$name = $_SESSION['name'];
		$newtime = $_SESSION['start'];

		session_destroy();

		echo "User " . $name . ' has been logged out. Click <a href="login.php">here</a> to go back.';
		echo 'This session was active for ' . round((time() - $newtime)) . " second(s)." ;
		}
?>
</body>
</html>
