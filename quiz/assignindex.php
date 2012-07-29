

<?php

$index = $_GET['index'];
$qid = $_GET['qid'];

$m = new Mongo();
$d = $m->selectDb('demo');
$c2 = $d->selectCollection("lesson");

$c2->update(array('index'=>$index),array('$set'=>array(
        'qid'=>$qid
        )));

?>