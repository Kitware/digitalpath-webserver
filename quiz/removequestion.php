

<?php

$qid = $_GET['id'];
$lessonid = $_GET['lid'];

$m = new Mongo();
$d = $m->selectDB("demo");
$c2 = $d->selectCollection("lessons");
$c3 = $d->selectCollection("questions");

/*$lesson = $c2->findOne(array("lessonid"=>new MongoId($lessonid)));

$new = array();

for($i = 0; $i < $lesson['questions']; $i++){
    array_push($new, $lesson['questions'][$i]);
}

$i = 0;

while($new[$i] != new MongoId($qid) && $i < count($new)){
    $i++;
}

while($i < count($new) - 1){
    $new[$i] = $new[$i + 1];
    $i++;
}

array_pop($new);



echo json_encode(count($new));*/

$c2->update(array('_id'=>new MongoId($lessonid)), array('$pull'=>array('questions'=>new MongoId($qid))));

$c3->remove(array('qid'=>new MongoId($qid)));

?>