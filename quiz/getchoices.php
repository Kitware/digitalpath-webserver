

<?php

$id = $_GET['id'];

$m = new Mongo();
$d = $m->selectDB("demo");
$c2 = $d->selectCollection("lesson");
$c3 = $d->selectCollection("questions");

$question = $c3->findOne(array('qid'=>$id));
$qarray = array();

array_push($qarray, $question['qtext']);

foreach($question['choices'] as $q){
    array_push($qarray, $q);
}
        
echo json_encode($qarray);
?>