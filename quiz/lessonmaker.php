<!DOCTYPE html>

<?php

$m = new Mongo();
$d = $m->selectDB("demo");
$c1 = $d->selectCollection("images");
$c2 = $d->selectCollection("lesson");

$img = $c1->find();
$questions = $c2->find()->sort(array("index"=>1));

/*
To embed the thumbnails correctly:
Step 1: Find the correct image ID - CHECK.
Step 2: Bind the correct image ID into the URL - CHECK.
Step 3: Bind the image ID into the correct URL - CHECK.

To execute the removequestion function correctly:
Step 1: Find the correct value for the imageid field - CHECK.
Step 2: Pass it to the removequestion.php page in the correct manner - CHECK.
Step 3: Retrieve it using $_GET correctly - CHECK.
Step 4: Run the correct query on the database - 

To execute the previousquestion function correctly:
Step 1: Find the correct imageid - CHECK.
Step 2: Pass it into the URL - CHECK.
Step 3: Find the image - CHECK.
Step 4: Find the
*/

?>

<html>

	<head>
		<title>Lesson Maker</title>
		
		<link rel="stylesheet" type="text/css" href="lessonmaker.css" />
	</head>
	
	<body>
		<div class="container">
			<div class="questionlist">
				<?php
				foreach($questions as $q){
					?>
					<div class="question" >
						<a href="viewer.php?id=<?php echo $q['imageid'];?>" >
						<img src="http://localhost:81/tile.php?image=<?php echo $q['imageid'];?>&name=t.jpg" />
						</a>
						<div class="orgtable">
							<a href="firstquestion.php?label=<?php echo $q['imageid'];?>" ><div class="orgelement" >1</div></a>
							<a href="previousquestion.php?label=<?php echo $q['imageid'];?>" ><div class="orgelement" >^</div></a>
							<a href="removequestion.php?label=<?php echo $q['imageid'];?>" ><div class="orgelement" >X</div></a>
							<a href="nextquestion.php?label=<?php echo $q['imageid'];?>" ><div class="orgelement" >v</div></a>
							<a href="lastquestion.php?label=<?php echo $q['imageid'];?>" ><div class="orgelement" >L</div></a>
						</div>
						Text
					</div>
					<?php
				}
				?>
			</div>
			<div class="table">
				<?php
				foreach($img as $i){
					?>
					<a href="addquestion.php?label=<?php echo $i['_id'];?>" >
					<div class="qelement" >
						<img src="http://localhost:81/tile.php?image=<?php echo $i['_id'];?>&name=t.jpg" alt="Image" />
						Text
					</div>
					</a>
					<?php
				}
				?>
			</div>
		</div>
	</body>

</html>