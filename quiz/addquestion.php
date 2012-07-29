

<?php

//header('Location: lessonmaker.php');

$imgid = $_GET['image'];
$index = $_GET['index'];

$m = new Mongo();
$d = $m->selectDB("demo");
$c2 = $d->selectCollection("lesson");
$c3 = $d->selectCollection("questions");

$id = new MongoId();

$c3->insert(array(
        'imageid'=>$imgid,
        '_id'=>$id
        ));

$c2->insert(array(
        'index'=>$index,
        'qid'=>$id
        ));
        
echo $id;

?>