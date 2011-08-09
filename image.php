<!doctype html>
<?php

try
	{
	# Process command line parameters if any
	@$ihapter_id =  $_GET['id'];
	
	# If parameters not available
	if(!isset($chapter_id))
		{
		$chapter_id = "4e25e244114d970935000051";

		}
	
	# Perform database initialization and get chapter name
	
	# connect
	$m = new Mongo('amber11:27017', array('persist' => 'path'));
	
	# select a collection (analogous to a relational database's table)
	$collection = $m->selectDB("book")->selectCollection("chapters"); 

	# Perform the query to get chapter name
  $oid = new MongoId($chapter_id);
	
	$query = array( "_id" => $oid);
	$cursor = $collection->findOne($query);
	$chapter_title = $cursor['name'];

	}

# Error handling	
catch (Exception $e) 
	{
	header('content-type: text/plain');
  echo 'Caught exception: ',  $e->getMessage(), "\n";
	return;
	}
?>

<html>
    <head>
    <title>dermatopathology atlas</title>
    <link rel="stylesheet" href="http://code.jquery.com/mobile/1.0a1/jquery.mobile-1.0a1.min.css" />
    <script src="http://code.jquery.com/jquery-1.4.3.min.js"></script>
    <script src="http://code.jquery.com/mobile/1.0a1/jquery.mobile-1.0a1.min.js"></script>
		<!-- large image specific additions  -->
		<link rel="stylesheet" href="css/mobile-map.css" type="text/css">
		<link rel="stylesheet" href="css/mobile-jq.css" type="text/css">
		<script>

<?php
	# Create javascript variables for large_images.js 
	echo("var tileSize =  256;\n");
	echo("var zoomLevels = 8;\n");
	echo("var baseName = 'book';\n");
	echo("var imageName = '");
	echo($chapter_id);
	echo("';\n");
?>
		</script>
	
		
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
				<a href="#imageinfo" id="locate" data-icon="locate" data-role="button">Info</a>
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
				<input type="hidden" name="image_id" value="<? echo($chapter_id); ?>">
				<label for="file">Filename:</label>
				<input type="file" name="file" id="file" />
				<input type="submit" name="submit" value="Submit" />
			</form>

				<!-- <ul data-role="listview" data-inset="true" data-theme="d" data-dividertheme="c" id="layerslist">
				   </ul>
				-->
			</div>
		</div>

		<div data-role="page" id="imageinfo">
				<!-- <ul data-role="listview" data-inset="true" data-theme="d" data-dividertheme="c" id="layerslist">
				   </ul>
				-->
				No image info to display
				
			</div>
		</div>

</body>
</html>
 

