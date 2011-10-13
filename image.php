<!doctype html>
<?php

try
	{
	# Process command line parameters if any
	session_start();
	@$image_id =  $_GET['id'];
	@$follow =  $_GET['follow'];
	
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

	if(array_key_exists('label',$obj))
		{
		$image_label = $obj['label'];
		}
		else
		{
		$image_label = $obj['name'];
		}

	if(array_key_exists('startup_view',$obj))
		{
		$has_startup_view = 1;
		$zoom = $obj['startup_view']["zoom"];
		$center = $obj['startup_view']["center"];
		if(array_key_exists("rotation", $obj['startup_view']))
			{
			$rotation = $obj['startup_view']["rotation"];
			}
		else
			{
			$rotation = 0;
			}
		}
	else
		{
		$has_startup_view = 0;
		}
	$image_name = $obj['name'];

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

		<meta name="viewport" content="width=device-width" />
		<meta name="viewport" content="width=device-width, maximum-scale=1.0" />

    <title>dermatopathology atlas</title>

		<!-- jQuery mobile -->
		<link rel="stylesheet" href="http://code.jquery.com/mobile/1.0b2/jquery.mobile-1.0b2.min.css" />
		<script src="http://code.jquery.com/jquery-1.6.2.min.js"></script>
		<script src="http://code.jquery.com/mobile/1.0b2/jquery.mobile-1.0b2.min.js"></script>
		
		<!-- large image specific additions  -->
		<link rel="stylesheet" href="css/mobile-map.css" type="text/css">
		<link rel="stylesheet" href="css/mobile-jq.css" type="text/css">
		<script>

<?php
	# Create javascript variables for large_images.js 

	if(isset($follow))
		{
		echo("var toFollow=true;\n");
		}	
	else
		{
		echo("var toFollow=false;\n");
		}
	echo("var tileSize =  256;\n");
	echo("var baseUrl = '" . $base_url . "';\n");
	echo("var zoomLevels = ". $level .";\n");
	echo("var baseName = '" . $database . "';\n");
	echo("var imageName = '");
	echo($image_id);
	echo("';\n");

	echo("var image_name = '");
	echo(trim($image_name));
	echo("';\n");
	echo("var image_label = '");
	echo(trim($image_label));
	echo("';\n");

	# for startup view
	if($has_startup_view == 1)
		{
		echo("var hasStartupView = 1;\n");
		echo("var startup_view = { \"zoom\" : " .	$zoom . ", \"center\" : [" . $center[0] . "," . $center[1] . "], \"rotation\" : " . $rotation ." };\n");
		}
	else
		{
		echo("var hasStartupView = 0;\n");
		echo("var startup_view = {};\n");
		}
?>
	
	</script>

	<script src="libs/jquery.timer.js" type="text/javascript"></script>
	<script src="libs/jquery-css-transform.js" type="text/javascript"></script>
	<script src="libs/jquery-animate-css-rotate-scale.js" type="text/javascript"></script>
<!--		<script src="libs/css-transform.js"></script>
		<script src="libs/css-rotate.js"></script>
-->
		<script src="libs/OpenLayers.mobile.js"> </script>
		<script src="libs/TMS.js"> </script>
		<script src="libs/Icon.js"> </script>
		<script src="libs/Marker.js"> </script>
		<script src="libs/Markers.js"> </script>
		<script src="libs/mobile-jq.js"></script>
		<script src="libs/operations.js"></script>
</head>
<body> 
		<!-- The large image page -->
		<div data-ajax='false' data-role="page" id="mappage">

			<!-- Header -->
			<div id="somerandom" data-role="header" data-fullscreen="false" data-position="fixed"> 
				<a data-role="button" id="show-anno">Annotations</a>
				<h1>  <?php echo($image_label);  ?> </h1>
				<div id="rotation" data-role="controlgroup" class='ui-btn-right' data-inline="true" data-type="horizontal">
				<a href="" data-inline="true" data-role="button" id="follow"> Join session </a>
			  <a id="imageoptions" data-inline="true" href="#options" data-direction="reverse" data-role="button" data-icon="gear"  data-theme="<?php
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
			</div>			

			<!-- Image Content -->
			<div data-role="content">
				<div id="mapcontainer">
					<div id="map">
					</div>
				</div>
			</div>

			<div id="navigation" data-role="controlgroup" data-type="vertical">
				<a href="" data-role="button" data-icon="plus" id="plus"
					 data-iconpos="notext"></a>
				<a href="" data-role="button" data-icon="minus" id="minus"
					 data-iconpos="notext"></a>
			</div>

			<div id="copyright"> 
				<?php echo($_SESSION['copyright']);?> 
			</div>

			<!-- Footer content -->
			<div data-role="footer" class="ui-bar"> 
				<div id="rotation" data-role="controlgroup" data-inline="true" data-type="horizontal">
					<a href="" data-role="button" data-icon="forward" id="rleft"
					 >R</a>
					<a href="" data-role="button" id="rreset"
					 > reset </a>
					<a href="" data-role="button" data-icon="back" id="rright"
					 >L</a>
				</div>
			</div>

		</div>


		<div data-role="page" id="options" data-ajax='false'>
		
			<div data-role="header">
				<h1>Options</h1>
			</div>
	
			<div data-role="content">
				<h2> Manage collaborative view </h2>	
		<!-- Display the annotation loader only if the user is admin -->
		<?php
			if($_SESSION['auth'] == 'admin')
				{
		?>	
					<a href="" data-inline="true" data-role="button" id="lead"> Lead a collaborative session </a>

				<h2> Label </h2>
					<input type="text" id="newname" value="<?php echo($image_label); ?>"/><br/>
					<a id=renameimage data-role="button" data-inline="true">Rename</a> 
					<a id=resetrename data-role="button" data-inline="true">Reset</a> 
		
			<div data-role="collapsible" data-inline="true">
				<h3>Delete</h3>
					Please confirm the delete operation <br>
					<a id="deleteimage" data-inline="true" data-role="button" data-icon="delete">Delete</a>
			</div>

			<h2> Startup </h2>
				<a id="setdefault" data-inline="true" data-role="button">Set Default View</a> 	<br/>
				<a id="deldefault" data-inline="true" data-icon="delete" data-role="button">Delete Default View</a>

			<h2> Annotations </h2>
				<form rel="external" data-direction="reverse" data-ajax="false" action="upload_ndpa.php" method="post" enctype="multipart/form-data">
					<input type="hidden" name="image_id" value="<?php echo($image_id); ?>">
					<label for="file">Filename:</label>
					<input type="file" name="file" id="file" />
					<input type="submit" name="submit" value="Submit" />
				</form>
			</div>
				Note: Annotations will be overwrittern <br/>
		<?php
				}
		?>		
		</div>
		
</body>
</html>
 

