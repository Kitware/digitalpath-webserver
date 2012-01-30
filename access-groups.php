<?php
	# To be called from facebook or google submodule
	session_start();
	#print_r($_SESSION);
	#return;

	function display_user_information()
		{
		# Displays user information including group memberships 
		
		foreach ($_SESSION['facebook'] as $key => $val)
			{	
			echo $key . " " . $val . "</br>";
			} 

		foreach ($_SESSION['groups'] as $key => $val)
			{	
			echo $key . " " . $val['name'] . "</br>";
			} 
		}

	display_user_information();

	# Loads the groups database, and lists the intersection
	# Cleans up session cookie

	#Verify 

#	# Check for categorical logins
#	if(isset($book) && isset($pass)) 
#		{
#	
#		if($book == "demo" )
#			{
#				session_start();
#				$_SESSION['book'] = 'demo';
#				$_SESSION['copyright'] = "Copyright &copy 2011, All rights reserved";
#				$_SESSION['auth'] = 'admin';
#				header("location:session-index.php");
#				return;
#			}
#		
#
#		if($book == "wustl" )
#			{
#			if($pass == "showme" || $pass == 'MOmanage')
#				{
#				session_start();
#				$_SESSION['book'] = 'paul2';
#				$_SESSION['copyright'] = "Copyright &copy 2011, Paul Bridgman. All rights reserved";
#				$_SESSION['auth'] = 'student';
#				if($pass == 'MOmanage')
#					{
#					$_SESSION['auth'] = 'admin';
#					}
#				header("location:session-index.php");
#				return;
#				}
#			}
#		
#		if($book == "hms")
#			{
#			if($pass == "letmein" || $pass == 'MAmanage')
#				{
#				session_start();
#				$_SESSION['book'] = 'bev1';
#				$_SESSION['copyright'] = "Copyright &copy 2011, Charles Palmer, Beverly
#Faulkner-Jones and Su-jean Seo. All rights reserved";
#				$_SESSION['auth'] = 'student';
#				if($pass == 'MAmanage')
#					{
#					$_SESSION['auth'] = 'admin';
#					}
#				header("location:session-index.php");
#				return;
#				}
#			}
#		}
?>
