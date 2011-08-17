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
    <div data-role="page">
        <div data-role="header" data-position='fixed' data-fullscreen='false'>
            <h1> <?php echo($chapter_title) ?> </h1>
        </div>


        <div data-role="content">
            <div id="banner">
							<h2> List of images in a chapter </h2>
            </div>
            <p> This text can be replaced by some generic information about the chapter. </p>
            
						<ul data-role="listview" data-ajax="false">
<?php
	# Loop through the pages and load them
	
	# select a collection (analogous to a relational database's table)
	$col_images = $m->selectDB("book")->selectCollection("images");

	$query = array( "title" => $oid);
	# find everything in the collection
	$cursor = $col_images->find($query);
	foreach ($cursor as $val) 
		{
		$name = $val['name'];
		#var_dump($val);
		echo('<li><a rel="external" href="/image.php?id=');
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
