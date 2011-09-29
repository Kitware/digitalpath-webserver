<!doctype html>

<?php
	@$book = $_REQUEST['book'];
	@$pass = $_REQUEST['pass'];
	
	if(isset($book) && isset($pass)) 
		{
		
		if($book == "wustl" )
			{
			if($pass == "showme" || $pass == 'MOmanage')
				{
				session_start();
				$_SESSION['book'] = 'paul3';
				$_SESSION['copyright'] = "Copyright 2011 &copy Paul Bridgman";
				$_SESSION['auth'] = 'student';
				if($pass == 'MOmanage')
					{
					$_SESSION['auth'] = 'admin';
					}
				header("location:book.php");
				}
			}
		
		if($book == "hms")
			{
			if($pass == "letmein" || $pass == 'MAmanage')
				{
				session_start();
				$_SESSION['book'] = 'bev1';
				$_SESSION['copyright'] = "Copyright 2011 &copy Charles Palmer, Beverly
Faulkner-Jones and Su-jean Seo";
				$_SESSION['auth'] = 'student';
				if($pass == 'MAmanage')
					{
					$_SESSION['auth'] = 'admin';
					}
				header("location:book.php");
				}
			}
		}
?>


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
		<!-- large image specific additions  -->
		<link rel="stylesheet" href="css/mobile-map.css" type="text/css">
		<link rel="stylesheet" href="css/mobile-jq.css" type="text/css">
	</head>
	<body> 
		<!-- Index pages -->
    <div data-role="page">
        <div data-role="header" data-position='fixed' data-fullscreen='false'>
            <h1> Slide Atlas </h1>
        </div>
        
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
			    </fieldset> 

				<div data-role="fieldcontain">
						<label for="password">Password:</label>
						<input type="password" name="pass" id="password" value="" />
				</div>	

					<div><button type="submit" data-theme="a">Submit</button></div> 

    </div>
		</form>
	</body>
</html>
