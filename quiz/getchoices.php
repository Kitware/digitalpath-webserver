

<?php

$id = $_GET['id'];

$m = new Mongo();
$d = $m->selectDB("demo");
$c2 = $d->selectCollection("lesson");
$c3 = $d->selectCollection("questions");

$id = new MongoId();

$cursor = $c2->find(array(), array())->sort(array('index'=>1));
$question = $c3->findOne(
$qidArray = array();

foreach($cursor as $q){
    $question = $c3->findOne(array("_id"=>new MongoId($q['qid'])));
    array_push($qidArray, $question);
}
        
echo json_encode($qidArray);
?>