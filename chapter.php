<!DOCTYPE html>

<?php

try
	{
	# Process command line parameters if any
	@$chapter_id =  $_GET['id'];
	
	# If parameters not available
	if(!isset($chapter_id))
		{
		header('content-type: text/html');
		return;
		}
	
	# Perform database initialization and get chapter name
	
	# Perform database initialization and get chapter name
	require_once("config.php"); 

	# connect
	$m = new Mongo($server, array('persist' => 'path'));
	
	# select a collection (analogous to a relational database's table)
	$collection = $m->selectDB($database)->selectCollection("chapters"); 

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
    <title>Dermatopathology Atlas</title>
		<link href="http://code.jquery.com/mobile/latest/jquery.mobile.min.css" rel="stylesheet" type="text/css" />
		<script src="http://code.jquery.com/jquery-1.6.2.min.js"></script>
		<script src="http://code.jquery.com/mobile/latest/jquery.mobile.min.js"></script>
		<!--    <link rel="stylesheet" href="http://code.jquery.com/mobile/1.0a1/jquery.mobile-1.0a1.min.css" />
				<script src="http://code.jquery.com/jquery-1.4.3.min.js"></script>
				<script src="http://code.jquery.com/mobile/1.0b2/jquery.mobile-1.0a1.min.js"></script>

		-->
</head>
<body> 
    <div data-role="page" data-add-back-btn="true">
        
	 			<div data-role="header" data-position="fixed" data-fullscreen="false">
						<a href="" data-rel="back" data-icon="arrow-l">Back</a>
            <h1> <?php echo($chapter_title) ?> </h1>
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

	$query = array( "title" => $oid);
	# find everything in the collection
	$cursor = $col_images->find($query);
	foreach ($cursor as $val) 
		{
		if(array_key_exists('label', $val))
		{
			$name = $val['label'];
		}
		else
		{
			$name = $val['name'];
		}
		#var_dump($val);
		echo('<li>');
		echo('<a data-ajax="false" rel="external" href="image.php?id=');
		echo($val['_id']);
		echo('#mappage">');
		echo('<img src="/tile.php?image=');
		echo($val['_id']);
		echo('&name=t.jpg">' . $name . '</a></li>');
		}	
?>
            </ul>

        </div>
    </div>


</body>
</html>
