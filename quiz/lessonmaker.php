<!DOCTYPE html>

<?php

$m = new Mongo();
$d = $m->selectDB("demo");
$c1 = $d->selectCollection("images");
$c2 = $d->selectCollection("lesson");
$c3 = $d->selectCollection("questions");

$img = $c1->find();
$qlist = $c2->find()->sort(array("index"=>1));

/*
DOCUMENTATION:
Collection 'lesson':
    'index'
    'qid'
Collection 'questions':
    '_id' - question ID
    'imageid'
    'qtext'
    array(
        choice 1 text
        choice 2 text
        choice 3 text
        ...
        )
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
        </style>
        <script type="text/javascript">

        function saveLesson () {
            var result = $('#sortable').sortable('toArray');
            for(var i=0; i<result.length; i++){
                $.ajax({url:"assignindex.php?index="+i+"&qid="+result[i]});
            }
        }

        $(document).ready(function() {
            $(function() {
                $("#sortable").sortable();
                $("#sortable").disableSelection();
            });
            $(function() {
                $('ul#sortable').sortable({
                /*start: function(event, ui) {
                    alert("start");
                },*/
                update: function(event, ui) {
                    var end_pos = $(ui.item).index();
                    //alert(end_pos);
                }
                });
            });
            
            $(".qelement").click(function() {
                var currentid = $(this).attr('id');
                var currentindex = $('li').last().index()+1;
                $.ajax({url:"addquestion.php?image="+currentid+"&index="+currentindex, success:function(qid){
                    var liststring = '<li class="ui-state-default" id='+qid+'><a href="widget-test.php?id='+
                        currentid+'" ><img src="http://localhost:81/tile.php?image='+
                        currentid+'&name=t.jpg" /></a>Text</li>';
                    $('ul').append(liststring);
                }});
            });
        
            // Populate the lesson questions.
            $.ajax({url:"getquestions.php", success:function(qidList){
                var obj = jQuery.parseJSON(qidList);
                for (var i = 0; i < obj.length; ++i) {
                    var qid = obj[i]._id.$id;
                    var imageId = obj[i].imageid;
                    var liststring = '<li class="ui-state-default" id='+qid+'><a href="widget-test.php?id='+
                        imageId+'" ><img src="http://localhost:81/tile.php?image='+
                        imageId+'&name=t.jpg" /></a>Text</li>';
                    $('ul').append(liststring);    
                }
            }});            
        });
        </script>
	</head>
	
	<body>
		<div class="container">
            <div class="qlist" >
            <button onclick="saveLesson();" style="width:100%;" >Save</button>
                <ul id="sortable">
                </ul>
            </div>
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
