<?php
# Perform database initialization
require_once("config.php"); 
?>

<!DOCTYPE html>
<html>
	<head>
		<title>dermatopathology atlas</title>
		<meta charset='utf-8' />
		<meta name="apple-mobile-web-app-capable" content="yes" />
		<meta name="apple-mobile-web-app-status-bar-style" content="black" />
		<meta name = "viewport" content = "width = device-width">
		<link rel="apple-touch-icon" href="favicon.ico" />
		<link rel="stylesheet" href="http://code.jquery.com/mobile/1.0/jquery.mobile-1.0.min.css" />
		<script src="http://code.jquery.com/jquery-1.7.1.min.js"></script>
		<script src="http://code.jquery.com/mobile/1.0/jquery.mobile-1.0.min.js"></script>
		<!-- large image specific additions  -->
		<link rel="stylesheet" href="css/mobile-map.css" type="text/css">
		<link rel="stylesheet" href="css/mobile-jq.css" type="text/css">
	</head>
	<body> 
		<!-- Index pages -->
		<div data-role="page">
			<div data-role="header">
				<h1>Slide Atlas</h1>
				<a href="" data-role="button" data-icon="gear" class='ui-btn-right' data-theme="<?php
					if($_SESSION['auth'] == 'admin')
						{
						echo("b");
						}
					else
						{
						echo("a");
						}
				?>">Options</a>
			</div><!-- /header -->

			<div data-role="content">
				<div id="banner">
					<h2>Session Index</h2>
				</div>
				<p>This website is supported on multiple devices including iPad, iPhone and latest desktop browsers</p>

				<ul data-role="listview" data-inset="true">
					<?php
					# Loop through the pages and load them

					#echo('<li><a href="./information.html">Information</a></li>');
					require_once("config.php"); 

					# connect
					$m = new Mongo($server);

					# select a collection (analogous to a relational database's table)
					$collection = $m->selectDB($database)->selectCollection("sessions"); 
				
					# find everything in the collection
					$cursor = $collection->find();
				
					foreach ($cursor as $val) 
						{
						if (array_key_exists('label', $val))
							{
							$name = $val['label'];
							}
						else
							{
							$name = $val['name'];
							}
						#var_dump($val);
						echo('<li><a data-ajax="false" rel="external" href="session.php?id=');
						echo($val['_id']);
						echo('">' . $name . '</a></li>');
						}
					?>
				</ul>
			</div><!-- /content -->
		</div><!-- /page -->
	</body>
</html>

