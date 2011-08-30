<!doctype html>

<?php
	@$book = $_GET['book'];
	@$pass = $_GET['pass'];
	
	if(isset($book) && isset($pass)) 
		{
		
		if($book == "wustl" )
			{
			if($pass == "MI" || $pass == 'MImanage')
				{
				session_start();
				$_SESSION['book'] = 'paul2';
				$_SESSION['auth'] = 'student';
				if($pass == 'MImanage')
					{
					$_SESSION['auth'] = 'admin';
					}
				header("location:book.php");
				}
			}
		
		if($book == "hms")
			{
			if($pass == "MA" || $pass == 'MAmanage')
				{
				session_start();
				$_SESSION['book'] = 'bev2';
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
		<title>dermatopathology atlas</title>
		<meta charset='utf-8' />
		<meta name="apple-mobile-web-app-capable" content="yes" />
		<meta name="apple-mobile-web-app-status-bar-style" content="black" />
		<meta name = "viewport" content = "width = device-width">
    <link rel="apple-touch-icon" href="favicon.ico" />
		<link href="http://code.jquery.com/mobile/latest/jquery.mobile.min.css" rel="stylesheet" type="text/css" />
		<script src="http://code.jquery.com/jquery-1.6.2.min.js"></script>
		<script src="http://code.jquery.com/mobile/latest/jquery.mobile.min.js"></script>
		<!-- large image specific additions  -->
		<link rel="stylesheet" href="css/mobile-map.css" type="text/css">
		<link rel="stylesheet" href="css/mobile-jq.css" type="text/css">
	</head>
	<body> 
		<!-- Index pages -->
    <div data-role="page">
        <div data-role="header" data-position='fixed' data-fullscreen='false'>
            <h1> Dermatopathology Atlas</h1>
        </div>
        
				<div data-role="content">
            <div id="banner">
							<h2> Digital Pathology Atlas </h2>
            </div>
            <p> Web solution for digital pathology atlas, hosts large images with tags, annotations and search capabilities </p>
            <p> This website is supported on multiple devices including iPad, iPhone and latest desktop browsers </p>
	
		<form action="index.php" data-ajax="false" method="get"> 

			<div data-role="fieldcontain"> 
			    <fieldset data-role="controlgroup"> 
			    	<legend>Please choose your affiliation:</legend> 
			         	<input type="radio" name="book" id="radio-choice-1" value="wustl" checked="checked" /> 
			         	<label for="radio-choice-1">Washington University at St. Louis</label> 
 
			         	<input type="radio" name="book" id="radio-choice-2" value="hms"  /> 
			         	<label for="radio-choice-2">Harvard Medical School</label> 
			    </fieldset> 

				<div data-role="fieldcontain">
						<label for="password">Password:</label>
						<input type="password" name="pass" id="password" value="" />
				</div>	

	
					<div><button type="submit" data-theme="a">Submit</button></div> 
 

				<div data-role="footer" class="ui-bar" data-position='fixed' data-fullscreen='false'>
					<a href="" data-role="button" data-icon="arrow-u">Up</a>
					<a href="" data-role="button" data-icon="arrow-d">Down</a>
				</div>
    </div>
		</form>
	</body>
</html>
