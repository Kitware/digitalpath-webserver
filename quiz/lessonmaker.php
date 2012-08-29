<?php

$lessonid = $_GET['lid'];//THIS IS A STRING

$m = new Mongo();
$d = $m->selectDB("demo");
$c1 = $d->selectCollection("images");
$c2 = $d->selectCollection("lessons");
$c3 = $d->selectCollection("questions");

$img = $c1->find();

/*
DOCUMENTATION:
Collection 'lessons':
    'lessonid' MONGOID
    'name'
    array 'questions'(
        'qid' - question ID.  MONGOID.
Collection 'questions':
    'qid' - question ID.  MONGOID
    'title'
    'imageid'
    'qtext'
    array 'choices'(
        choice 1 text,
        choice 2 text,
        choice 3 text,
        ...
        )
    array 'annotations'(
        annotation 1 - array(
            type
            other
            )
        annotation 2 - array(
            type
            other
            )
        )
    
    WE GIVE IMAGEID'S TO THE ID ATTRIBUTES OF TABLE ELEMENTS, AND QUESTION ID'S
    TO THE ID ATTRIBUTES OF LIST ELEMENTS.
    
    To start, the 'table' div
        - iterates over the 'images' collection
        - takes the imageid of each image found
        - assigns it to the id attribute of each table div element
    
    addquestion.php
        - takes an imageid(obtained from the id attribute of the clicked table div) and the lesson ID
        - is called when a table element is clicked
        - it 1) creates a new question ID, 2) creates a new db.questions element
            with qid = the new ID and imageid = the provided imageid, 3)
            pushes the new ID into the array in the document marked by the lesson id,
            and 4) returns a js version of the new ID.
        - THE CALLING FUNCTION:
            - gets the imageid of the image associated with the clicked div
            - calls the page.
            - creates a list element with id attribute equal to the returned question ID
            - passes the returned question ID to the viewer.php link
            - passes the imageid to the tile.php page
            - passes the question id to the deleteQuestion() function
            
    
    getquestions.php
        - takes the lesson ID
        - iterates over the 'lesson' array
        - for each question ID it finds, it requests the entire question from the 'questions'
            collection and inserts it into an array
        - returns the array.
        - THE CALLING FUNCTION:
            - is executed once on page load
            - parses the returned array into a format Javascript can read
            - iterates over the returned array
            - for each *question*, it 1) finds the question ID in string form, 2) finds the associated imageid
                3) creates a list element with id attribute equal to the found question ID
                4) passes the returned question ID to the viewer.php link 5) passes the imageid
                to the tile.php page 6) passes the question ID to the deleteQuestion() function.
    
    deleteQuestion()
        - takes one question ID parameter, in non-mongoid form
        - removes the list element with id attribute equal to the ID parameter
        - passes the question ID parameter to the removequestion.php page
        - calls saveLesson().
        
    removequestion.php
        - takes a un-mongoid-ed version of a question ID
        - finds the question in the list with the ID
        - THE CALLING FUNCTION:
            -
    
    assignindex.php
        - takes an index number and a non-mongoId-ed question ID to assign to the index.
        - THE CALLING FUNCTION:
            - takes the id attributes of all the currently existing list elements
            - puts them into an array, in order of ascending index
            - calls assignindex.php once for each index-question id pair
    
    viewer.php
        -takes a question ID
    
    
*/

?>

<!DOCTYPE html>
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
        <script type="text/javascript" src="lessonmaker.js"></script>
    </head>
	
	<body onload='init(<?php echo json_encode($lessonid);?>);'>
		<div class="container">
            <div class="qlist" >
            <!--<button onclick="saveLesson();" style="width:100%;" >Save</button>-->
                <ul id="sortable">
                </ul>
            </div>
			<div class="table">
				<?php
				foreach($img as $i){
                ?>
					<div class="qelement" id="<?php echo $i['_id'];?>" >
                        <a href="viewerSansEditor.php?id=<?php echo $i['_id'];?>" >
                            <img src="http://localhost:81/tile.php?image=<?php echo $i['_id'];?>&name=t.jpg" alt="Image" />
                        </a>
                        <button type="button" class="add" onclick="addquestion('<?php echo $i['_id'];?>');" >Add</button>
                        <?php echo substr($i['name'], 0, 10);?>
					</div>
					<?php
				}
				?>
			</div>
		</div>
	</body>

</html>