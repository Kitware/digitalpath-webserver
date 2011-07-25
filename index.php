<!DOCTYPE html>
<html>
    <head>
    <title>Dermatopathology Atlas</title>
    <link rel="stylesheet" href="http://code.jquery.com/mobile/1.0a1/jquery.mobile-1.0a1.min.css" />
    <script src="http://code.jquery.com/jquery-1.4.3.min.js"></script>
    <script src="http://code.jquery.com/mobile/1.0a1/jquery.mobile-1.0a1.min.js"></script>
		<!-- Large image specific additions  -->
		<link rel="stylesheet" href="css/mobile-map.css" type="text/css">
		<link rel="stylesheet" href="css/mobile-jq.css" type="text/css">
		
		
		<script src="libs/OpenLayers.mobile.js"></script>
		<script src="libs/TMS.js"></script>
		<script src="libs/mobile-jq.js"></script>
		<script src="libs/large_images.js"> </script>
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
									echo('<li><a href="/chapter.php?id=');
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

		<!-- The large image page -->
		<div data-role="page" id="mappage">
			<div data-role="content">
				<div id="map"></div>
			</div>

			<div data-role="footer">
				<a href="#searchpage" data-icon="search" data-role="button">Search</a>
				<a href="#" id="locate" data-icon="locate" data-role="button">Locate</a>
				<a href="#layerspage" data-icon="layers" data-role="button">Layers</a>
			</div>
			
			<div id="navigation" data-role="controlgroup" data-type="vertical">
				<a href="#mappage" data-role="button" data-icon="plus" id="plus"
					 data-iconpos="notext"></a>
				<a href="#mappage" data-role="button" data-icon="minus" id="minus"
					 data-iconpos="notext"></a>
			</div>
		</div>


</body>
</html>
