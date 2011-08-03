<?php
# Logging in with Google $accounts requires setting special identity, so this example shows how to do it.
require 'openid.php';
try 
	{
	# Change 'localhost' to your domain name.
	$openid = new LightOpenID('localhost:82');
	if(!$openid->mode) 
		{
		if(isset($_GET['login'])) 
			{
			$openid->identity = 'https://www.google.com/accounts/o8/id';
			$openid->required = array('namePerson/friendly', 'contact/email'); $openid->optional = array('namePerson/first');
			header('Location: ' . $openid->authUrl());
			}
	?>
	<form action="?login" method="post">
	<button>Login with Google</button>
	</form>
	<?php
		} 
	elseif($openid->mode == 'cancel') 
		{
		echo 'User has canceled authentication!';
		} 
	else 
		{
		$arr = $openid->getAttributes();
		if($openid->validate())
			{
				session_start();
        $_SESSION['name'] = $arr['contact/email']; 
        $_SESSION['start'] = time(); 
				
        header('Location:protected.php');  // PUT YOUR PAGE/URL HERE.... I THINK THIS SHOULD DO THE TRICK !!! 
			}
		else
			{
			echo 'User has not logged in';
			}
		}
	} 
catch(ErrorException $e) 
	{
	echo $e->getMessage();
	}
