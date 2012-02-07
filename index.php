<?php
	# Logging in with Google $accounts requires setting special identity, so this example shows how to do it.
	require 'protected/openid.php';

	@$book = $_REQUEST['book'];
	@$pass = $_REQUEST['pass'];
	$openid = new LightOpenID('ayodhya:82');

	# First see if OpenID login is called 
	if(!$openid->mode) 
		{
		if(isset($_REQUEST['login']))
			{
			$openid->identity = 'https://www.google.com/accounts/o8/id';
			$openid->required = array('namePerson/friendly', 'contact/email'); $openid->optional = array('namePerson/first');
			header('Location: ' . $openid->authUrl());
			// Send the user to authorizing application
			return;
			}
		}
	elseif($openid->mode != 'cancel') 
		{
		$arr = $openid->getAttributes();
		if($openid->validate())
			{
				session_start();
				$_SESSION['name'] = $arr['contact/email']; 
				$_SESSION['start'] = time(); 
				$_SESSION['last_activity'] = time(); 
				$_SESSION['book'] = 'bev1';
				$_SESSION['copyright'] = "Copyright &copy 2011, Charles Palmer, Beverly
Faulkner-Jones and Su-jean Seo. All rights reserved";
				$_SESSION['auth'] = 'admin';
				header("location:session-index.php");
				return;
			}
		}


	# Check for categorical logins
	if(isset($book) && isset($pass)) 
		{
		
		if($book == "demo" )
			{
				session_start();
				$_SESSION['book'] = 'demo';
				$_SESSION['copyright'] = "Copyright &copy 2011, All rights reserved";
				$_SESSION['auth'] = 'admin';
				header("location:session-index.php");
				return;
			}
		

		if($book == "wustl" )
			{
			if($pass == "showme" || $pass == 'MOmanage')
				{
				session_start();
				$_SESSION['book'] = 'paul2';
				$_SESSION['copyright'] = "Copyright &copy 2011, Paul Bridgman. All rights reserved";
				$_SESSION['auth'] = 'student';
				if($pass == 'MOmanage')
					{
					$_SESSION['auth'] = 'admin';
					}
				header("location:session-index.php");
				return;
				}
			}
		
		if($book == "hms")
			{
			if($pass == "letmein" || $pass == 'MAmanage')
				{
				session_start();
				$_SESSION['book'] = 'bev1';
				$_SESSION['copyright'] = "Copyright &copy 2011, Charles Palmer, Beverly
Faulkner-Jones and Su-jean Seo. All rights reserved";
				$_SESSION['auth'] = 'student';
				if($pass == 'MAmanage')
					{
					$_SESSION['auth'] = 'admin';
					}
				header("location:session-index.php");
				return;
				}
			}
		}
?>

<!doctype html>
<html>
	<head>
		<title>Slide Atlas </title>
		<meta charset='utf-8' />
		<meta name="apple-mobile-web-app-capable" content="yes" />
		<meta name="apple-mobile-web-app-status-bar-style" content="black" />
		<meta name = "viewport" content = "width = device-width">
    <link rel="apple-touch-icon" href="favicon.ico" />

		<link rel="stylesheet" href="http://code.jquery.com/mobile/1.0b2/jquery.mobile-1.0b2.min.css" />
		<script src="http://code.jquery.com/jquery-1.6.2.min.js"></script>
		<script src="http://code.jquery.com/mobile/1.0b2/jquery.mobile-1.0b2.min.js"></script>
	</head>
	<body> 
		<!-- Index pages -->
    <div data-role="page">
			<!-- Header -->
			<div data-role="header" data-position='fixed' data-fullscreen='false'>
					<h1> Slide Atlas </h1>
			</div>
        
			<!-- Content -->
			<div data-role="content">
				<p> This website is supported on multiple devices including iPad, iPhone and the latest desktop browsers </p>

				<form action="index.php" data-ajax="false" method="post"> 
					<div data-role="fieldcontain"> 
						<fieldset data-role="controlgroup"> 
							<legend>Please choose your affiliation:</legend> 
							<input type="radio" name="book" id="radio-choice-1" value="wustl" checked="checked" /> 
							<label for="radio-choice-1">Washington University School of Medicine </label> 

							<input type="radio" name="book" id="radio-choice-2" value="hms"  /> 
							<label for="radio-choice-2">Harvard Combined Dermatology Residency Training Program </label> 
							<input type="radio" name="book" id="radio-choice-3" value="demo"  /> 
							<label for="radio-choice-3">Atlas Demonstration (no password)</label> 
						</fieldset> 

						<div data-role="fieldcontain">
							<label for="password">Password:</label>
							<input type="password" name="pass" id="password" value="" />
						</div>	
						<center>
							<div>
								<button type="submit"  data-inline='true' data-theme="a">Submit</button>
							</div> 
						</center>
					</div>
				</form>
				
				<!-- login
					Or authenticate using :
				<form action="?login" method="post" data-ajax="false">
					<center>
					<button data-theme="a" data-inline="true" data-ajax="false">Google</button>
					</center>
				</form>

				-->
				
				<!-- login -->
					Or authenticate using :
					<center>
					<a data-role="button" data-theme="a" data-inline="true" data-ajax="false" href="facebook/protected.php">Facebook</a>
					</center>
				<!-- login -->
				</form>

			</div>
		</div>
	</body>
</html>
