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
        
        <link type="text/css" href="js/css/ui-lightness/jquery-ui-1.8.22.custom.css" rel="stylesheet" />
		<script type="text/javascript" src="js/js/jquery-1.7.2.min.js"></script>
		<script type="text/javascript" src="js/js/jquery-ui-1.8.22.custom.min.js"></script>
        <style>
            #sortable {list-style-type: none; margin: 10; padding:0}
            #sortable 
        </style>
        <script type="text/javascript">
            function update() {
                var result = $('#sortable').sortable('toArray');
            }
            $(function() {
                $("#sortable").sortable();
                $("#sortable").disableSelection();
            });
            /*$(function() {
                $('ul#sortable').sortable({
                start: function(event, ui) {
                    var start_pos = ui.item.index();
                    ui.item.data('start_pos', start_pos);
                    <?php $c2->insert(array(
                            'index' => ?>ui.item.index()<?php
                            ));?>
                },
                update: function(event, ui) {
                    var end_pos = $(ui.item).index();
                    alert(end_pos);
                }
                });
            });*/
            
            $("div.qelement").click(function() {
                var currentid = $(this).attr('id');
                $('ul').html().append(
                <li class="ui-state-default">
					<a href="viewer.php?id="+currentid+"" >
					<img src="http://localhost:81/tile.php?image="+currentid+"&name=t.jpg" />
					</a>
					Text
				</li>
                );
                var currentindex = $('li').last().index();
                <?php $c2->insert(array(
                        'index' => ?>currentindex<?php ,
                        'imageid' => ?>currentid<?php
                        ));?>
            }
        </script>
	</head>
	
	<body>
		<div class="container">
            <button action="Javascript:update();" />
			<ul id="sortable">
				<?php
				foreach($questions as $q){
					?>
					<li class="ui-state-default" id="<?php echo $q['_id']; ?>">
						<a href="viewer.php?id=<?php echo $q['imageid'];?>" >
						<img src="http://localhost:81/tile.php?image=<?php echo $q['imageid'];?>&name=t.jpg" />
						</a>
						Text
					</li>
					<?php
				}
				?>
			</ul>
			<div class="table">
				<?php
				foreach($img as $i){
					?>
					<div class="qelement" id="<?php echo $i['_id'];?>" >
						<img src="http://localhost:81/tile.php?image=<?php echo $i['_id'];?>&name=t.jpg" alt="Image" />
						Text
					</div>
					<?php
				}
				?>
			</div>
		</div>
	</body>

</html>