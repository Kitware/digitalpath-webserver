<!DOCTYPE html>

<?php

try
	{
	# Process command line parameters if any
	@$sess_id =  $_GET['id'];
	
	# If parameters not available
	if(!isset($sess_id))
		{
		header('content-type: text/html');
		return;
		}
	
	# Perform database initialization
	require_once("config.php"); 

	# connect
	$m = new Mongo($server);
	
	# select a collection (analogous to a relational database's table)
	$col_sess = $m->selectDB($database)->selectCollection("sessions"); 

	# Perform the query to get session name	
	$sess_doc = $col_sess->findOne( array("_id" => new MongoId($sess_id)) );

	if (array_key_exists('label', $sess_doc))
		{
		$sess_title = $sess_doc['label'];
		}
	else
		{
		$sess_title = $sess_doc['name'];	
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
    <title>Dermatopathology Atlas</title>
		<link rel="stylesheet" href="http://code.jquery.com/mobile/1.0b2/jquery.mobile-1.0b2.min.css" />
		<script src="http://code.jquery.com/jquery-1.6.2.min.js"></script>
		<script src="http://code.jquery.com/mobile/1.0b2/jquery.mobile-1.0b2.min.js"></script>
</head>
<body> 
    <div data-role="page" data-add-back-btn="true">
        
	 			<div data-role="header" data-position="fixed" data-fullscreen="false">
            <h1> <?php echo($sess_title) ?> </h1>
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
        </div>


        <div data-role="content">
            <div id="banner">
							<h2>List of images in session</h2>
            </div>
            
						<ul data-role="listview" data-ajax="false">
<?php
	# Loop through the pages and load them
	
	# select a collection (analogous to a relational database's table)
	$col_images = $m->selectDB($database)->selectCollection("images");

	# build a PHP-style sorted array from 'images' array
	$sess_imgs = array();
	foreach ($sess_doc['images'] as $img_data_obj)
		{
		$sess_imgs[$img_data_obj['pos']] = $img_data_obj['ref'];
		}
	ksort($sess_imgs);

	foreach ($sess_imgs as $img_id) 
		{
		$img_doc = $col_images->findOne( array("_id" => $img_id) );		
		if(array_key_exists('hide', $img_doc))
			{
			continue;
			}
		if(array_key_exists('label', $img_doc))
			{
			$img_name = $img_doc['label'];
			}
		else
			{
			$img_name = $img_doc['name'];
			}

		$thumb_doc = $m->selectDB($database)->selectCollection(strval($img_id))->findOne( array("name" => "thumb.jpg"),  array("file") );
		if(!is_null($thumb_doc))
			{
			$thumb_file = 'thumb.jpg';
			}
		else
			{
			$thumb_file = 't.jpg';
			}

		echo('<li>');
		echo('<a data-ajax="false" rel="external" href="image.php?id=');
		echo($img_doc['_id']);
		echo('#mappage">');
		echo('<img src="/tile.php?image=');
		echo($img_doc['_id']);
		echo('&name=' . $thumb_file .'">' . $img_name . '</a></li>');
		}	
?>
            </ul>

        </div>
    </div>


</body>
</html>
