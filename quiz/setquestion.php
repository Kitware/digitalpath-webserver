

<?php

$id = $_GET['qid'];
$qtext = $_POST['qtext'];
$choices = $_POST['choices'];

$m = new Mongo();
$d = $m->selectDb('demo');
$c3 = $d->selectCollection('questions');

//$mod = $c3->find(array('_id'=>new MongoId($id)));

//$mod['qtext'] = $qtext;
//$mod['choices'] = $choices;

//$imgid = $c3->findOne(array('_id'=>new MongoId($id)), array('imageid'=>1));

$c3->update(array('_id'=>new MongoId($id)), array('$set'=>array('qtext'=>$qtext, 'choices'=>$choices)), true);

?>