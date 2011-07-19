<!DOCTYPE html>
<html>
    <head>
    <title>Dermatopathology Atlas</title>
    <link rel="stylesheet" href="http://code.jquery.com/mobile/1.0a1/jquery.mobile-1.0a1.min.css" />
    <script src="http://code.jquery.com/jquery-1.4.3.min.js"></script>
    <script src="http://code.jquery.com/mobile/1.0a1/jquery.mobile-1.0a1.min.js"></script>
</head>
<body> 
    <div data-role="page">
        <div data-role="header">
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
		echo('<li><a href="./information.html">' . $name . '</a></li>');
		}	
?>
            </ul>
        </div>
    </div>

<div data-role="footer" class="ui-bar">
	<a href="index.php" data-role="button" data-icon="arrow-u">Up</a>
	<a href="index.php" data-role="button" data-icon="arrow-d">Down</a>
</div>



</body>
</html>
