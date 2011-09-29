<!doctype html>
<?php

try
	{
	# Process command line parameters if any
	session_start();
	@$image_id =  $_GET['id'];
	
	# If parameters not available
	if(!isset($image_id))
		{
		$image_id = "4e25e244114d970935000051";

		}
	
	# Perform database initialization and get chapter name
	require_once("config.php"); 

	# connect
	$m = new Mongo($server, array('persist' => 'path'));
	
	# Perform the query to get image name, and number of levels
	$coll = $m->selectDB($database)->selectCollection("images"); 
  $oid = new MongoId($image_id);
	$query1 = array( "_id" => $oid);
	$obj = $coll->findOne($query1);
	$image_title = $obj['name'];
	$chapter_id = $obj['title'];

	$collection = $m->selectDB($database)->selectCollection($image_id); 
	$query = array( "name" => "t.jpg");
	$exclude = array( "file" => 0);

	$cursor = $collection->findOne($query, $exclude);
	#TODO: Error handling while getting level
	$level = $cursor['level']+1;
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

		<!-- jQuery mobile -->
		<link rel="stylesheet" href="http://code.jquery.com/mobile/latest/jquery.mobile.min.css" type="text/css">
		<script src="http://code.jquery.com/jquery-1.6.2.min.js"></script>
		<script src="http://code.jquery.com/mobile/latest/jquery.mobile.min.js" type="text/javascript"></script>
		
		<!-- large image specific additions  -->
		<link rel="stylesheet" href="css/mobile-map.css" type="text/css">
		<link rel="stylesheet" href="css/mobile-jq.css" type="text/css">
		<script src="libs/operations.js"></script>
		<script src="libs/mobile-jq.js"></script>
		<script>

<?php
	# Create javascript variables for large_images.js 
	echo("var tileSize =  256;\n");
	echo("var baseUrl = '" . $base_url . "';\n");
	echo("var zoomLevels = ". $level .";\n");
	echo("var baseName = '" . $database . "';\n");
	echo("var imageName = '");
	echo($image_id);
	echo("';\n");

	echo("var image_title = '");
	echo(trim($image_title));
	echo("';\n");
?>
	
	</script>
	
		<script src="libs/OpenLayers.mobile.js"> </script>
		<script src="libs/TMS.js"></script>
		<script src="libs/large_images.js"> </script>
</head>
<body> 
		<!-- The large image page -->
		<div data-ajax='false' data-role="page" id="mappage" data-add-back-btn="true" >
			<!-- <div data-role="header">
				<h1><?php echo($image_title); ?></h1>
			</div> -->

			<div data-role="header" data-position="fixed"> 
				<a href="chapter.php?id=<?php
						echo($chapter_id);
						?>"  data-rel="back" data-ajax="false" data-icon="arrow-l" class="ui-btn-left">Back</a>
				<a data-role="button" id="show-anno">Annotations</a>
			  <a href="#options" data-role="button" data-icon="gear" class='ui-btn-right' data-theme="<?php
					if($_SESSION['auth'] == 'admin')
						{
						echo("b");
						}
					else
						{
						echo("a");
						}
				?>">Options</a>
			</div>			


			<div data-role="content">
				<div id="map"></div>
			</div>

			<div id="navigation" data-role="controlgroup" data-type="vertical">
				<a href="" data-role="button" data-icon="plus" id="plus"
					 data-iconpos="notext"></a>
				<a href="" data-role="button" data-icon="minus" id="minus"
					 data-iconpos="notext"></a>
			</div>


			<div id="copyright"> <?php echo($_SESSION['copyright']);?> </div>

			<div data-role="footer" class="ui-bar" data-position="fixed"> 
			<div id="rotation" data-role="controlgroup" data-type="horizontal">
				<a href="" data-role="button" data-icon="forward" id="rleft"
					 >L</a>
				<a href="" data-role="button" data-icon="back" id="rright"
					 >R</a>
			</div>
			</div> 

		</div>
		
		<div data-role="page" id="options" data-ajax='false' data-add-back-btn="true">
			<div data-role="header">
				<!-- <a href="#mappage" data-ajax="false">Back</a> -->
				<h1>Options</h1>
			</div>
	
		<!-- Display the annotation loader only if the user is admin -->
		<?php
			if($_SESSION['auth'] == 'admin')
				{
		?>		
		<h2> Label </h2>
					<input type="text" id="newname" value="<?php echo($image_title); ?>"/><br/>
					<a id=renameimage data-role="button" data-inline="true">Rename </a> 
		
		<div data-role="collapsible" data-inline="true">
		<h3>Delete</h3>
		Please confirm the delete operation <br>
		<a id="deleteimage" data-inline="true" data-role="button" data-icon="delete">Delete</a>
		</div>

		<h2> Startup </h2>
		<a id="setdefault" data-inline="true" data-role="button">Set Default View</a> 	<br/>
		<a id="deldefault" data-inline="true" data-icon="delete" data-role="button">Delete Default View</a>

		<h2> Annotations </h2>
			<form rel="external" data-ajax="false" action="upload_ndpa.php" method="post" enctype="multipart/form-data">
				<input type="hidden" name="image_id" value="
<?php echo($image_id); ?> 
">
				<label for="file">Filename:</label>
				<input type="file" name="file" id="file" />
				<input type="submit" name="submit" value="Submit" />
			</form>
			Note: Annotations will be overwrittern <br/>
		<?php
				}
		?>		
			
			</div>
		</div>

		<div data-role="page" id="imageinfo" data-ajax='false'  data-add-back-btn="true">
				<!-- <ul data-role="listview" data-inset="true" data-theme="d" data-dividertheme="c" id="layerslist">
				   </ul>
				-->
			<div data-role="header">
				<h1>Options</h1>
			</div>
			<div data-role="content">
				
				<!--Admin content-->
				<?php
					if($_SESSION['auth'] == 'admin')
						{
				?>		

				<form rel="external" action="rename.php" method="post" enctype="multipart/form-data">
					<input type="hidden" name="image_id" value="<?php echo($image_id); ?>">
					<input id="image_label" name="image_label" type="text" value = "<?php echo($image_title); ?>"/>  
					<input type="submit" data-inline="true" name="submit" value="Rename" />
				</form>


				<?php
						}
						else
						{
				?>		
				
				No settings are available for students currently
				
				<?php
						}
				?>		
				
			</div>
		</div>

</body>
</html>
 

