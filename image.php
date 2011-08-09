<!doctype html>
<html>
    <head>
    <title>dermatopathology atlas</title>
    <link rel="stylesheet" href="http://code.jquery.com/mobile/1.0a1/jquery.mobile-1.0a1.min.css" />
    <script src="http://code.jquery.com/jquery-1.4.3.min.js"></script>
    <script src="http://code.jquery.com/mobile/1.0a1/jquery.mobile-1.0a1.min.js"></script>
		<!-- large image specific additions  -->
		<link rel="stylesheet" href="css/mobile-map.css" type="text/css">
		<link rel="stylesheet" href="css/mobile-jq.css" type="text/css">
		
		
		<script src="libs/OpenLayers.mobile.js"></script>
		<script src="libs/TMS.js"></script>
		<script src="libs/mobile-jq.js"></script>
		<script src="libs/large_images.js"> </script>
</head>
<body> 
		<!-- The large image page -->
		<div data-role="page" id="mappage">
			<div data-role="content">
				<div id="map"></div>
			</div>

			<div data-role="footer">
				<a href="#searchpage" data-icon="search" data-role="button">Search</a>
				<a href="#" id="locate" data-icon="locate" data-role="button">Locate</a>
				<a href="#annotations" data-icon="annotations" data-role="button">Layers</a>
			</div>
			
			<div id="navigation" data-role="controlgroup" data-type="vertical">
				<a href="#" data-role="button" data-icon="plus" id="plus"
					 data-iconpos="notext"></a>
				<a href="#" data-role="button" data-icon="minus" id="minus"
					 data-iconpos="notext"></a>
			</div>
		</div>
		
		<div data-role="page" id="annotations">
			<div data-role="header">
				<h1>Annotations</h1>
			</div>
			<div data-role="content">
			<form rel="external" action="../upload_ndpa.php" method="post" enctype="multipart/form-data">
				<label for="file">Filename:</label>
				<input type="file" name="file" id="file" />
				<br />
				<input type="submit" name="submit" value="Submit" />
			</form>

				<!-- <ul data-role="listview" data-inset="true" data-theme="d" data-dividertheme="c" id="layerslist">
				   </ul>
				-->
			</div>
		</div>
</body>
</html>
 

