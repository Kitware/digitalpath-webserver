

<?php

$label = $_GET['label'];
$qtext = $_POST['question'];
$choices = $_POST['answers'];
$return = $_GET['add'];

//We get the label for the image to be associated with the question,
//the text prompt for the question,
//the array of answer choices,
//And whether to add a new answer choice.

$m = new Mongo();
$d = $m->selectDB("demo");
$c = $d->selectCollection('lessons');

$c->update(array('imageid'=>new MongoId($label)), array('$set'=>array('qtext'=>$qtext,)), true);
$c->update(array('imageid'=>new MongoId($label)), array('$set'=>array('choices'=>$choices)), true);

$question = $c->findOne(array('imageid'=>new MongoId($label)));

if($return == 1){//If we specified that a new answer choice be created, then specify that numchoices increases by 1.
    $numchoices = count($question['choices'])+1;
    header("Location: questionform.php?label=".$label."&numchoices=".$numchoices);
} else {//Redirect to the lessonmaker page.
    header("Location: lessonmaker.php");
}

?>