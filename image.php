<!DOCTYPE html>
<?php

try
	{
	@$imgIdStr =  $_GET['img'];
	if(!isset($imgIdStr))
		{
		@$imgIdStr =  $_GET['id'];
		}
	if(!isset($imgIdStr))
		{
		header('content-type: text/html');
		echo "Error: no 'img' or 'id' URL parameter";
		return;
		}

	@$sessIdStr =  $_GET['sess'];
	// if(!isset($sessIdStr)) then we just can't have forward/back buttons

	@$follow =  $_GET['follow'];

	session_start();
	# Perform database initialization and get chapter name
	require_once("config.php");

	$conn = new Mongo('mongodb://' . $server);
	$imgsColl = $conn->selectDB($database)->selectCollection("images");
	# Perform the query to get image name, and number of levels
	$imgId = new MongoId($imgIdStr);
	$imgDoc = $imgsColl->findOne(array( "_id" => $imgId));

	if(array_key_exists('label', $imgDoc))
		{
		$imgTitle = $imgDoc['label'];
		}
		else
		{
		$imgTitle = $imgDoc['name'];
		}

	if(array_key_exists('startup_view', $imgDoc))
		{
		$has_startup_view = 1;
		$zoom = $imgDoc['startup_view']["zoom"];
		$center = $imgDoc['startup_view']["center"];
		if(array_key_exists("rotation", $imgDoc['startup_view']))
			{
			$rotation = $imgDoc['startup_view']["rotation"];
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
	$image_name = $imgDoc['name']; #remove?

	$imgdataColl = $conn->selectDB($database)->selectCollection($imgIdStr);
	$imgdataBaseDoc = $imgdataColl->findOne(array("name" => "t.jpg"), array("file" => 0));
	#TODO: Error handling while getting level
	$imgLevel = $imgdataBaseDoc['level']+1;
	}

# Error handling
catch (Exception $e)
	{
	header('content-type: text/plain');
	echo 'Caught exception: ',  $e->getMessage(), "\n";
	return;
	}

# Find previous / next images in session
$prevImg_href = NULL;
$nextImg_href = NULL;
if(isset($sessIdStr))
	{
	$sessDoc = $conn->selectDB($database)->selectCollection("sessions")->findOne( array( "_id" => new MongoId($sessIdStr)) );

	# build a PHP-style sorted array from 'images' array
	$sessImgsSorted = array();
	foreach ($sessDoc['images'] as $refListElem)
		{
		if($refListElem['hide'] === false)
			{
			$sessImgsSorted[$refListElem['pos']] = $refListElem['ref'];
			}
		}
	ksort($sessImgsSorted);

	$sessImgsSorted = array_values($sessImgsSorted); # repack array keys as contiguous values
	$thisImgPos = array_search($imgId, $sessImgsSorted);
	if(array_key_exists($thisImgPos-1, $sessImgsSorted))
		{
		$prevImg_href = 'image.php?sess=' . $sessIdStr . '&img=' . $sessImgsSorted[$thisImgPos-1] . '#mappage';
		}
	if(array_key_exists($thisImgPos+1, $sessImgsSorted))
		{
		$nextImg_href = 'image.php?sess=' . $sessIdStr . '&img=' . $sessImgsSorted[$thisImgPos+1] . '#mappage';
		}
	}
?>

<html>
	<head>
		<meta charset="UTF-8">
		<title>Slide Atlas</title>

		<script src="libs/jquery/jquery-1.7.2.min.js"></script>
		<script src="libs/jquery.mobile/jquery.mobile-1.1.0.min.js"></script>
		<link rel="stylesheet" href="libs/jquery.mobile/jquery.mobile-1.1.0.min.css">

		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta name="apple-mobile-web-app-capable" content="yes">
		<meta name="apple-mobile-web-app-status-bar-style" content="black">
		<link rel="apple-touch-icon" href="favicon.ico">

		<link rel="stylesheet" href="css/common.css" type="text/css">
		<link rel="stylesheet" href="css/image.css" type="text/css">

		<meta name="viewport" content="minimum-scale=1.0, maximum-scale=1.0">
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
			echo("var zoomLevels = ". $imgLevel .";\n");
			echo("var baseName = '" . $database . "';\n");
			echo("var imageName = '" . $imgIdStr . "';\n");
			echo("var sessionName = '" . $sessIdStr . "';\n");

			echo("var image_name = '");
			echo(trim($image_name));
			echo("';\n");
			echo("var image_label = '");
			echo(trim($imgTitle));
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

		<script src="libs/openlayers/openlayers.rotating-2.12.rc7.js"> </script>

		<script src="libs/image.js"></script>
		<script src="libs/image.map.js"></script>
		<script src="libs/image.bookmarks.js"></script>
		<script src="libs/image.follow.js"></script>
		<script src="libs/operations.js"></script>
		<script type="application/x-javascript"> addEventListener("load", function() { setTimeout(
		hideURLbar, 0); }, false); function hideURLbar(){ window.scrollTo(0,1); } </script>
	</head>

	<body>
		<!-- The large image page -->
		<div id="mappage" data-role="page">

			<!-- header -->
			<div data-role="header"> <!-- don't make fixed, it causes bugs -->
				<div class="ui-btn-left">
					<div data-role="controlgroup" data-type="horizontal">
						<a id="imageoptions" data-role="button" data-icon="gear" data-iconpos="left" href="#optionspage"
							data-theme="<?php echo(($_SESSION['auth'] == 'admin') ? "b" : "a"); ?>">Options</a>
					</div>
					<div data-role="controlgroup" data-type="horizontal">
						<a id="follow" data-role="button" class='ui-disabled'>Join session</a>
					</div>
				</div>
				<h1>  <?php echo($imgTitle); ?> </h1>
				<div class="ui-btn-right" data-role="controlgroup" data-type="horizontal">
					<a id="show-anno" data-role="button" class='ui-disabled'>Annotations</a>
					<a id="show-bookmarks" data-role="button" class='ui-disabled' data-icon="star" data-iconpos="left" data-direction="forward" href="#bookmarkspage">Bookmarks</a>
				</div>
			</div><!-- /header -->

			<!-- image content -->
			<div id="mapcontent" data-role="content">
				<div id="mapcontainer">
					<div id="map"></div>
				</div>
			</div>

			<div id="navigation" data-role="controlgroup" data-type="vertical">
				<a href="" data-role="button" data-icon="plus" id="plus" data-iconpos="notext"></a>
				<a href="" data-role="button" data-icon="minus" id="minus" data-iconpos="notext"></a>
			</div>

			<div id="copyright">
				<?php echo($_SESSION['copyright']);?>
			</div>

			<div id="logo">
				<img src="img/k-logo-64.png">
			</div><!-- /image content -->

			<!-- footer -->
			<div data-role="footer" class="ui-grid-b">
				<div class="ui-block-a" data-role="controlgroup" data-type="horizontal">
					<?php if(!is_null($prevImg_href)) echo '<a data-role="button" data-icon="arrow-l" data-iconpos="left" data-ajax="false" href="' , $prevImg_href , '">Previous</a>', "\n"; ?>
					<a data-role="button" data-icon="arrow-u" data-iconpos="right" data-ajax="false" href="session.php?sess=<?php echo($sessIdStr); ?>">Return</a>
				</div>
				<div id="rotation" class="ui-block-b" data-role="controlgroup" data-type="horizontal">
					<a href="" data-role="button" data-icon="forward" id="rleft">R</a>
					<a href="" data-role="button" id="rreset">Reset</a>
					<a href="" data-role="button" data-icon="back" id="rright">L</a>
				</div>
				<div class="ui-block-c" data-role="controlgroup" data-type="horizontal">
					<?php if(!is_null($nextImg_href)) echo '<a data-role="button" data-icon="arrow-r" data-iconpos="right" data-ajax="false" href="' , $nextImg_href , '">Next</a>', "\n"; ?>
				</div>
			</div><!-- /footer -->

		</div><!-- /mappage -->

		<!-- bookmarkspage -->
		<div id="bookmarkspage" data-role="page" data-ajax="false">

			<!-- header -->
			<div data-role="header" data-position="fixed" data-tap-toggle="false"> <!-- TODO: try to make persistant across transitions-->
				<h1>  <?php echo($imgTitle); ?> </h1>
				<div class="ui-btn-right" data-role="controlgroup" data-type="horizontal">
					<!-- work as a 'back' button by default, to not clog history -->
					<a data-role="button" data-theme="b" data-icon="star" data-iconpos="left" data-direction="reverse" data-rel="back" href="#mappage">Bookmarks</a>
				</div>
			</div>

			<!-- bookmark content -->
			<div data-role="content">
				<ul id="bookmark-list" data-role="listview" data-split-icon="check" data-filter="true" data-filter-placeholder="Filter bookmarks...">
					<!-- bookmark list items -->
				</ul>
			</div><!-- bookmark content -->
		</div><!-- /bookmarkspage -->

		<!-- optionspage -->
		<div id="optionspage" data-role="page" data-ajax="false">

			<div data-role="header" data-position="fixed">
				<div class="ui-btn-left" data-role="controlgroup" data-type="horizontal">
					<a data-role="button" data-icon="gear" data-iconpos="left" data-direction="reverse" data-rel="back" href="#mappage"
						data-theme="<?php echo(($_SESSION['auth'] == 'admin') ? "b" : "a"); ?>">Options</a>
				</div>
				<h1>Options</h1>
			</div>

			<!-- Display the annotation loader only if the user is admin -->
			<?php
			if($_SESSION['auth'] == 'admin')
				{
			?>
			<div data-role="content">
				<h2>Manage collaborative view</h2>
				<a href="" data-inline="true" data-role="button" id="lead">Lead a collaborative session</a>

				<h2>Label</h2>
				<input type="text" id="newname" value="<?php echo($imgTitle); ?>"/>
				<a id=renameimage data-role="button" data-inline="true">Rename</a>
				<a id=resetrename data-role="button" data-inline="true">Reset</a>

				<div data-role="collapsible" data-inline="true">
					<h3>Delete</h3>
					Please confirm the delete operation<br/>
					<a id="deleteimage" data-inline="true" data-role="button" data-icon="delete">Delete</a>
				</div>

				<h2>Startup</h2>
				<a id="setdefault" data-inline="true" data-role="button">Set Default View</a> <br/>
				<a id="deldefault" data-inline="true" data-icon="delete" data-role="button">Delete Default View</a>

				<h2>Annotations</h2>
				<form rel="external" data-direction="reverse" data-ajax="false" action="upload_ndpa.php" method="post" enctype="multipart/form-data">
					<input type="hidden" name="image_id" value="<?php echo($imgIdStr); ?>">
					<label for="file">Filename:</label>
					<input type="file" name="file" id="file"/> <br/>
					<input type="submit" data-inline="true" name="submit" value="Submit"/> <br/>
					Note: Annotations will be overwrittern
				</form>
			</div><!-- /content -->
			<?php
				}
			?>
		</div><!-- /optionspage -->

	</body>
</html>

