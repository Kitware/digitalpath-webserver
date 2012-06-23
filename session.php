<!DOCTYPE html>

<?php

try
	{
	@$sessIdStr =  $_GET['sess'];
	if(!isset($sessIdStr))
		{
		@$sessIdStr =  $_GET['id'];
		}
	if(!isset($sessIdStr))
		{
		header('content-type: text/html');
		echo "Error: no 'sess' or 'id' URL parameter";
		return;
		}

	# Perform database initialization
	require_once("config.php");

	$conn = new Mongo('mongodb://' . $server);
	$sessColl = $conn->selectDB($database)->selectCollection("sessions");

	# Perform the query to get session document, for name
	$sessDoc = $sessColl->findOne( array("_id" => new MongoId($sessIdStr)) );

	if (array_key_exists('label', $sessDoc))
		{
		$sessTitle = $sessDoc['label'];
		}
	else
		{
		$sessTitle = $sessDoc['name'];
		}

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
		<meta charset="UTF-8">
		<title>Slide Atlas</title>

		<script src="libs/jquery/jquery-1.7.2.min.js"></script>
		<script src="libs/jquery.mobile/jquery.mobile-1.1.0.min.js"></script>
		<link rel="stylesheet" href="libs/jquery.mobile/jquery.mobile-1.1.0.min.css">

		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta name="apple-mobile-web-app-capable" content="yes">
		<meta name="apple-mobile-web-app-status-bar-style" content="black">
		<link rel="apple-touch-icon" href="favicon.ico">
	</head>
	<body>
		<div data-role="page" data-add-back-btn="true">

			<div data-role="header" data-position="fixed" data-fullscreen="false">
				<h1> <?php echo($sessTitle) ?> </h1>
				<a href="" data-role="button" data-icon="gear" class='ui-btn-right' data-theme="<?php echo(($_SESSION['auth'] == 'admin') ? "b" : "a"); ?>">Options</a>
			</div>

			<div data-role="content">
				<div id="banner">
					<h2>List of images in session</h2>
				</div>
				<ul data-role="listview">
					<?php
					# Loop through images

					$imgsColl = $conn->selectDB($database)->selectCollection("images");

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

					foreach ($sessImgsSorted as $sessImgId)
						{
						$imgDoc = $imgsColl->findOne( array("_id" => $sessImgId) );
						if(array_key_exists('label', $imgDoc))
							{
							$imgTitle = $imgDoc['label'];
							}
						else
							{
							$imgTitle = $imgDoc['name'];
							}

						$thumbDoc = $conn->selectDB($database)->selectCollection(strval($sessImgId))->findOne( array("name" => "thumb.jpg"),  array("file") );
						if(!is_null($thumbDoc))
							{
							$thumbDocFile = 'thumb.jpg';
							}
						else
							{
							$thumbDocFile = 't.jpg';
							}

						echo '<li><a data-ajax="false" rel="external" href="image.php?sess=' , $sessDoc['_id'] , '&img=' , $imgDoc['_id'] , '#mappage">';
						echo '<img src="/tile.php?image=' , $imgDoc['_id'] , '&name=' , $thumbDocFile , '">' , $imgTitle , '</a></li>' , "\n";
						}
					?>
				</ul>
			</div><!-- /content -->
		</div><!-- /page -->
	</body>
</html>

