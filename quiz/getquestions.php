

<?php

$lessonid = $_GET['lid'];

$m = new Mongo();
$d = $m->selectDB("demo");
$c2 = $d->selectCollection("lessons");
$c3 = $d->selectCollection("questions");

$lesson = $c2->findOne(array('_id'=>new MongoId($lessonid)));
$qidArray = array();

/*if(!isset($lesson['questions'])){
    $length = 0;
} else {
    $length = count($lesson['questions']);
}*/

for($n = 0; $n < count($lesson['questions']); $n++){
    $question = $c3->findOne(array('qid'=>$lesson['questions'][$n]));
    array_push($qidArray, $question);
}

/*or($i = 0; $i < $length; $i++){
    $question = $c3->findOne(array('qid'=>$lesson['questions'][$i]));
    array_push($qidArray, $question);
}*/

echo json_encode($qidArray);
?>