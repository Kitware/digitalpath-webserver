<!doctype html>
<html>
    <head>
    <title>dermatopathology atlas</title>
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
							<h2> Chapter Index </h2>
            </div>
            <p> Web solution for dermatopathology atlas, hosts large pathoklogy images with tags. annotations and search capabilities </p>
            <p> This website is supported on multiple devices including iPad, iPhone and latest desktop browsers </p>
            
						<ul data-role="listview" data-inset="true">
							<?php
								# Loop through the pages and load them
								
								#echo('<li><a href="./information.html">Information</a></li>');

								# connect
								$m = new Mongo('amber11:27017', array('persist' => 'path'));

								# select a collection (analogous to a relational database's table)
								$collection = $m->selectDB("book")->selectCollection("chapters"); 
								
								# find everything in the collection
								$cursor = $collection->find();
								foreach ($cursor as $val) 
									{
									$name = $val['name'];
									#var_dump($val);
									echo('<li><a data-ajax="false" rel="external" href="chapter.php?id=');
									echo($val['_id']);
									echo('">' . $name . '</a></li>');
									}	
							?>
            </ul>
        </div>
				<div data-role="footer" class="ui-bar" data-position='fixed' data-fullscreen='false'>
					<a href="index.php" data-role="button" data-icon="arrow-u">Up</a>
					<a href="index.php" data-role="button" data-icon="arrow-d">Down</a>
				</div>
    </div>

				
</body>
</html>
