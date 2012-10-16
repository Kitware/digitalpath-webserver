

<?php

//header('Location: lessonmaker.php');
$lessonid = $_GET['lid'];
$imgid = $_GET['image'];

$m = new Mongo();
$d = $m->selectDB("demo");
$c2 = $d->selectCollection("lessons");
$c3 = $d->selectCollection("questions");

$id = new MongoId();

$c3->insert(array(
        'imageid'=>$imgid,
        'qid'=>$id,
        'type'=>'note'
        ));

$c2->update(array('_id'=>new MongoId($lessonid)), array('$push'=>array('questions'=>$id)), true);

echo json_encode($id);

?>